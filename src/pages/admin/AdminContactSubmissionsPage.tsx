import AdminShell from "@/components/admin/AdminShell";
import EmptyState from "@/components/dashboard/EmptyState";
import { useAdminDashboard } from "@/contexts/AdminDashboardContext";

export default function AdminContactSubmissionsPage() {
  const { workspace, loading } = useAdminDashboard();
  const contacts = workspace?.leads.filter((item) => item.source === "Contact form") ?? [];

  return (
    <AdminShell title="Contact Submissions" subtitle="Review incoming contact messages, keep them visible, and convert them into active leads when needed.">
      {loading || !workspace ? (
        <div className="card-theme p-6 body-md text-muted-green">Loading contact submissions...</div>
      ) : contacts.length ? (
        <div className="space-y-4">
          {contacts.map((item) => (
            <div key={item.id} className="card-theme p-5">
              <p className="body-sm">{item.fullName}</p>
              <p className="caption text-muted-green mt-1">{item.email} {item.phone ? `| ${item.phone}` : ""}</p>
              <p className="body-sm mt-3">{item.message}</p>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState title="No contact submissions yet" description="Contact form messages will appear here for the team to review." />
      )}
    </AdminShell>
  );
}
