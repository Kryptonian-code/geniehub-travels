import type {
  AppSettings,
  BlogPost,
  ClientProfile,
  ConsultationBooking,
  DocumentRecord,
  MessageEntry,
  MessageThread,
  NotificationRecord,
  PaymentRecord,
  ServiceRequest,
  TourEnquiry,
  AdminRole,
  UserProfile,
  VisaApplication,
} from "./types";

export type LeadPriority = "low" | "medium" | "high" | "urgent";
export type LeadStatus = "new" | "contacted" | "awaiting-documents" | "in-progress" | "closed" | "lost";
export type AdminDocumentStatus = "pending-review" | "approved" | "rejected" | "re-upload-required";
export type AdminPaymentCategory = PaymentRecord["category"] | "other";
export type AdminServiceType =
  | "study-abroad"
  | "visa"
  | "tour-booking"
  | "travel-support"
  | "dependent-visa"
  | "flight-hotel-request"
  | "consultation";
export type CMSPublishStatus = "draft" | "published" | "archived";
export type DestinationCategory = "study-abroad" | "visa" | "tour" | "travel";

export interface AdminUserRecord {
  id: string;
  linkedUserId?: string;
  fullName: string;
  email: string;
  phone?: string;
  role: AdminRole;
  active: boolean;
  isChatAgent?: boolean;
  mustChangePassword?: boolean;
  lastPasswordResetAt?: string;
  createdAt: string;
}

export interface LeadMetaRecord {
  leadId: string;
  source: string;
  serviceType?: string;
  destination?: string;
  assignedStaffId?: string;
  priority: LeadPriority;
  status: LeadStatus;
  internalNotes?: string;
  archived?: boolean;
  updatedAt: string;
}

export interface ClientFacingUpdate {
  id: string;
  message: string;
  createdAt: string;
}

export interface ApplicationMetaRecord {
  applicationId: string;
  serviceType: AdminServiceType;
  assignedStaffId?: string;
  currentStage: string;
  internalNotes?: string;
  clientUpdates: ClientFacingUpdate[];
  linkedChecklist: string[];
  updatedAt: string;
}

export interface ConsultationMetaRecord {
  consultationId: string;
  assignedStaffId?: string;
  adminNotes?: string;
  clientVisibleNote?: string;
  updatedAt: string;
}

export interface ServiceRequestMetaRecord {
  requestId: string;
  assignedStaffId?: string;
  internalNotes?: string;
  updatedAt: string;
}

export interface AdminLeadRecord {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  source: string;
  serviceType?: string;
  destination?: string;
  message: string;
  assignedStaffId?: string;
  status: LeadStatus;
  priority: LeadPriority;
  createdAt: string;
  updatedAt: string;
  internalNotes?: string;
}

export interface AdminApplicationRecord {
  id: string;
  clientName: string;
  clientEmail: string;
  serviceType: AdminServiceType;
  destination?: string;
  status: string;
  currentStage: string;
  assignedStaffId?: string;
  submittedAt: string;
  updatedAt: string;
}

export interface AdminApplicationDetail extends AdminApplicationRecord {
  clientPhone?: string;
  internalNotes?: string;
  clientUpdates: ClientFacingUpdate[];
  linkedDocuments: DocumentRecord[];
  linkedPayments: PaymentRecord[];
  linkedConsultations: ConsultationBooking[];
  linkedChecklist: string[];
}

export interface AdminClientRecord {
  id: string;
  profile: ClientProfile;
  user: UserProfile;
  applicationsCount: number;
  documentsCount: number;
  paymentsCount: number;
  consultationsCount: number;
  serviceRequestsCount: number;
}

export interface VisaServiceRecord {
  id: string;
  country: string;
  title: string;
  requirements: string;
  checklistContent: string;
  pricingNote?: string;
  seoTitle?: string;
  seoDescription?: string;
  ctaEnabled: boolean;
  status: CMSPublishStatus;
  updatedAt: string;
}

