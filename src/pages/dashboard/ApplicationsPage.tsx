import { Link } from "react-router-dom";
import DashboardLoadingState from "@/components/dashboard/DashboardLoadingState";
import DashboardShell from "@/components/dashboard/DashboardShell";
import EmptyState from "@/components/dashboard/EmptyState";
import StatusBadge from "@/components/dashboard/StatusBadge";
import { useClientDashboard } from "@/contexts/ClientDashboardContext";
import PaginationControls from "@/components/PaginationControls";
import { usePagination } from "@/hooks/usePagination";

export default function ApplicationsPage() {
  const { workspace, loading } = useClientDashboard();
  const items = workspace?.applications ?? [];
  const { paginatedItems, currentPage, totalPages, pageSize, totalItems, setPage, setPageSize } = usePagination(items, {
    defaultPageSize: 6,
  });

  return (
    <DashboardShell
      title="My Applications"
      subtitle="See every visa, study abroad, consultation, and travel support request in one simple timeline."
    >
      {loading || !workspace ? (
        <DashboardLoadingState cards={3} lines={2} />
      ) : workspace.applications.length ? (
        <div className="space-y-4">
          {paginatedItems.map((application) => (
            <article key={application.id} className="card-theme p-5 md:p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="max-w-3xl">
                  <p className="caption text-accent-gold uppercase tracking-wide">{application.sourceType.replaceAll("-", " ")}</p>
                  <h2 className="heading-sm mt-2">{application.title}</h2>
                  <p className="body-sm text-muted-green mt-2">
                    {application.destination ? `${application.destination} | ` : ""}
                    Submitted {new Date(application.submittedAt).toLocaleDateString()} | Last updated {new Date(application.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                <StatusBadge status={application.status} />
              </div>
              <div className="grid lg:grid-cols-[1fr_auto] gap-4 mt-5 items-end">
                <div>
                  <p className="label-text">Current stage</p>
                  <p className="body-sm text-muted-green mt-2">{application.currentStage}</p>
                  {application.nextRequiredAction && <p className="body-sm mt-3">{application.nextRequiredAction}</p>}
                </div>
                <Link to={`/dashboard/applications/${application.id}`} className="btn-outline-theme text-sm py-2 px-4 inline-flex justify-center">
                  Open details
                </Link>
              </div>
            </article>
          ))}
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={totalItems}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        </div>
      ) : (
        <EmptyState title="Nothing here yet" description="When you submit a visa, study abroad, consultation, or travel request, it will appear here with its current stage and next action." />
      )}
    </DashboardShell>
  );
}
