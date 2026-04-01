export type UserRole = "client" | "admin";
export type AdminRole = "super-admin" | "admin" | "content-manager" | "operations-staff" | "finance-staff";
export type AuthProviderName = "local" | "firebase";

export type RecordStatus =
  | "new"
  | "submitted"
  | "scheduled"
  | "pending"
  | "confirmed"
  | "rescheduled"
  | "cancelled"
  | "documents-pending"
  | "under-review"
  | "approved"
  | "completed"
  | "more-info-needed"
  | "received"
  | "in-review"
  | "awaiting-client-response"
  | "processed"
  | "paid"
  | "failed"
  | "refunded"
  | "pending-review"
  | "rejected"
  | "re-upload-required"
  | "in-progress"
  | "blocked";

export type ApplicationServiceType =
  | "study-abroad-application"
  | "visa-application"
  | "tour-package-booking"
  | "flight-hotel-request"
  | "consultation-request"
  | "service-request";

export type DocumentCategory =
  | "passport"
  | "transcript"
  | "certificate"
  | "cv"
  | "personal-statement"
  | "bank-statement"
  | "english-test-result"
  | "id-card"
  | "visa-supporting-document"
  | "other";

export type DocumentStatus = "pending-review" | "approved" | "rejected" | "re-upload-required";
export type PaymentStatus = "paid" | "pending" | "failed" | "refunded";
export type ConsultationStatus = "pending" | "confirmed" | "rescheduled" | "completed" | "cancelled";
export type ConsultationMode = "in-person" | "phone" | "online" | "video" | "whatsapp";
export type ServiceRequestStatus = "received" | "in-review" | "awaiting-client-response" | "processed" | "completed";
export type ChecklistStatus = "pending" | "in-progress" | "completed" | "blocked";
export type NotificationType = "document" | "message" | "consultation" | "payment" | "application" | "checklist";
export type ContactMethod = "phone" | "email" | "whatsapp";

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  role: UserRole;
  adminRole?: AdminRole;
  authProvider?: AuthProviderName;
  mustChangePassword?: boolean;
  createdAt: string;
}

export interface SessionUser extends UserProfile {
  password?: string;
}

export interface ClientProfile {
  userId: string;
  fullName: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  nationality?: string;
  passportNumber?: string;
  preferredContactMethod: ContactMethod;
  profilePhotoUrl?: string;
  communicationPreferences: {
    email: boolean;
    whatsapp: boolean;
    sms: boolean;
  };
  updatedAt: string;
}

export interface ConsultationBooking {
  id: string;
  userId?: string;
  name: string;
  email: string;
  phone: string;
  service: string;
  date: string;
  time: string;
  meetingType: ConsultationMode;
  notes?: string;
  status: ConsultationStatus;
  createdAt: string;
  updatedAt?: string;
}

export interface ContactLead {
  id: string;
  userId?: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  category: "contact" | "consultation" | "tour" | "visa";
  status: RecordStatus;
  createdAt: string;
}

export interface TourEnquiry {
  id: string;
  userId?: string;
  name: string;
  email: string;
  phone: string;
  destination: string;
  departure: string;
  returnDate: string;
  passengers: string;
  budget?: string;
  notes?: string;
  status: RecordStatus;
  createdAt: string;
  updatedAt?: string;
}