export interface StudyAbroadRecord {
  id: string;
  country: string;
  title: string;
  programmes: string;
  intakeInfo: string;
  content: string;
  ctaBanner?: string;
  status: CMSPublishStatus;
  updatedAt: string;
}

export interface TourPackageRecord {
  id: string;
  title: string;
  destination: string;
  duration: string;
  description?: string;
  startingPrice: string;
  currency?: string;
  travelPeriod: string;
  travelDates?: string;
  itinerarySummary: string;
  inclusions?: string;
  exclusions?: string;
  imageGallery?: string[];
  featured: boolean;
  visible?: boolean;
  imageUrl?: string;
  status: CMSPublishStatus;
  updatedAt: string;
}

export interface DestinationOptionRecord {
  id: string;
  name: string;
  category: DestinationCategory;
  active: boolean;
  updatedAt: string;
}

export interface TestimonialRecord {
  id: string;
  name: string;
  quote: string;
  category: "study abroad" | "visa" | "tours" | "travel support";
  featured: boolean;
  displayOrder: number;
  status: "approved" | "rejected" | "draft";
  imageUrl?: string;
  updatedAt: string;
}

export interface FAQRecord {
  id: string;
  question: string;
  answer: string;
  category: "visa" | "study abroad" | "tours" | "payments" | "consultations" | "general";
  displayOrder: number;
  published: boolean;
  updatedAt: string;
}

export interface ContentBlockRecord {
  id: string;
  key: string;
  sectionKey?: string;
  title: string;
  description?: string;
  content: string;
  icon?: string;
  displayOrder?: number;
  visible?: boolean;
  ctaLabel?: string;
  ctaHref?: string;
  published: boolean;
  updatedAt: string;
}

export interface ChatThreadRecord {
  id: string;
  userId?: string;
  visitorName?: string;
  visitorEmail?: string;
  visitorPhone?: string;
  subject: string;
  channel: "tawk";
  assignedStaffId?: string;
  unreadCount: number;
  status: "open" | "closed" | "pending";
  lastMessageAt: string;
  createdAt: string;
}

export interface ChatMessageRecord {
  id: string;
  threadId: string;
  senderRole: "visitor" | "staff" | "system";
  senderName: string;
  body: string;
  createdAt: string;
}

export interface AdminAlertRecord {
  id: string;
  title: string;
  body: string;
  actionPath?: string;
  read: boolean;
  createdAt: string;
}

export interface AuditLogRecord {
  id: string;
  actorUserId?: string | null;
  actorRole: string;
  actionKey: string;
  targetType: string;
  targetId?: string | null;
  summary: string;
  createdAt: string;
}

export interface AdminWorkspaceData {
  leads: AdminLeadRecord[];
  applications: AdminApplicationRecord[];
  documents: DocumentRecord[];
  consultations: ConsultationBooking[];
  serviceRequests: ServiceRequest[];
  payments: PaymentRecord[];
  clients: AdminClientRecord[];
  messageThreads: MessageThread[];
  messages: MessageEntry[];
  notifications: NotificationRecord[];
  alerts: AdminAlertRecord[];
  blogPosts: BlogPost[];
  visaServices: VisaServiceRecord[];
  studyAbroadRecords: StudyAbroadRecord[];
  tourPackages: TourPackageRecord[];
  destinationOptions: DestinationOptionRecord[];
  testimonials: TestimonialRecord[];
  faqs: FAQRecord[];
  contentBlocks: ContentBlockRecord[];
  servicePricing: import("./types").ServicePricingRecord[];
  settings: AppSettings;
  adminUsers: AdminUserRecord[];
  auditLogs: AuditLogRecord[];
  chatThreads: ChatThreadRecord[];
  chatMessages: ChatMessageRecord[];
  visaApplications: VisaApplication[];
  tourEnquiries: TourEnquiry[];
}
