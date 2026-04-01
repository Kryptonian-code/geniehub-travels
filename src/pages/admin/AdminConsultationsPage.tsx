import { useState } from "react";
import { toast } from "sonner";
import AdminShell from "@/components/admin/AdminShell";
import DashboardLoadingState from "@/components/dashboard/DashboardLoadingState";
import EmptyState from "@/components/dashboard/EmptyState";
import PaginationControls from "@/components/PaginationControls";
import { useAdminDashboard } from "@/contexts/AdminDashboardContext";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { usePagination } from "@/hooks/usePagination";

export default function AdminConsultationsPage() {
  const { workspace, loading, updateConsultation, saveConsultationMeta } = useAdminDashboard();
  const { runAction, isPending } = useAsyncAction();
  const [notes, setNotes] = useState<Record<string, string>>({});
  const items = workspace?.consultations ?? [];
  const { paginatedItems, currentPage, totalPages, pageSize, totalItems, setPage, setPageSize } = usePagination(items, {
    defaultPageSize: 8,
  });

  async function handleStatusChange(consultationId: string, status: string) {
    try {
      await runAction(`consultation-${consultationId}`, () => updateConsultation(consultationId, status as never));
      const messageMap: Record<string, string> = {
        confirmed: "Consultation confirmed successfully.",
        rescheduled: "Consultation rescheduled successfully.",
        completed: "Consultation marked as completed.",
        cancelled: "Consultation cancelled successfully.",
        pending: "Consultation status updated.",
      };
      toast.success(messageMap[status] ?? "Consultation status updated.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update consultation.");
    }
  }

  async function handleSaveNotes(consultationId: string) {
    try {
      await runAction(`consultation-notes-${consultationId}`, () =>
        saveConsultationMeta(consultationId, {
          adminNotes: notes[consultationId],
          clientVisibleNote: notes[consultationId],
        }),
      );
      toast.success("Consultation notes saved successfully.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save consultation notes.");
    }
  }

  return (
    <AdminShell title="Consultations" subtitle="Confirm, reschedule, complete, or cancel consultations while keeping internal notes and client-visible notes organized.">
      {loading || !workspace ? (
        <DashboardLoadingState cards={2} lines={3} />
      ) : workspace.consultations.length ? (
        <div className="space-y-4">
          {paginatedItems.map((booking) => (
            <div key={booking.id} className="card-theme p-5">
              <div className="grid xl:grid-cols-[1.1fr_0.9fr_auto] gap-4">
                <div>
                  <p className="body-sm">{booking.name}</p>
                  <p className="caption text-muted-green mt-1">{booking.service} | {booking.date} | {booking.time} | {booking.meetingType}</p>
                  {booking.notes && <p className="caption text-muted-green mt-2">{booking.notes}</p>}
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="label-text mb-1 block">Status</label>
                    <select className="field-theme" value={booking.status} disabled={isPending(`consultation-${booking.id}`)} onChange={(event) => void handleStatusChange(booking.id, event.target.value)}>
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="rescheduled">Rescheduled</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                  <div>
                    <label className="label-text mb-1 block">Consultation notes</label>
                    <textarea className="field-theme" rows={3} value={notes[booking.id] ?? ""} onChange={(event) => setNotes((current) => ({ ...current, [booking.id]: event.target.value }))} placeholder="Add internal or client-visible notes." />
                  </div>
                </div>
                <button className="btn-accent" type="button" disabled={isPending(`consultation-notes-${booking.id}`)} onClick={() => void handleSaveNotes(booking.id)}>
                  {isPending(`consultation-notes-${booking.id}`) ? "Saving..." : "Save notes"}
                </button>
              </div>
            </div>
          ))}
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={totalItems}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            pageSizeOptions={[8, 16, 32, 64]}
          />
        </div>
      ) : (
        <EmptyState title="No consultations yet" description="Client consultation bookings will be listed here for the team to manage." />
      )}
    </AdminShell>
  );
}
