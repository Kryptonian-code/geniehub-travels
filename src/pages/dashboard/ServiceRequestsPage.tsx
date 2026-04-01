import { FormEvent, useState } from "react";
import { toast } from "sonner";
import DashboardLoadingState from "@/components/dashboard/DashboardLoadingState";
import DashboardShell from "@/components/dashboard/DashboardShell";
import EmptyState from "@/components/dashboard/EmptyState";
import StatusBadge from "@/components/dashboard/StatusBadge";
import { useAuth } from "@/contexts/AuthContext";
import { useClientDashboard } from "@/contexts/ClientDashboardContext";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useDestinationOptions } from "@/lib/destinationOptions";
import type { ServiceRequest } from "@/lib/types";

const requestTypes: ServiceRequest["requestType"][] = [
  "flight-booking-support",
  "hotel-booking-support",
  "sop-assistance",
  "visa-assistance",
  "travel-package-quote",
  "document-review-help",
  "dependent-visa-support",
  "study-abroad-application",
];

export default function ServiceRequestsPage() {
  const { user } = useAuth();
  const { workspace, loading, createServiceRequest } = useClientDashboard();
  const { runAction, isPending } = useAsyncAction();
  const { options: destinationOptions } = useDestinationOptions(["travel", "tour", "visa", "study-abroad"]);
  const [form, setForm] = useState({
    requestType: "flight-booking-support" as ServiceRequest["requestType"],
    destination: "",
    travelDate: "",
    budget: "",
    travellers: "1",
    urgency: "standard" as "standard" | "priority" | "urgent",
    notes: "",
  });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) return;
    try {
      await runAction("service-request", () => createServiceRequest({ userId: user.id, ...form }));
      toast.success("Service request submitted.");
      setForm({
        requestType: "flight-booking-support",
        destination: "",
        travelDate: "",
        budget: "",
        travellers: "1",
        urgency: "standard",
        notes: "",
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not submit service request.");
    }
  }

  return (
    <DashboardShell title="Service Requests" subtitle="Ask for additional support like flights, hotels, SOP help, visa assistance, or study abroad application help.">
      <div className="grid xl:grid-cols-[0.95fr_1.05fr] gap-6">
        <section className="card-theme p-6">
          <h2 className="heading-sm mb-4">Request extra support</h2>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="label-text mb-1 block">Request type</label>
              <select aria-label="Request type" className="field-theme" value={form.requestType} onChange={(event) => setForm((current) => ({ ...current, requestType: event.target.value as ServiceRequest["requestType"] }))}>
                {requestTypes.map((item) => <option key={item} value={item}>{item.replaceAll("-", " ")}</option>)}
              </select>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="label-text mb-1 block">Destination</label>
                <select aria-label="Destination" className="field-theme" value={form.destination} onChange={(event) => setForm((current) => ({ ...current, destination: event.target.value }))}>
                  <option value="">Select a destination</option>
                  {destinationOptions.map((item) => <option key={item.id} value={item.name}>{item.name}</option>)}
                </select>
              </div>
              <div>
                <label className="label-text mb-1 block">Travel date</label>
                <input aria-label="Travel date" type="date" className="field-theme" value={form.travelDate} onChange={(event) => setForm((current) => ({ ...current, travelDate: event.target.value }))} />
              </div>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="label-text mb-1 block">Budget</label>
                <input aria-label="Budget" className="field-theme" placeholder="Example: GHS 15,000" value={form.budget} onChange={(event) => setForm((current) => ({ ...current, budget: event.target.value }))} />
              </div>
              <div>
                <label className="label-text mb-1 block">Travellers</label>
                <input aria-label="Travellers" className="field-theme" placeholder="Example: 2" value={form.travellers} onChange={(event) => setForm((current) => ({ ...current, travellers: event.target.value }))} />
              </div>
              <div>
                <label className="label-text mb-1 block">Urgency</label>
                <select aria-label="Urgency" className="field-theme" value={form.urgency} onChange={(event) => setForm((current) => ({ ...current, urgency: event.target.value as "standard" | "priority" | "urgent" }))}>
                  <option value="standard">Standard</option>
                  <option value="priority">Priority</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>
            <div>
              <label className="label-text mb-1 block">Notes</label>
              <textarea aria-label="Notes" className="field-theme" rows={4} value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} placeholder="Explain what support you need and any deadlines we should know." />
            </div>
            <button className="btn-accent" type="submit" disabled={isPending("service-request")}>
              {isPending("service-request") ? "Submitting..." : "Submit request"}
            </button>
          </form>
        </section>

        <section className="card-theme p-6">
          <h2 className="heading-sm mb-4">Submitted requests</h2>
          {loading || !workspace ? (
            <DashboardLoadingState cards={2} lines={3} />
          ) : workspace.serviceRequests.length ? (
            <div className="space-y-3">
              {workspace.serviceRequests.map((request) => (
                <div key={request.id} className="card-theme-soft p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="body-sm">{request.requestType.replaceAll("-", " ")}</p>
                      <p className="caption text-muted-green mt-1">
                        {request.destination ? `${request.destination} | ` : ""}
                        {request.travelDate ? `${request.travelDate} | ` : ""}
                        {request.urgency}
                      </p>
                    </div>
                    <StatusBadge status={request.status} />
                  </div>
                  {request.notes && <p className="caption text-muted-green mt-3">{request.notes}</p>}
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="Nothing here yet" description="Use this page whenever you need extra help beyond your main application." />
          )}
        </section>
      </div>
    </DashboardShell>
  );
}
