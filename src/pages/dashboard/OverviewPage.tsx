import { Bell, CalendarDays, MessageSquareText, Upload } from "lucide-react";
import { Link } from "react-router-dom";
import DashboardShell from "@/components/dashboard/DashboardShell";
import DashboardLoadingState from "@/components/dashboard/DashboardLoadingState";
import EmptyState from "@/components/dashboard/EmptyState";
import ProgressTracker from "@/components/dashboard/ProgressTracker";
import StatusBadge from "@/components/dashboard/StatusBadge";
import SummaryCard from "@/components/dashboard/SummaryCard";
import { useAuth } from "@/contexts/AuthContext";
import { useClientDashboard } from "@/contexts/ClientDashboardContext";

export default function OverviewPage() {
  const { user } = useAuth();
  const { workspace, loading } = useClientDashboard();

  if (loading || !workspace) {
    return (
      <DashboardShell title="Client Dashboard" subtitle="Loading your travel workspace.">
        <DashboardLoadingState cards={3} lines={4} />
      </DashboardShell>
    );
  }

  const unreadMessages = workspace.messageThreads.reduce((total, thread) => total + thread.unreadCount, 0);
  const unreadNotifications = workspace.notifications.filter((item) => !item.read).length;
  const nextConsultation = workspace.consultations.find((item) => item.status !== "cancelled" && item.status !== "completed");
  const latestApplication = workspace.applications[0];
  const nextChecklistItem = workspace.checklistItems.find((item) => item.status !== "completed");
  const progressSteps = latestApplication
    ? workspace.checklistItems.filter((item) => item.applicationId === latestApplication.id).slice(0, 4)
    : workspace.checklistItems.slice(0, 4);

  return (
    <DashboardShell
      title="Client Dashboard"
      subtitle="Track your progress, respond to the next step, and keep all your travel support in one trusted GenieHub space."
    >
      <div className="space-y-6">
        <section className="card-theme p-6 md:p-8">
          <p className="caption text-accent-gold uppercase tracking-wide">Welcome back</p>
          <h2 className="heading-md mt-3">Hello {user?.fullName?.split(" ")[0] ?? "there"}, your dashboard is ready.</h2>
          <p className="body-md text-muted-green mt-3 max-w-3xl">
            We designed this workspace to feel simple and reassuring. You can follow your applications, upload documents, message the team, and see exactly what needs your attention next.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/dashboard/documents" className="btn-accent inline-flex items-center gap-2">
              <Upload size={16} />
              Upload Document
            </Link>
            <Link to="/dashboard/consultations" className="btn-outline-theme">Book Consultation</Link>
            <Link to="/dashboard/applications" className="btn-outline-theme">View My Applications</Link>
            <Link to="/dashboard/messages" className="btn-outline-theme">Send Message</Link>
          </div>
        </section>

        <section className="grid md:grid-cols-3 gap-4">
          <SummaryCard title="Next action" value={nextChecklistItem ? nextChecklistItem.title : "All clear"} caption={nextChecklistItem ? "Follow the next guided step to keep your application moving." : "Nothing urgent is waiting from you right now."} icon={<Bell size={18} />} />
          <SummaryCard title="Pending documents" value={workspace.documents.filter((item) => item.status === "pending-review" || item.status === "re-upload-required").length} caption="Only documents that still need your attention or review are counted here." icon={<Upload size={18} />} />
          <SummaryCard title="Unread updates" value={unreadMessages + unreadNotifications} caption={nextConsultation ? `Next consultation: ${nextConsultation.date} at ${nextConsultation.time}.` : "Book a consultation whenever you want direct guidance from the team."} icon={<MessageSquareText size={18} />} />
        </section>

        {latestApplication ? (
          <ProgressTracker title={latestApplication.title} steps={progressSteps.map((item) => ({ title: item.title, complete: item.status === "completed" }))} />
        ) : (
          <EmptyState title="Nothing here yet" description="When you submit a visa, travel, or support request, your progress summary will appear here." />
        )}

        <section className="grid xl:grid-cols-[1.15fr_0.85fr] gap-6">
          <div className="card-theme p-6">
            <div className="flex items-center justify-between gap-3 mb-4">
              <h3 className="heading-sm">Recent updates</h3>
              <Link to="/dashboard/notifications" className="caption text-accent-gold hover:underline">View all</Link>
            </div>
            <div className="space-y-3">
              {workspace.notifications.slice(0, 2).map((notification) => (
                <div key={notification.id} className="card-theme-soft p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="body-sm">{notification.title}</p>
                      <p className="caption text-muted-green mt-1">{notification.body}</p>
                    </div>
                    {!notification.read && <span className="h-2.5 w-2.5 rounded-full bg-[color:var(--color-accent)] mt-2" />}
                  </div>
                </div>
              ))}
              {!workspace.notifications.length && <EmptyState title="Nothing here yet" description="Important updates from the GenieHub team will show up here as your journey progresses." />}
            </div>
          </div>

          <div className="card-theme p-6">
            <div className="flex items-center justify-between gap-3 mb-4">
              <h3 className="heading-sm">Focus now</h3>
              <CalendarDays size={18} className="text-accent-gold" />
            </div>
            {nextChecklistItem ? (
              <div className="card-theme-soft p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="body-sm">{nextChecklistItem.title}</p>
                  <StatusBadge status={nextChecklistItem.status} />
                </div>
                <p className="caption text-muted-green mt-2">{nextChecklistItem.description}</p>
                {nextChecklistItem.actionPath && (
                  <Link to={nextChecklistItem.actionPath} className="btn-outline-theme inline-flex mt-4 text-sm py-2 px-4">
                    {nextChecklistItem.actionLabel ?? "Open next step"}
                  </Link>
                )}
              </div>
            ) : (
              <EmptyState title="Your checklist is clear" description="We will add next steps here whenever something needs your attention." />
            )}
            {nextConsultation && (
              <div className="card-theme-soft p-4 mt-4">
                <p className="caption text-muted-green">Next consultation</p>
                <p className="body-sm mt-1">{nextConsultation.service}</p>
                <p className="caption text-muted-green mt-2">{nextConsultation.date} at {nextConsultation.time}</p>
              </div>
            )}
            {latestApplication && (
              <div className="card-theme-soft p-4 mt-4">
                <p className="caption text-muted-green">Current application stage</p>
                <p className="body-sm mt-1">{latestApplication.currentStage}</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}
