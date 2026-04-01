import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";
import AdminShell from "@/components/admin/AdminShell";
import EmptyState from "@/components/dashboard/EmptyState";
import { useAdminDashboard } from "@/contexts/AdminDashboardContext";

export default function AdminLeadDetailPage() {
  const { leadId = "" } = useParams();
  const { workspace, loading, saveLead } = useAdminDashboard();
  const lead = useMemo(() => workspace?.leads.find((item) => item.id === leadId) ?? null, [leadId, workspace]);
  const [notes, setNotes] = useState(lead?.internalNotes ?? "");
  const [assignedStaffId, setAssignedStaffId] = useState(lead?.assignedStaffId ?? "");

  async function handleSave() {
    if (!lead) return;
    await saveLead(lead.id, { internalNotes: notes, assignedStaffId: assignedStaffId || undefined });
    toast.success("Lead details updated.");
  }

  return (
    <AdminShell title="Lead Detail" subtitle="Review the full enquiry, assign it to the right person, and capture internal notes for follow-up.">
      {loading || !workspace ? (
        <div className="card-theme p-6 body-md text-muted-green">Loading lead...</div>
      ) : !lead ? (
        <EmptyState title="Lead not found" description="We could not find that enquiry record." />
      ) : (
        <div className="space-y-6">
          <section className="card-theme p-6">
            <p className="caption text-accent-gold uppercase tracking-wide">{lead.source}</p>
            <h2 className="heading-md mt-2">{lead.fullName}</h2>
            <p className="body-sm text-muted-green mt-2">{lead.email} {lead.phone ? `| ${lead.phone}` : ""}</p>
            <p className="body-md mt-4">{lead.message}</p>
          </section>

          <section className="grid xl:grid-cols-[0.8fr_1.2fr] gap-6">
            <div className="card-theme p-6">
              <h3 className="heading-sm mb-4">Operational fields</h3>
              <div className="space-y-4">
                <div>
                  <label className="label-text mb-1 block">Lead status</label>
                  <select className="w-full rounded-lg border border-theme bg-surface-soft px-4 py-3" value={lead.status} onChange={(event) => void saveLead(lead.id, { status: event.target.value as never })}>
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="awaiting-documents">Awaiting documents</option>
                    <option value="in-progress">In progress</option>
                    <option value="closed">Closed</option>
                    <option value="lost">Lost</option>
                  </select>
                </div>
                <div>
                  <label className="label-text mb-1 block">Priority</label>
                  <select className="w-full rounded-lg border border-theme bg-surface-soft px-4 py-3" value={lead.priority} onChange={(event) => void saveLead(lead.id, { priority: event.target.value as never })}>
                    <option value="low">Low priority</option>
                    <option value="medium">Medium priority</option>
                    <option value="high">High priority</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="label-text mb-1 block">Assigned staff</label>
                  <select className="w-full rounded-lg border border-theme bg-surface-soft px-4 py-3" value={assignedStaffId} onChange={(event) => setAssignedStaffId(event.target.value)}>
                    <option value="">Unassigned</option>
                    {workspace.adminUsers.map((item) => <option key={item.id} value={item.id}>{item.fullName}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="card-theme p-6">
              <h3 className="heading-sm mb-4">Internal notes</h3>
              <label className="label-text mb-1 block">Notes</label>
              <textarea className="w-full rounded-lg border border-theme bg-surface-soft px-4 py-3" rows={8} value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Capture call notes, next steps, pricing context, or document reminders." />
              <div className="mt-4 flex flex-wrap gap-3">
                <button className="btn-accent" type="button" onClick={() => void handleSave()}>Save notes</button>
                <Link to="/admin/applications" className="btn-outline-theme">Convert via applications</Link>
              </div>
            </div>
          </section>
        </div>
      )}
    </AdminShell>
  );
}
