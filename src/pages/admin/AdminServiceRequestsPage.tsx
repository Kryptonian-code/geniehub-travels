import { useState } from "react";
import AdminShell from "@/components/admin/AdminShell";
import EmptyState from "@/components/dashboard/EmptyState";
import { useAdminDashboard } from "@/contexts/AdminDashboardContext";

export default function AdminServiceRequestsPage() {
  const { workspace, loading, updateServiceRequest, saveServiceRequestMeta } = useAdminDashboard();
  const [notes, setNotes] = useState<Record<string, string>>({});

  return (
    <AdminShell title="Service Requests" subtitle="Review extra support requests, assign them quickly, and move each one through the right operational status.">
      {loading || !workspace ? (
        <div className="card-theme p-6 body-md text-muted-green">Loading service requests...</div>
      ) : workspace.serviceRequests.length ? (
        <div className="space-y-4">
          {workspace.serviceRequests.map((request) => (
            <div key={request.id} className="card-theme p-5">
              <div className="grid xl:grid-cols-[1.1fr_0.9fr_auto] gap-4">
                <div>
                  <p className="body-sm">{request.requestType.replaceAll("-", " ")}</p>
                  <p className="caption text-muted-green mt-1">{request.destination ?? "No destination"} {request.travelDate ? `| ${request.travelDate}` : ""}</p>
                  <p className="caption text-muted-green mt-2">{request.notes ?? "No additional notes yet."}</p>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="label-text mb-1 block">Status</label>
                    <select className="w-full rounded-lg border border-theme bg-surface-soft px-4 py-3" value={request.status} onChange={(event) => void updateServiceRequest(request.id, { status: event.target.value as never })}>
                      <option value="received">Received</option>
                      <option value="in-review">In review</option>
                      <option value="awaiting-client-response">Awaiting client response</option>
                      <option value="processed">Processed</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                  <div>
                    <label className="label-text mb-1 block">Handling notes</label>
                    <textarea className="w-full rounded-lg border border-theme bg-surface-soft px-4 py-3" rows={3} value={notes[request.id] ?? ""} onChange={(event) => setNotes((current) => ({ ...current, [request.id]: event.target.value }))} placeholder="Capture internal handling notes." />
                  </div>
                </div>
                <button className="btn-accent" type="button" onClick={() => void saveServiceRequestMeta(request.id, { internalNotes: notes[request.id] })}>Save notes</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState title="No service requests yet" description="Extra support requests from clients will appear here for operations follow-up." />
      )}
    </AdminShell>
  );
}
