import { Link } from "react-router-dom";
import { toast } from "sonner";
import DashboardLoadingState from "@/components/dashboard/DashboardLoadingState";
import DashboardShell from "@/components/dashboard/DashboardShell";
import EmptyState from "@/components/dashboard/EmptyState";
import { useClientDashboard } from "@/contexts/ClientDashboardContext";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import PaginationControls from "@/components/PaginationControls";
import { usePagination } from "@/hooks/usePagination";

export default function NotificationsPage() {
  const { workspace, loading, markNotificationRead, markAllRead } = useClientDashboard();
  const { runAction, isPending } = useAsyncAction();
  const items = workspace?.notifications ?? [];
  const { paginatedItems, currentPage, totalPages, pageSize, totalItems, setPage, setPageSize } = usePagination(items, {
    defaultPageSize: 10,
  });

  async function handleMarkAllRead() {
    try {
      await runAction("mark-all-notifications", () => markAllRead());
      toast.success("All notifications marked as read.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update notifications.");
    }
  }

  async function handleMarkRead(notificationId: string) {
    try {
      await runAction(`notification-${notificationId}`, () => markNotificationRead(notificationId));
      toast.success("Notification marked as read.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update the notification.");
    }
  }

  return (
    <DashboardShell title="Notifications" subtitle="Keep up with document reviews, payment updates, appointment changes, and application progress in one place.">
      <section className="card-theme p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h2 className="heading-sm">All notifications</h2>
          <button type="button" className="btn-outline-theme py-2 px-4 text-sm" disabled={isPending("mark-all-notifications")} onClick={() => void handleMarkAllRead()}>
            {isPending("mark-all-notifications") ? "Updating..." : "Mark all as read"}
          </button>
        </div>
        {loading || !workspace ? (
          <DashboardLoadingState cards={2} lines={3} />
        ) : workspace.notifications.length ? (
          <div className="space-y-3">
            {paginatedItems.map((notification) => (
              <div key={notification.id} className="card-theme-soft p-4">
                <div className="flex items-start justify-between gap-4">
                  <button type="button" className="flex-1 text-left" disabled={isPending(`notification-${notification.id}`)} onClick={() => void handleMarkRead(notification.id)}>
                    <p className="body-sm">{notification.title}</p>
                    <p className="caption text-muted-green mt-2">{notification.body}</p>
                    <p className="caption text-muted-green mt-2">{new Date(notification.createdAt).toLocaleString()}</p>
                  </button>
                  {!notification.read && <span className="h-2.5 w-2.5 rounded-full bg-[color:var(--color-accent)] mt-2" />}
                </div>
                {notification.actionPath && (
                  <Link className="caption text-accent-gold mt-3 inline-flex hover:underline" to={notification.actionPath}>
                    Open update
                  </Link>
                )}
              </div>
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
          <EmptyState title="Nothing here yet" description="You will see updates here when something changes in your dashboard." />
        )}
      </section>
    </DashboardShell>
  );
}