export interface VisaApplication {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  phone: string;
  visaType: string;
  destinationCountry: string;
  purpose: string;
  travelDate: string;
  notes?: string;
  status: RecordStatus;
  timelineStep: string;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentRecord {
  id: string;
  userId: string;
  applicationId?: string;
  fileName: string;
  fileType: string;
  mimeType?: string;
  fileSize: number;
  fileUrl: string;
  filePath?: string;
  originalFileName?: string;
  category: DocumentCategory;
  status: DocumentStatus;
  clientNotes?: string;
  adminNotes?: string;
  uploadedAt: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  content: string;
  author: string;
  imageUrl?: string;
  published: boolean;
  publishedAt: string;
}

export interface AppSettings {
  id: string;
  brandName: string;
  tagline: string;
  supportEmail: string;
  phone: string;
  officeAddress: string;
  workingHours: string;
  whatsappNumber: string;
  instagramUrl?: string;
  facebookUrl?: string;
  twitterUrl?: string;
  snapchatUrl?: string;
  linkedinUrl?: string;
  tiktokUrl?: string;
  defaultCurrency: string;
  autoAssignChat: boolean;
  tawkPropertyId?: string;
  tawkWidgetId?: string;
  heroTitle: string;
  heroSubtitle: string;
}

export interface ServiceRequest {
  id: string;
  userId: string;
  requestType:
    | "flight-booking-support"
    | "hotel-booking-support"
    | "sop-assistance"
    | "visa-assistance"
    | "travel-package-quote"
    | "document-review-help"
    | "dependent-visa-support"
    | "study-abroad-application";
  destination?: string;
  travelDate?: string;
  budget?: string;
  travellers?: string;
  urgency?: "standard" | "priority" | "urgent";
  notes?: string;
  status: ServiceRequestStatus;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentRecord {
  id: string;
  userId: string;
  applicationId?: string;
  consultationId?: string;
  serviceRequestId?: string;
  category: "consultation-fee" | "application-fee" | "service-deposit" | "package-deposit";
  reference: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  receiptUrl?: string;
  createdAt: string;
}

export interface ServicePricingRecord {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  category: string;
  visible: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface ChecklistItem {
  id: string;
  userId: string;
  applicationId?: string;
  title: string;
  description: string;
  status: ChecklistStatus;
  dueDate?: string;
  actionLabel?: string;
  actionPath?: string;
  createdAt: string;
}

export interface MessageThread {
  id: string;
  userId?: string;
  subject: string;
  channel: "secure-portal" | "tawk";
  unreadCount: number;
  assignedStaffId?: string;
  visitorName?: string;
  visitorEmail?: string;
  visitorPhone?: string;
  sourceLabel?: string;
  lastMessageAt: string;
  createdAt: string;
}

export interface MessageEntry {
  id: string;
  threadId: string;
  sender: "client" | "agency";
  senderName?: string;
  senderRole?: "client" | "agency" | "visitor" | "staff";
  body: string;
  attachmentName?: string;
  attachmentUrl?: string;
  readAt?: string;
  createdAt: string;
}

export interface NotificationRecord {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  actionPath?: string;
  read: boolean;
  createdAt: string;
}

export interface ApplicationTimelineItem {
  id: string;
  title: string;
  description: string;
  date: string;
  complete: boolean;
}

export interface ClientApplicationRecord {
  id: string;
  title: string;
  sourceType: ApplicationServiceType;
  destination?: string;
  currentStage: string;
  status: RecordStatus;
  submittedAt: string;
  updatedAt: string;
  nextRequiredAction?: string;
  linkedDocumentIds: string[];
  notes?: string;
}

export interface ClientApplicationDetail extends ClientApplicationRecord {
  timeline: ApplicationTimelineItem[];
  checklistItems: ChecklistItem[];
  paymentSummary: PaymentRecord[];
}

export interface ClientWorkspaceData {
  profile: ClientProfile;
  applications: ClientApplicationRecord[];
  consultations: ConsultationBooking[];
  visaApplications: VisaApplication[];
  tourEnquiries: TourEnquiry[];
  documents: DocumentRecord[];
  serviceRequests: ServiceRequest[];
  payments: PaymentRecord[];
  servicePricing: ServicePricingRecord[];
  checklistItems: ChecklistItem[];
  messageThreads: MessageThread[];
  messages: MessageEntry[];
  notifications: NotificationRecord[];
}

export interface DashboardSnapshot {
  consultations: ConsultationBooking[];
  visaApplications: VisaApplication[];
  tourEnquiries: TourEnquiry[];
  documents: DocumentRecord[];
  leads: ContactLead[];
}
