import { ReactNode } from "react";
import {
  BellRing,
  BriefcaseBusiness,
  CalendarDays,
  CreditCard,
  FileText,
  Files,
  LayoutDashboard,
  Map,
  MessageSquareText,
  PenSquare,
  Settings,
  ShieldCheck,
  Sparkles,
  UserRound,
  Users,
} from "lucide-react";
import WorkspaceLayout from "@/components/WorkspaceLayout";
import { getAllowedAdminNavItems } from "@/lib/adminAccess";
import { useAuth } from "@/contexts/AuthContext";

const adminIcons = {
  dashboard: LayoutDashboard,
  leads: BellRing,
  applications: BriefcaseBusiness,
  documents: Files,
  consultations: CalendarDays,
  serviceRequests: Sparkles,
  payments: CreditCard,
  clients: Users,
  messages: MessageSquareText,
  notifications: BellRing,
  visaServices: ShieldCheck,
  studyAbroad: FileText,
  destinations: Map,
  tourPackages: Map,
  blog: PenSquare,
  testimonials: UserRound,
  faqs: FileText,
  contact: BellRing,
  content: Sparkles,
  servicePricing: CreditCard,
  settings: Settings,
  users: Users,
} as const;

export default function AdminShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  const { adminRole } = useAuth();
  const adminLinks = getAllowedAdminNavItems(adminRole).map((item) => ({
    to: item.to,
    label: item.label,
    icon: adminIcons[item.key],
  }));

  return (
    <WorkspaceLayout admin links={adminLinks} title={title} subtitle={subtitle}>
      {children}
    </WorkspaceLayout>
  );
}
