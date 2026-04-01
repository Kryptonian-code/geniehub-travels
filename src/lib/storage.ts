export const STORAGE_KEYS = {
  users: "geniehub-users",
  session: "geniehub-session",
  blogPosts: "geniehub-blog-posts",
  settings: "geniehub-settings",
  consultations: "geniehub-consultations",
  leads: "geniehub-leads",
  tours: "geniehub-tours",
  visaApplications: "geniehub-visa-applications",
  documents: "geniehub-documents",
  profiles: "geniehub-client-profiles",
  serviceRequests: "geniehub-service-requests",
  payments: "geniehub-payments",
  checklistItems: "geniehub-checklist-items",
  messageThreads: "geniehub-message-threads",
  messages: "geniehub-messages",
  notifications: "geniehub-notifications",
  leadMeta: "geniehub-admin-lead-meta",
  applicationMeta: "geniehub-admin-application-meta",
  consultationMeta: "geniehub-admin-consultation-meta",
  serviceRequestMeta: "geniehub-admin-service-request-meta",
  visaServices: "geniehub-admin-visa-services",
  studyAbroadRecords: "geniehub-admin-study-abroad",
  tourPackages: "geniehub-admin-tour-packages",
  destinationOptions: "geniehub-admin-destination-options",
  testimonials: "geniehub-admin-testimonials",
  faqs: "geniehub-admin-faqs",
  contentBlocks: "geniehub-admin-content-blocks",
  servicePricing: "geniehub-admin-service-pricing",
  adminUsers: "geniehub-admin-users",
  adminAlerts: "geniehub-admin-alerts",
  chatThreads: "geniehub-chat-threads",
  chatMessages: "geniehub-chat-messages",
  chatAssignments: "geniehub-chat-assignments",
  auditLogs: "geniehub-audit-logs",
  passwordResetTokens: "geniehub-password-reset-tokens",
  clientErrorLogs: "geniehub-client-error-logs",
} as const;

export function readStorage<T>(key: string, fallback: T): T {
  try {
    const value = window.localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function writeStorage<T>(key: string, value: T) {
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function createId(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`;
}
