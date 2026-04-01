import type { AdminRole, UserProfile } from "./types";

export interface AdminNavItem {
  to: string;
  label: string;
  key:
    | "dashboard"
    | "leads"
    | "applications"
    | "documents"
    | "consultations"
    | "serviceRequests"
    | "payments"
    | "clients"
    | "messages"
    | "notifications"
    | "visaServices"
    | "studyAbroad"
    | "destinations"
    | "tourPackages"
    | "blog"
    | "testimonials"
    | "faqs"
    | "contact"
    | "content"
    | "servicePricing"
    | "settings"
    | "users";
  allowedRoles: AdminRole[];
}

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { to: "/admin", label: "Dashboard", key: "dashboard", allowedRoles: ["super-admin", "admin", "content-manager", "operations-staff", "finance-staff"] },
  { to: "/admin/leads", label: "Leads", key: "leads", allowedRoles: ["super-admin", "admin", "operations-staff"] },
  { to: "/admin/applications", label: "Applications", key: "applications", allowedRoles: ["super-admin", "admin", "operations-staff"] },
  { to: "/admin/documents", label: "Documents", key: "documents", allowedRoles: ["super-admin", "admin", "operations-staff"] },
  { to: "/admin/consultations", label: "Consultations", key: "consultations", allowedRoles: ["super-admin", "admin", "operations-staff"] },
  { to: "/admin/service-requests", label: "Service Requests", key: "serviceRequests", allowedRoles: ["super-admin", "admin", "operations-staff"] },
  { to: "/admin/payments", label: "Payments", key: "payments", allowedRoles: ["super-admin", "admin", "finance-staff"] },
  { to: "/admin/clients", label: "Clients", key: "clients", allowedRoles: ["super-admin", "admin", "operations-staff", "finance-staff"] },
  { to: "/admin/messages", label: "Messages", key: "messages", allowedRoles: ["super-admin", "admin", "operations-staff", "finance-staff"] },
  { to: "/admin/notifications", label: "Notifications", key: "notifications", allowedRoles: ["super-admin", "admin", "content-manager", "operations-staff", "finance-staff"] },
  { to: "/admin/visa-services", label: "Visa Services", key: "visaServices", allowedRoles: ["super-admin", "content-manager", "operations-staff"] },
  { to: "/admin/study-abroad", label: "Study Abroad", key: "studyAbroad", allowedRoles: ["super-admin", "content-manager", "operations-staff"] },
  { to: "/admin/destinations", label: "Destinations", key: "destinations", allowedRoles: ["super-admin", "content-manager", "operations-staff"] },
  { to: "/admin/tour-packages", label: "Tour Packages", key: "tourPackages", allowedRoles: ["super-admin", "content-manager", "operations-staff"] },
  { to: "/admin/blog", label: "Blog", key: "blog", allowedRoles: ["super-admin", "content-manager"] },
  { to: "/admin/testimonials", label: "Testimonials", key: "testimonials", allowedRoles: ["super-admin", "content-manager"] },
  { to: "/admin/faqs", label: "FAQs", key: "faqs", allowedRoles: ["super-admin", "content-manager"] },
  { to: "/admin/contact-submissions", label: "Contact", key: "contact", allowedRoles: ["super-admin", "admin", "operations-staff"] },
  { to: "/admin/content", label: "Content", key: "content", allowedRoles: ["super-admin", "content-manager"] },
  { to: "/admin/service-pricing", label: "Service Pricing", key: "servicePricing", allowedRoles: ["super-admin", "content-manager", "finance-staff"] },
  { to: "/admin/settings", label: "Settings", key: "settings", allowedRoles: ["super-admin"] },
  { to: "/admin/users", label: "Users", key: "users", allowedRoles: ["super-admin"] },
];

export function getAdminRole(user: UserProfile | null | undefined) {
  if (!user || user.role !== "admin") {
    return null;
  }

  return user.adminRole ?? "admin";
}

export function getAllowedAdminNavItems(role: AdminRole | null) {
  if (!role) {
    return [];
  }

  return ADMIN_NAV_ITEMS.filter((item) => item.allowedRoles.includes(role));
}

export function canAccessAdminPath(user: UserProfile | null | undefined, path: string) {
  if (!user || user.role !== "admin") {
    return false;
  }

  const role = getAdminRole(user);
  if (!role) {
    return false;
  }

  const match = [...ADMIN_NAV_ITEMS]
    .sort((left, right) => right.to.length - left.to.length)
    .find((item) => path === item.to || path.startsWith(`${item.to}/`));
  if (!match) {
    return role === "super-admin";
  }

  return match.allowedRoles.includes(role);
}

export function getDefaultAdminPath(user: UserProfile | null | undefined) {
  const role = getAdminRole(user);
  const first = getAllowedAdminNavItems(role)[0];
  return first?.to ?? "/dashboard";
}
