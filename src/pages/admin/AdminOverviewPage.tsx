import { BellRing, CalendarDays, Files, MessageSquareText, PenSquare, PlusCircle, Upload } from "lucide-react";
import { Link } from "react-router-dom";
import AdminShell from "@/components/admin/AdminShell";
import AdminStatCard from "@/components/admin/AdminStatCard";
import DashboardLoadingState from "@/components/dashboard/DashboardLoadingState";
import EmptyState from "@/components/dashboard/EmptyState";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminDashboard } from "@/contexts/AdminDashboardContext";

export default function AdminOverviewPage() {
  const { adminRole } = useAuth();
  const { workspace, loading } = useAdminDashboard();
  const newLeads = workspace?.leads.filter((item) => item.status === "new").length ?? 0;
  const pendingConsultations = workspace?.consultations.filter((item) => item.status === "pending").length ?? 0;
  const pendingDocuments = workspace?.documents.filter((item) => item.status === "pending-review").length ?? 0;
  const pendingPayments = workspace?.payments.filter((item) => item.status === "pending").length ?? 0;
  const publishedContent = (workspace?.blogPosts.filter((item) => item.published).length ?? 0)
    + (workspace?.contentBlocks.filter((item) => item.published).length ?? 0);
  const isFinance = adminRole === "finance-staff";
  const isContent = adminRole === "content-manager";
  const isOperations = adminRole === "operations-staff" || adminRole === "admin" || adminRole === "super-admin";

  return (
    <AdminShell title="Admin Dashboard" subtitle="Keep daily operations, client progress, and public content moving from one brand-consistent workspace.">
      {loading || !workspace ? (
        <DashboardLoadingState cards={4} lines={5} />
      ) : (
        <div className="space-y-6">
          <section className="card-theme p-6 md:p-8">
            <p className="caption text-accent-gold uppercase tracking-wide">Operations hub</p>
            <h2 className="heading-md mt-3">Welcome back. The team workspace is ready.</h2>
            <p className="body-md text-muted-green mt-3 max-w-3xl">
              {isFinance
                ? "Track pending payments, confirm receipts, and stay close to the client records that affect billing and follow-up."
                : isContent
                  ? "Keep destination content, FAQs, blog updates, and public trust signals current without stepping outside the GenieHub brand rhythm."
                  : "Review fresh leads, confirm consultations, respond to clients, and keep content current without leaving the same GenieHub rhythm used across the public site and client dashboard."}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              {isOperations && <Link to="/admin/tour-packages" className="btn-accent inline-flex items-center gap-2"><PlusCircle size={16} /> Add Tour Package</Link>}
              {isContent && <Link to="/admin/blog" className="btn-outline-theme inline-flex items-center gap-2"><PenSquare size={16} /> Add Blog Post</Link>}
              {isOperations && <Link to="/admin/documents" className="btn-outline-theme inline-flex items-center gap-2"><Upload size={16} /> Review Documents</Link>}
              {isContent && <Link to="/admin/faqs" className="btn-outline-theme">Add FAQ</Link>}
              {isFinance && <Link to="/admin/payments" className="btn-accent">Review payments</Link>}
            </div>
          </section>

          <section className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
            {isOperations && <AdminStatCard title="Total Leads" value={workspace.leads.length} caption="All active enquiries from forms, bookings, and service requests." icon={<BellRing size={18} />} />}
            {isOperations && <AdminStatCard title="Active Applications" value={workspace.applications.length} caption="Visa, consultation, tour, and support workflows currently being tracked." icon={<Files size={18} />} />}
            {isOperations && <AdminStatCard title="Pending Review" value={workspace.documents.filter((item) => item.status === "pending-review").length} caption="Uploaded files that still need a decision from the team." icon={<Upload size={18} />} />}
            {isFinance && <AdminStatCard title="Pending Payments" value={pendingPayments} caption="Transactions still waiting for finance follow-up or confirmation." icon={<Files size={18} />} />}
            {isFinance && <AdminStatCard title="Paid Records" value={workspace.payments.filter((item) => item.status === "paid").length} caption="Payments already confirmed inside the workspace." icon={<BellRing size={18} />} />}
            {isContent && <AdminStatCard title="Published Content" value={publishedContent} caption="Live blog posts and structured content blocks now visible across the site." icon={<PenSquare size={18} />} />}
            {isContent && <AdminStatCard title="Destinations" value={workspace.destinationOptions.filter((item) => item.active).length} caption="Managed options currently feeding dropdowns and destination pages." icon={<Files size={18} />} />}
            <AdminStatCard title="Unread Messages" value={workspace.messageThreads.filter((item) => item.unreadCount > 0).length} caption="Client threads that still need a reply or acknowledgement." icon={<MessageSquareText size={18} />} />
          </section>

          <section className="grid xl:grid-cols-[1.2fr_0.8fr] gap-6">
            <div className="card-theme p-6">
              <div className="flex items-center justify-between gap-3 mb-4">
                <h3 className="heading-sm">Recent activity</h3>
                <Link to="/admin/notifications" className="caption text-accent-gold hover:underline">View all</Link>
              </div>
              <div className="space-y-3">
                {[...workspace.auditLogs.slice(0, 3).map((entry) => ({
                  id: entry.id,
                  title: entry.summary,
                  body: `${entry.actorRole} | ${new Date(entry.createdAt).toLocaleString()}`,
                  read: true,
                })), ...workspace.alerts.slice(0, 2)].slice(0, 4).map((alert) => (
                  <div key={alert.id} className="card-theme-soft p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="body-sm">{alert.title}</p>
                        <p className="caption text-muted-green mt-1">{alert.body}</p>
                      </div>
                      {!alert.read && <span className="h-2.5 w-2.5 rounded-full bg-[color:var(--color-accent)] mt-2" />}
                    </div>
                  </div>
                ))}
                {!workspace.alerts.length && <EmptyState title="No recent activity yet" description="Admin activity, document uploads, and operational alerts will appear here." />}
              </div>
            </div>

            <div className="space-y-6">
              <section className="card-theme p-6">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <h3 className="heading-sm">Needs attention</h3>
                  <BellRing size={18} className="text-accent-gold" />
                </div>
                <div className="grid gap-3">
                  <div className="card-theme-soft p-4">
                    <p className="caption text-muted-green">{isFinance ? "Pending payments" : "New leads"}</p>
                    <p className="body-sm mt-1">{isFinance ? `${pendingPayments} payment(s) are waiting for confirmation.` : `${newLeads} lead(s) waiting for first contact.`}</p>
                  </div>
                  <div className="card-theme-soft p-4">
                    <p className="caption text-muted-green">{isContent ? "Live content updates" : "Pending document review"}</p>
                    <p className="body-sm mt-1">{isContent ? `${publishedContent} published items are currently active on the site.` : `${pendingDocuments} upload(s) still need a decision.`}</p>
                  </div>
                  <div className="card-theme-soft p-4">
                    <p className="caption text-muted-green">{isContent ? "Managed destinations" : "Pending consultations"}</p>
                    <p className="body-sm mt-1">{isContent ? `${workspace.destinationOptions.filter((item) => item.active).length} destination option(s) are available to forms and content editors.` : `${pendingConsultations} booking(s) are awaiting confirmation.`}</p>
                  </div>
                </div>
              </section>

              <section className="card-theme p-6">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <h3 className="heading-sm">Upcoming consultations</h3>
                  <CalendarDays size={18} className="text-accent-gold" />
                </div>
                <div className="space-y-3">
                  {workspace.consultations.filter((item) => item.status === "pending" || item.status === "confirmed").slice(0, 3).map((item) => (
                    <div key={item.id} className="card-theme-soft p-4">
                      <p className="body-sm">{item.name}</p>
                      <p className="caption text-muted-green mt-1">{item.service} | {item.date} | {item.time}</p>
                    </div>
                  ))}
                  {!workspace.consultations.filter((item) => item.status === "pending" || item.status === "confirmed").length && (
                    <EmptyState title="No consultations queued" description="New and confirmed bookings will appear here when they need the team." />
                  )}
                </div>
              </section>
            </div>
          </section>
        </div>
      )}
    </AdminShell>
  );
}
