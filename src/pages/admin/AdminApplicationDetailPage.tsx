import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";
import AdminShell from "@/components/admin/AdminShell";
import EmptyState from "@/components/dashboard/EmptyState";
import { useAdminDashboard } from "@/contexts/AdminDashboardContext";
import type { AdminApplicationDetail } from "@/lib/adminTypes";

export default function AdminApplicationDetailPage() {
  const { applicationId = "" } = useParams();
  const { getApplicationDetail, saveApplication, addClientUpdate, workspace } = useAdminDashboard();
  const [application, setApplication] = useState<AdminApplicationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [internalNotes, setInternalNotes] = useState("");
  const [stage, setStage] = useState("");
  const [updateMessage, setUpdateMessage] = useState("");

  useEffect(() => {
    setLoading(true);
    getApplicationDetail(applicationId).then((result) => {
      setApplication(result);
      setInternalNotes(result.internalNotes ?? "");
      setStage(result.currentStage);
    }).finally(() => setLoading(false));
  }, [applicationId, getApplicationDetail]);

  async function handleSaveNotes() {
    if (!application) return;
    await saveApplication(application.id, {
      serviceType: application.serviceType,
      assignedStaffId: application.assignedStaffId,
      currentStage: stage,
      internalNotes,
      clientUpdates: application.clientUpdates,
      linkedChecklist: application.linkedChecklist,
    });
    toast.success("Application notes updated.");
  }

  async function handleClientUpdate() {
    if (!application || !updateMessage.trim()) return;
    await addClientUpdate(application.id, updateMessage.trim());
    setUpdateMessage("");
    const refreshed = await getApplicationDetail(application.id);
    setApplication(refreshed);
  }

  return (
    <AdminShell title="Application Detail" subtitle="Manage the operational side of the case while keeping the client-facing journey clear and reassuring.">
      {loading || !workspace ? (
        <div className="card-theme p-6 body-md text-muted-green">Loading application detail...</div>
      ) : !application ? (
        <EmptyState title="Application not found" description="We could not find that application record." />
      ) : (
        <div className="space-y-6">
          <section className="card-theme p-6">
            <p className="caption text-accent-gold uppercase tracking-wide">{application.serviceType.replaceAll("-", " ")}</p>
            <h2 className="heading-md mt-2">{application.clientName}</h2>
            <p className="caption text-muted-green mt-2">{application.clientEmail} {application.clientPhone ? `| ${application.clientPhone}` : ""}</p>
            <div className="grid md:grid-cols-2 gap-4 mt-5">
              <div>
                <label className="label-text mb-1 block">Current stage</label>
                <input className="w-full rounded-lg border border-theme bg-surface-soft px-4 py-3" value={stage} onChange={(event) => setStage(event.target.value)} />
              </div>
              <div>
                <label className="label-text mb-1 block">Assigned staff</label>
                <select className="w-full rounded-lg border border-theme bg-surface-soft px-4 py-3" value={application.assignedStaffId ?? ""} onChange={(event) => void saveApplication(application.id, { assignedStaffId: event.target.value || undefined, currentStage: stage, serviceType: application.serviceType, internalNotes, clientUpdates: application.clientUpdates, linkedChecklist: application.linkedChecklist })}>
                  <option value="">Unassigned</option>
                  {workspace.adminUsers.map((item) => <option key={item.id} value={item.id}>{item.fullName}</option>)}
                </select>
              </div>
            </div>
          </section>

          <section className="grid xl:grid-cols-[1fr_1fr] gap-6">
            <div className="card-theme p-6">
              <h3 className="heading-sm mb-4">Internal notes</h3>
              <textarea className="w-full rounded-lg border border-theme bg-surface-soft px-4 py-3" rows={8} value={internalNotes} onChange={(event) => setInternalNotes(event.target.value)} />
              <button className="btn-accent mt-4" type="button" onClick={() => void handleSaveNotes()}>Save case notes</button>
            </div>
            <div className="card-theme p-6">
              <h3 className="heading-sm mb-4">Client-facing updates</h3>
              <div className="space-y-3">
                {application.clientUpdates.map((item) => (
                  <div key={item.id} className="card-theme-soft p-4">
                    <p className="body-sm">{item.message}</p>
                    <p className="caption text-muted-green mt-2">{new Date(item.createdAt).toLocaleString()}</p>
                  </div>
                ))}
                {!application.clientUpdates.length && <EmptyState title="No client updates yet" description="Add a visible update so the client knows what is happening next." />}
              </div>
              <div className="mt-4">
                <label className="label-text mb-1 block">New client-facing update</label>
                <textarea className="w-full rounded-lg border border-theme bg-surface-soft px-4 py-3" rows={4} value={updateMessage} onChange={(event) => setUpdateMessage(event.target.value)} placeholder="Write the next client-facing update." />
              </div>
              <button className="btn-outline-theme mt-4" type="button" onClick={() => void handleClientUpdate()}>Add client update</button>
            </div>
          </section>

          <section className="grid xl:grid-cols-3 gap-6">
            <div className="card-theme p-6">
              <h3 className="heading-sm mb-4">Documents</h3>
              <div className="space-y-3">
                {application.linkedDocuments.map((item) => <div key={item.id} className="card-theme-soft p-4"><p className="body-sm">{item.fileName}</p><p className="caption text-muted-green mt-1">{item.status}</p></div>)}
              </div>
            </div>
            <div className="card-theme p-6">
              <h3 className="heading-sm mb-4">Payments</h3>
              <div className="space-y-3">
                {application.linkedPayments.map((item) => <div key={item.id} className="card-theme-soft p-4"><p className="body-sm">{item.currency} {item.amount.toLocaleString()}</p><p className="caption text-muted-green mt-1">{item.reference}</p></div>)}
              </div>
            </div>
            <div className="card-theme p-6">
              <h3 className="heading-sm mb-4">Consultations & checklist</h3>
              <div className="space-y-3">
                {application.linkedConsultations.map((item) => <div key={item.id} className="card-theme-soft p-4"><p className="body-sm">{item.service}</p><p className="caption text-muted-green mt-1">{item.date} | {item.time}</p></div>)}
                {application.linkedChecklist.map((item, index) => <div key={`${item}-${index}`} className="card-theme-soft p-4"><p className="body-sm">{item}</p></div>)}
              </div>
            </div>
          </section>

          <Link to="/admin/applications" className="btn-outline-theme inline-flex">Back to applications</Link>
        </div>
      )}
    </AdminShell>
  );
}
