import { Link } from "react-router-dom";
import DashboardLoadingState from "@/components/dashboard/DashboardLoadingState";
import DashboardShell from "@/components/dashboard/DashboardShell";
import EmptyState from "@/components/dashboard/EmptyState";
import StatusBadge from "@/components/dashboard/StatusBadge";
import { useClientDashboard } from "@/contexts/ClientDashboardContext";

export default function ChecklistPage() {
  const { workspace, loading } = useClientDashboard();

  return (
    <DashboardShell title="Checklist & Next Steps" subtitle="A clear, simple task list so you always know what to do next and what is already complete.">
      <section className="card-theme p-6">
        {loading || !workspace ? (
          <DashboardLoadingState cards={2} lines={3} />
        ) : workspace.checklistItems.length ? (
          <div className="space-y-3">
            {workspace.checklistItems.map((item) => (
              <div key={item.id} className="card-theme-soft p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="body-sm">{item.title}</p>
                    <p className="caption text-muted-green mt-2">{item.description}</p>
                    {item.dueDate && <p className="caption text-muted-green mt-2">Due: {item.dueDate}</p>}
                  </div>
                  <StatusBadge status={item.status} />
                </div>
                {item.actionPath && item.actionLabel && (
                  <Link to={item.actionPath} className="btn-outline-theme inline-flex text-sm py-2 px-4 mt-4">
                    {item.actionLabel}
                  </Link>
                )}
              </div>
            ))}
          </div>
        ) : (
          <EmptyState title="Nothing is waiting on you right now" description="As soon as the next step is ready, it will appear here with a clear action." />
        )}
      </section>
    </DashboardShell>
  );
}
