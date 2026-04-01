import { ReactNode } from "react";
import { Bell, BriefcaseBusiness, CalendarDays, CheckCheck, CreditCard, Files, LayoutDashboard, MessageSquareText, UserRound } from "lucide-react";
import WorkspaceLayout from "@/components/WorkspaceLayout";

const clientLinks = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/dashboard/applications", label: "My Applications", icon: BriefcaseBusiness },
  { to: "/dashboard/documents", label: "Documents", icon: Files },
  { to: "/dashboard/consultations", label: "Consultations", icon: CalendarDays },
  { to: "/dashboard/service-requests", label: "Service Requests", icon: BriefcaseBusiness },
  { to: "/dashboard/payments", label: "Payments", icon: CreditCard },
  { to: "/dashboard/checklist", label: "Checklist", icon: CheckCheck },
  { to: "/dashboard/messages", label: "Messages", icon: MessageSquareText },
  { to: "/dashboard/notifications", label: "Notifications", icon: Bell },
  { to: "/dashboard/profile", label: "Profile", icon: UserRound },
];

export default function DashboardShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <WorkspaceLayout
      title={title}
      subtitle={subtitle}
      links={clientLinks.map((link) => ({ to: link.to, label: link.label, icon: link.icon }))}
    >
      {children}
    </WorkspaceLayout>
  );
}
