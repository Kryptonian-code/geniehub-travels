import { Link } from "react-router-dom";
import AdminShell from "@/components/admin/AdminShell";
import EmptyState from "@/components/dashboard/EmptyState";
import { useAdminDashboard } from "@/contexts/AdminDashboardContext";

export default function AdminClientsPage() {
  const { workspace, loading } = useAdminDashboard();

  return (
    <AdminShell title="Clients" subtitle="See client profiles, linked activity, and relationship context at a glance before you open a case or reply.">
      {loading || !workspace ? (
        <div className="card-theme p-6 body-md text-muted-green">Loading clients...</div>
      ) : workspace.clients.length ? (
        <div className="grid xl:grid-cols-2 gap-4">
          {workspace.clients.map((client) => (
            <div key={client.id} className="card-theme p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="heading-sm">{client.profile.fullName}</h2>
                  <p className="caption text-muted-green mt-1">{client.profile.email} {client.profile.phone ? `| ${client.profile.phone}` : ""}</p>
                </div>
                <Link to="/admin/applications" className="btn-outline-theme text-sm py-2 px-4">Open workflows</Link>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-5">
                <div className="card-theme-soft p-4"><p className="caption text-muted-green">Applications</p><p className="body-sm mt-2">{client.applicationsCount}</p></div>
                <div className="card-theme-soft p-4"><p className="caption text-muted-green">Documents</p><p className="body-sm mt-2">{client.documentsCount}</p></div>
                <div className="card-theme-soft p-4"><p className="caption text-muted-green">Payments</p><p className="body-sm mt-2">{client.paymentsCount}</p></div>
                <div className="card-theme-soft p-4"><p className="caption text-muted-green">Consultations</p><p className="body-sm mt-2">{client.consultationsCount}</p></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState title="No clients yet" description="Client accounts will populate here once registrations and service workflows begin." />
      )}
    </AdminShell>
  );
}
