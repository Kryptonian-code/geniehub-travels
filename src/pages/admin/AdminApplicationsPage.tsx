import { Link } from "react-router-dom";
import AdminShell from "@/components/admin/AdminShell";
import DashboardLoadingState from "@/components/dashboard/DashboardLoadingState";
import EmptyState from "@/components/dashboard/EmptyState";
import { useAdminDashboard } from "@/contexts/AdminDashboardContext";

export default function AdminApplicationsPage() {
  const { workspace, loading } = useAdminDashboard();

  return (
    <AdminShell title="Applications" subtitle="Track all client workflows in one place and drill into the linked documents, payments, notes, and updates behind each case.">
      {loading || !workspace ? (
        <DashboardLoadingState cards={3} lines={2} />
      ) : workspace.applications.length ? (
        <div className="space-y-4">
          {workspace.applications.map((application) => (
            <article key={application.id} className="card-theme p-5">
              <div className="grid xl:grid-cols-[1.2fr_0.7fr_auto] gap-4 items-start">
                <div>
                  <p className="caption text-accent-gold uppercase tracking-wide">{application.serviceType.replaceAll("-", " ")}</p>
                  <h2 className="heading-sm mt-2">{application.clientName}</h2>
                  <p className="caption text-muted-green mt-2">{application.clientEmail} {application.destination ? `| ${application.destination}` : ""}</p>
                  <p className="body-sm mt-3">{application.currentStage}</p>
                </div>
                <div className="card-theme-soft p-4">
                  <p className="caption text-muted-green uppercase tracking-wide">Status</p>
                  <p className="body-sm mt-2">{application.status.replaceAll("-", " ")}</p>
                  <p className="caption text-muted-green mt-2">Updated {new Date(application.updatedAt).toLocaleDateString()}</p>
                </div>
                <Link to={`/admin/applications/${application.id}`} className="btn-outline-theme text-sm py-2 px-4 inline-flex justify-center">Open detail</Link>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState title="No applications yet" description="Applications linked to visas, tours, consultations, and support services will appear here." />
      )}
    </AdminShell>
  );
}
