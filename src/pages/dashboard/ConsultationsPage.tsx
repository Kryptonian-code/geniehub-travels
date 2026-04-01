import { FormEvent, useState } from "react";
import { toast } from "sonner";
import DashboardLoadingState from "@/components/dashboard/DashboardLoadingState";
import DashboardShell from "@/components/dashboard/DashboardShell";
import EmptyState from "@/components/dashboard/EmptyState";
import StatusBadge from "@/components/dashboard/StatusBadge";
import { useAuth } from "@/contexts/AuthContext";
import { useClientDashboard } from "@/contexts/ClientDashboardContext";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { downloadConsultationCalendar } from "@/lib/calendar";
import type { ConsultationMode, ConsultationStatus } from "@/lib/types";

export default function ConsultationsPage() {
  const { user } = useAuth();
  const { workspace, loading, bookConsultation, updateConsultation } = useClientDashboard();
  const { runAction, isPending } = useAsyncAction();
  const [form, setForm] = useState({
    service: "Visa Application Support",
    date: "",
    time: "10:00 AM",
    meetingType: "online" as ConsultationMode,
    notes: "",
  });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) return;
    try {
      await runAction("book-consultation", () =>
        bookConsultation({
          userId: user.id,
          name: user.fullName,
          email: user.email,
          phone: user.phone ?? "",
          ...form,
        }),
      );
      toast.success("Consultation booked.");
      setForm({ service: "Visa Application Support", date: "", time: "10:00 AM", meetingType: "online", notes: "" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not book consultation.");
    }
  }

  async function quickUpdateStatus(consultationId: string, status: ConsultationStatus) {
    try {
      await runAction(`consultation-${consultationId}-${status}`, () => updateConsultation(consultationId, { status }));
      toast.success(
        status === "cancelled"
          ? "Consultation cancelled successfully."
          : status === "rescheduled"
            ? "Consultation reschedule request sent."
            : "Consultation updated successfully.",
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update consultation.");
    }
  }

  return (
    <DashboardShell title="Consultations" subtitle="Book a new session, track upcoming appointments, and manage the ones already linked to your account.">
      <div className="grid xl:grid-cols-[0.9fr_1.1fr] gap-6">
        <section className="card-theme p-6">
          <h2 className="heading-sm mb-4">Book a new consultation</h2>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="label-text mb-1 block">Service</label>
              <select className="field-theme" value={form.service} onChange={(event) => setForm((current) => ({ ...current, service: event.target.value }))}>
                <option>Visa Application Support</option>
                <option>Study Abroad Guidance</option>
                <option>Travel Planning Session</option>
                <option>Document Review</option>
              </select>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="label-text mb-1 block">Date</label>
                <input type="date" className="field-theme" value={form.date} onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))} />
              </div>
              <div>
                <label className="label-text mb-1 block">Time</label>
                <select className="field-theme" value={form.time} onChange={(event) => setForm((current) => ({ ...current, time: event.target.value }))}>
                  <option>9:00 AM</option>
                  <option>10:00 AM</option>
                  <option>11:00 AM</option>
                  <option>1:00 PM</option>
                  <option>2:00 PM</option>
                </select>
              </div>
            </div>
            <div>
              <label className="label-text mb-1 block">Meeting mode</label>
              <select className="field-theme" value={form.meetingType} onChange={(event) => setForm((current) => ({ ...current, meetingType: event.target.value as ConsultationMode }))}>
                <option value="in-person">In person</option>
                <option value="phone">Phone</option>
                <option value="online">Online</option>
              </select>
            </div>
            <div>
              <label className="label-text mb-1 block">Notes</label>
              <textarea className="field-theme" rows={4} value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} placeholder="Tell the team what you want to discuss." />
            </div>
            <button className="btn-accent" type="submit" disabled={isPending("book-consultation")}>
              {isPending("book-consultation") ? "Booking..." : "Book consultation"}
            </button>
          </form>
        </section>

        <section className="card-theme p-6">
          <h2 className="heading-sm mb-4">Your consultations</h2>
          {loading || !workspace ? (
            <DashboardLoadingState cards={2} lines={3} />
          ) : workspace.consultations.length ? (
            <div className="space-y-3">
              {workspace.consultations.map((consultation) => (
                <div key={consultation.id} className="card-theme-soft p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="body-sm">{consultation.service}</p>
                      <p className="caption text-muted-green mt-1">
                        {consultation.date} | {consultation.time} | {consultation.meetingType}
                      </p>
                    </div>
                    <StatusBadge status={consultation.status} />
                  </div>
                  {consultation.notes && <p className="caption text-muted-green mt-3">{consultation.notes}</p>}
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button type="button" className="btn-outline-theme py-2 px-3 text-sm" onClick={() => downloadConsultationCalendar(consultation)}>Add to calendar</button>
                    {consultation.status !== "cancelled" && consultation.status !== "completed" && (
                      <>
                        <button type="button" className="btn-outline-theme py-2 px-3 text-sm" disabled={isPending(`consultation-${consultation.id}-rescheduled`)} onClick={() => void quickUpdateStatus(consultation.id, "rescheduled")}>
                          {isPending(`consultation-${consultation.id}-rescheduled`) ? "Sending..." : "Request reschedule"}
                        </button>
                        <button type="button" className="btn-outline-theme py-2 px-3 text-sm" disabled={isPending(`consultation-${consultation.id}-cancelled`)} onClick={() => void quickUpdateStatus(consultation.id, "cancelled")}>
                          {isPending(`consultation-${consultation.id}-cancelled`) ? "Cancelling..." : "Cancel"}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="Nothing here yet" description="Book a consultation when you want the GenieHub team to review your plans and guide the next step." />
          )}
        </section>
      </div>
    </DashboardShell>
  );
}
