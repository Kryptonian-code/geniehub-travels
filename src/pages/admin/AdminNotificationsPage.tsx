import { toast } from "sonner";
import AdminShell from "@/components/admin/AdminShell";
import DashboardLoadingState from "@/components/dashboard/DashboardLoadingState";
import EmptyState from "@/components/dashboard/EmptyState";
import { useAdminDashboard } from "@/contexts/AdminDashboardContext";
import { useAsyncAction } from "@/hooks/useAsyncAction";

export default function AdminNotificationsPage() {
  const { workspace, loading, markAlertRead, markAllAlertsRead } = useAdminDashboard();
  const { runAction, isPending } = useAsyncAction();

  async function handleMarkAlertRead(alertId: string) {
    try {
      await runAction(`alert-${alertId}`, () => markAlertRead(alertId));
      toast.success("Notification marked as read.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update the notification.");
    }
  }

  async function handleMarkAllRead() {
    try {
      await runAction("admin-alerts-all", () => markAllAlertsRead());
      toast.success("All notifications marked as read.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update notifications.");
    }
  }

  return (
    <AdminShell title="Notifications" subtitle="Monitor operational alerts such as new leads, documents awaiting review, and bookings that need attention.">
      {loading || !workspace ? (
        <DashboardLoadingState cards={2} lines={3} />
      ) : workspace.alerts.length ? (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="heading-sm">Operational alerts</h2>
            <button type="button" className="btn-outline-theme py-2 px-4 text-sm" disabled={isPending("admin-alerts-all")} onClick={() => void handleMarkAllRead()}>
              {isPending("admin-alerts-all") ? "Updating..." : "Mark all as read"}
            </button>
          </div>
          {workspace.alerts.map((alert) => (
            <button key={alert.id} type="button" className="w-full text-left card-theme p-5" disabled={isPending(`alert-${alert.id}`)} onClick={() => void handleMarkAlertRead(alert.id)}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="body-sm">{alert.title}</p>
                  <p className="caption text-muted-green mt-1">{alert.body}</p>
                  <p className="caption text-muted-green mt-2">{new Date(alert.createdAt).toLocaleString()}</p>
                </div>
                {!alert.read && <span className="h-2.5 w-2.5 rounded-full bg-[color:var(--color-accent)] mt-2" />}
              </div>
            </button>
          ))}
        </div>
      ) : (
        <EmptyState title="No alerts yet" description="Operational notifications will appear here as the system activity grows." />
      )}
    </AdminShell>
  );
}
