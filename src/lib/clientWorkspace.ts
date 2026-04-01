import { apiRequest, isApiConfigured, shouldFallbackToLocalApi } from "./api";
import { readStorage, STORAGE_KEYS, writeStorage, createId } from "./storage";
import { DEFAULT_SERVICE_PRICING } from "./adminDefaults";
import type {
  ApplicationServiceType,
  ChecklistItem,
  ClientApplicationDetail,
  ClientApplicationRecord,
  ClientProfile,
  ClientWorkspaceData,
  ConsultationBooking,
  ConsultationMode,
  ConsultationStatus,
  DocumentCategory,
  DocumentRecord,
  MessageEntry,
  MessageThread,
  NotificationRecord,
  PaymentRecord,
  ServicePricingRecord,
  RecordStatus,
  ServiceRequest,
  TourEnquiry,
  UserProfile,
  VisaApplication,
} from "./types";

function shouldFallbackToLocal(error: unknown) {
  return shouldFallbackToLocalApi(error);
}

function getCurrentLocalUser() {
  return readStorage<UserProfile | null>(STORAGE_KEYS.session, null);
}

export function initializeClientWorkspace(user: UserProfile) {
  ensureLocalProfile(user);
  ensureWelcomeThread(user);
  const existingChecklist = readStorage<ChecklistItem[]>(STORAGE_KEYS.checklistItems, []);
  const existingNotification = readStorage<NotificationRecord[]>(STORAGE_KEYS.notifications, []).some(
    (item) => item.userId === user.id && item.title === "Your dashboard is ready",
  );

  if (!existingChecklist.some((item) => item.userId === user.id && item.actionPath === "/dashboard/profile")) {
    addChecklistItems(user.id, [
      {
        title: "Complete your profile",
        description: "Add your nationality, passport number, and preferred contact method.",
        status: "pending",
        actionLabel: "Update profile",
        actionPath: "/dashboard/profile",
      },
      {
        title: "Book your first consultation",
        description: "Meet the GenieHub team so we can recommend the best next step for your travel plans.",
        status: "pending",
        actionLabel: "Book consultation",
        actionPath: "/dashboard/consultations",
      },
    ]);
  }

  if (!existingNotification) {
    pushNotification(user.id, {
      type: "application",
      title: "Your dashboard is ready",
      body: "Welcome to GenieHub. Complete your profile and book a consultation to get started.",
      actionPath: "/dashboard",
    });
  }
}

export function ensureLocalProfile(user: UserProfile) {
  const profiles = readStorage<ClientProfile[]>(STORAGE_KEYS.profiles, []);
  const existing = profiles.find((profile) => profile.userId === user.id);
  if (existing) {
    return existing;
  }

  const created: ClientProfile = {
    userId: user.id,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    preferredContactMethod: "whatsapp",
    communicationPreferences: {
      email: true,
      whatsapp: true,
      sms: false,
    },
    updatedAt: new Date().toISOString(),
  };
  writeStorage(STORAGE_KEYS.profiles, [...profiles, created]);
  return created;
}

export function ensureWelcomeThread(user: UserProfile) {
  const threads = readStorage<MessageThread[]>(STORAGE_KEYS.messageThreads, []);
  const messages = readStorage<MessageEntry[]>(STORAGE_KEYS.messages, []);
  if (threads.some((thread) => thread.userId === user.id)) {
    return;
  }

  const now = new Date().toISOString();
  const threadId = createId("thread");
  const thread: MessageThread = {
    id: threadId,
    userId: user.id,
    subject: "Welcome to your GenieHub dashboard",
    channel: "secure-portal",
    unreadCount: 1,
    lastMessageAt: now,
    createdAt: now,
  };
  const message: MessageEntry = {
    id: createId("msg"),
    threadId,
    sender: "agency",
    senderName: "GenieHub Team",
    senderRole: "agency",
    body: "Welcome to GenieHub. Use this secure space to upload documents, track progress, and message our team whenever you need support.",
    createdAt: now,
  };
  writeStorage(STORAGE_KEYS.messageThreads, [thread, ...threads]);
  writeStorage(STORAGE_KEYS.messages, [message, ...messages]);
}

export function pushNotification(userId: string, notification: Omit<NotificationRecord, "id" | "userId" | "read" | "createdAt">) {
  const notifications = readStorage<NotificationRecord[]>(STORAGE_KEYS.notifications, []);
  const record: NotificationRecord = {
    id: createId("note"),
    userId,
    read: false,
    createdAt: new Date().toISOString(),
    ...notification,
  };
  writeStorage(STORAGE_KEYS.notifications, [record, ...notifications]);
  return record;
}

export function addPayment(record: Omit<PaymentRecord, "id" | "createdAt">) {
  const payments = readStorage<PaymentRecord[]>(STORAGE_KEYS.payments, []);
  const payment: PaymentRecord = {
    id: createId("pay"),
    createdAt: new Date().toISOString(),
    ...record,
  };
  writeStorage(STORAGE_KEYS.payments, [payment, ...payments]);
  return payment;
}

export function addChecklistItems(userId: string, items: Array<Omit<ChecklistItem, "id" | "userId" | "createdAt">>) {
  const checklistItems = readStorage<ChecklistItem[]>(STORAGE_KEYS.checklistItems, []);
  const created = items.map<ChecklistItem>((item) => ({
    id: createId("todo"),
    userId,
    createdAt: new Date().toISOString(),
    ...item,
  }));
  writeStorage(STORAGE_KEYS.checklistItems, [...created, ...checklistItems]);
  return created;
}

export function completeChecklistForPath(userId: string, actionPath: string) {
  const checklistItems = readStorage<ChecklistItem[]>(STORAGE_KEYS.checklistItems, []);
  writeStorage(
    STORAGE_KEYS.checklistItems,
    checklistItems.map((item) =>
      item.userId === userId && item.actionPath === actionPath && item.status !== "completed"
        ? { ...item, status: "completed" }
        : item,
    ),
  );
}

function updateThreadAfterMessage(threadId: string, unreadCount: number) {
  const threads = readStorage<MessageThread[]>(STORAGE_KEYS.messageThreads, []);
  writeStorage(
    STORAGE_KEYS.messageThreads,
    threads.map((thread) =>
      thread.id === threadId
        ? { ...thread, unreadCount, lastMessageAt: new Date().toISOString() }
        : thread,
    ),
  );
}

function mapServiceRequestToApplicationType(requestType: ServiceRequest["requestType"]): ApplicationServiceType {
  switch (requestType) {
    case "study-abroad-application":
      return "study-abroad-application";
    case "travel-package-quote":
      return "tour-package-booking";
    case "flight-booking-support":
    case "hotel-booking-support":
      return "flight-hotel-request";
    default:
      return "service-request";
  }
}

function buildApplicationTimeline(application: ClientApplicationRecord) {
  const visaStages = [
    "Enquiry received",
    "Consultation completed",
    "Documents submitted",
    "Application submitted",
    "Biometrics stage",
    "Decision received",
  ];
  const studyStages = [
    "Enquiry received",
    "Documents requested",
    "Documents received",
    "Application submitted",
    "Offer received",
    "Visa stage",
    "Decision received",
    "Completed",
  ];
  const genericStages = ["Enquiry received", "In review", "Awaiting confirmation", "Completed"];
  const stages =
    application.sourceType === "visa-application"
      ? visaStages
      : application.sourceType === "study-abroad-application"
        ? studyStages
        : genericStages;
  const currentIndex = Math.max(
    0,
    stages.findIndex((stage) => stage.toLowerCase() === application.currentStage.toLowerCase()),
  );

  return stages.map((stage, index) => ({
    id: `${application.id}-${index}`,
    title: stage,
    description:
      application.sourceType === "visa-application"
        ? "Progress milestone for your visa application."
        : application.sourceType === "study-abroad-application"
          ? "Progress milestone for your study abroad journey."
          : "Progress milestone for this request.",
    date: application.submittedAt,
    complete: index <= currentIndex,
  }));
}

function buildApplications(
  visaApplications: VisaApplication[],
  consultations: ConsultationBooking[],
  tourEnquiries: TourEnquiry[],
  serviceRequests: ServiceRequest[],
  documents: DocumentRecord[],
) {
  const visaItems = visaApplications.map<ClientApplicationRecord>((application) => ({
    id: application.id,
    title: `${application.visaType} for ${application.destinationCountry}`,
    sourceType: "visa-application",
    destination: application.destinationCountry,
    currentStage: application.timelineStep,
    status: application.status,
    submittedAt: application.createdAt,
    updatedAt: application.updatedAt,
    nextRequiredAction:
      application.status === "documents-pending" ? "Upload the requested documents to continue." : "Watch for the next update from GenieHub.",
    linkedDocumentIds: documents.filter((document) => document.applicationId === application.id).map((document) => document.id),
    notes: application.notes,
  }));

  const consultationItems = consultations.map<ClientApplicationRecord>((consultation) => ({
    id: consultation.id,
    title: consultation.service,
    sourceType: "consultation-request",
    currentStage:
      consultation.status === "confirmed"
        ? "Consultation confirmed"
        : consultation.status === "completed"
          ? "Consultation completed"
          : consultation.status === "cancelled"
            ? "Consultation cancelled"
            : consultation.status === "rescheduled"
              ? "Rescheduled"
              : "Awaiting confirmation",
    status: consultation.status,
    submittedAt: consultation.createdAt,
    updatedAt: consultation.updatedAt ?? consultation.createdAt,
    nextRequiredAction:
      consultation.status === "pending" ? "Watch for confirmation from the GenieHub team." : "Prepare for your next session.",
    linkedDocumentIds: [],
    notes: consultation.notes,
  }));

  const travelItems = tourEnquiries.map<ClientApplicationRecord>((tour) => ({
    id: tour.id,
    title: `Travel request to ${tour.destination}`,
    sourceType: "flight-hotel-request",
    destination: tour.destination,
    currentStage:
      tour.status === "submitted"
        ? "Enquiry received"
        : tour.status === "under-review"
          ? "Quotation shared"
          : tour.status === "completed"
            ? "Completed"
            : "Awaiting confirmation",
    status: tour.status,
    submittedAt: tour.createdAt,
    updatedAt: tour.updatedAt ?? tour.createdAt,
    nextRequiredAction: tour.status === "submitted" ? "Wait for your quotation and travel recommendation." : "Watch for your next travel update.",
    linkedDocumentIds: [],
    notes: tour.notes,
  }));

  const requestItems = serviceRequests.map<ClientApplicationRecord>((request) => ({
    id: request.id,
    title: request.requestType.replaceAll("-", " "),
    sourceType: mapServiceRequestToApplicationType(request.requestType),
    destination: request.destination,
    currentStage: request.status.replaceAll("-", " "),
    status: request.status,
    submittedAt: request.createdAt,
    updatedAt: request.updatedAt,
    nextRequiredAction:
      request.status === "awaiting-client-response" ? "Review the request notes and reply to the team." : "Wait for the next update from the agency.",
    linkedDocumentIds: [],
    notes: request.notes,
  }));

  return [...visaItems, ...consultationItems, ...travelItems, ...requestItems].sort(
    (left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime(),
  );
}

function getWorkspaceLocal(user: UserProfile): ClientWorkspaceData {
  const profile = ensureLocalProfile(user);
  ensureWelcomeThread(user);

  const consultations = readStorage<ConsultationBooking[]>(STORAGE_KEYS.consultations, []).filter((item) => item.userId === user.id);
  const visaApplications = readStorage<VisaApplication[]>(STORAGE_KEYS.visaApplications, []).filter((item) => item.userId === user.id);
  const tourEnquiries = readStorage<TourEnquiry[]>(STORAGE_KEYS.tours, []).filter((item) => item.userId === user.id);
  const documents = readStorage<DocumentRecord[]>(STORAGE_KEYS.documents, []).filter((item) => item.userId === user.id);
  const serviceRequests = readStorage<ServiceRequest[]>(STORAGE_KEYS.serviceRequests, []).filter((item) => item.userId === user.id);
  const payments = readStorage<PaymentRecord[]>(STORAGE_KEYS.payments, []).filter((item) => item.userId === user.id);
  const checklistItems = readStorage<ChecklistItem[]>(STORAGE_KEYS.checklistItems, []).filter((item) => item.userId === user.id);
  const messageThreads = readStorage<MessageThread[]>(STORAGE_KEYS.messageThreads, []).filter((item) => item.userId === user.id);
  const messages = readStorage<MessageEntry[]>(STORAGE_KEYS.messages, []).filter((item) =>
    messageThreads.some((thread) => thread.id === item.threadId),
  );
  const notifications = readStorage<NotificationRecord[]>(STORAGE_KEYS.notifications, []).filter((item) => item.userId === user.id);

  return {
    profile,
    applications: buildApplications(visaApplications, consultations, tourEnquiries, serviceRequests, documents),
    consultations,
    visaApplications,
    tourEnquiries,
    documents,
    serviceRequests,
    payments,
    servicePricing: readStorage<ServicePricingRecord[]>(STORAGE_KEYS.servicePricing, DEFAULT_SERVICE_PRICING),
    checklistItems,
    messageThreads,
    messages,
    notifications,
  };
}

export async function getClientWorkspace() {
  if (isApiConfigured) {
    try {
      const response = await apiRequest<{ workspace: ClientWorkspaceData }>("client.workspace", {
        method: "GET",
      });
      return {
        ...response.workspace,
        applications: buildApplications(
          response.workspace.visaApplications,
          response.workspace.consultations,
          response.workspace.tourEnquiries,
        response.workspace.serviceRequests,
        response.workspace.documents,
      ),
      servicePricing: response.workspace.servicePricing ?? readStorage<ServicePricingRecord[]>(STORAGE_KEYS.servicePricing, DEFAULT_SERVICE_PRICING),
    };
    } catch (error) {
      if (!shouldFallbackToLocal(error)) {
        throw error;
      }
    }
  }

  const user = getCurrentLocalUser();
  if (!user) {
    throw new Error("Authentication required.");
  }

  return getWorkspaceLocal(user);
}

export async function getClientApplicationDetail(applicationId: string) {
  const workspace = await getClientWorkspace();
  const application = workspace.applications.find((item) => item.id === applicationId);
  if (!application) {
    throw new Error("Application not found.");
  }

  return {
    ...application,
    timeline: buildApplicationTimeline(application),
    checklistItems: workspace.checklistItems.filter((item) => item.applicationId === applicationId),
    paymentSummary: workspace.payments.filter(
      (item) =>
        item.applicationId === applicationId || item.consultationId === applicationId || item.serviceRequestId === applicationId,
    ),
  };
}

export async function submitServiceRequest(payload: Omit<ServiceRequest, "id" | "status" | "createdAt" | "updatedAt">) {
  if (isApiConfigured) {
    try {
      const response = await apiRequest<{ record: ServiceRequest }>("client.service-request.create", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      return response.record;
    } catch (error) {
      if (!shouldFallbackToLocal(error)) {
        throw error;
      }
    }
  }

  const createdAt = new Date().toISOString();
  const record: ServiceRequest = {
    ...payload,
    id: createId("request"),
    status: "received",
    createdAt,
    updatedAt: createdAt,
  };
  const requests = readStorage<ServiceRequest[]>(STORAGE_KEYS.serviceRequests, []);
  writeStorage(STORAGE_KEYS.serviceRequests, [record, ...requests]);
  pushNotification(payload.userId, {
    type: "application",
    title: "Service request received",
    body: "Your support request has been added to the dashboard and is now waiting for review.",
    actionPath: "/dashboard/service-requests",
  });
  return record;
}

export async function saveClientProfile(profile: ClientProfile) {
  if (isApiConfigured) {
    const response = await apiRequest<{ profile: ClientProfile }>("client.profile.save", {
      method: "POST",
      body: JSON.stringify(profile),
    });
    return response.profile;
  }

  const profiles = readStorage<ClientProfile[]>(STORAGE_KEYS.profiles, []);
  const updatedProfile = { ...profile, updatedAt: new Date().toISOString() };
  const updated = profiles.some((item) => item.userId === profile.userId)
    ? profiles.map((item) => (item.userId === profile.userId ? updatedProfile : item))
    : [updatedProfile, ...profiles];
  writeStorage(STORAGE_KEYS.profiles, updated);
  return updatedProfile;
}

export async function sendClientMessage(payload: { userId: string; body: string; subject?: string; threadId?: string }) {
  if (isApiConfigured) {
    const response = await apiRequest<{ thread: MessageThread; message: MessageEntry }>("client.message.send", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return response;
  }

  const threads = readStorage<MessageThread[]>(STORAGE_KEYS.messageThreads, []);
  let thread =
    threads.find((item) => item.id === payload.threadId && item.userId === payload.userId) ??
    threads.find((item) => item.userId === payload.userId);

  if (!thread) {
    thread = {
      id: createId("thread"),
      userId: payload.userId,
      subject: payload.subject ?? "Support request",
      channel: "secure-portal",
      unreadCount: 0,
      lastMessageAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    writeStorage(STORAGE_KEYS.messageThreads, [thread, ...threads]);
  }

  const messages = readStorage<MessageEntry[]>(STORAGE_KEYS.messages, []);
  const message: MessageEntry = {
    id: createId("msg"),
    threadId: thread.id,
    sender: "client",
    senderName: getCurrentLocalUser()?.fullName ?? "Client",
    senderRole: "client",
    body: payload.body,
    createdAt: new Date().toISOString(),
  };
  writeStorage(STORAGE_KEYS.messages, [message, ...messages]);
  updateThreadAfterMessage(thread.id, 0);
  pushNotification(payload.userId, {
    type: "message",
    title: "Message sent",
    body: "Your message has been delivered to the GenieHub team.",
    actionPath: "/dashboard/messages",
  });
  return { thread, message };
}

export async function markNotificationAsRead(notificationId: string) {
  if (isApiConfigured) {
    await apiRequest<{ ok: boolean }>("client.notifications.read", {
      method: "POST",
      body: JSON.stringify({ notificationId }),
    });
    return;
  }

  const notifications = readStorage<NotificationRecord[]>(STORAGE_KEYS.notifications, []);
  writeStorage(
    STORAGE_KEYS.notifications,
    notifications.map((item) => (item.id === notificationId ? { ...item, read: true } : item)),
  );
}

export async function markAllNotificationsAsRead(userId: string) {
  if (isApiConfigured) {
    await apiRequest<{ ok: boolean }>("client.notifications.read-all", {
      method: "POST",
      body: JSON.stringify({ userId }),
    });
    return;
  }

  const notifications = readStorage<NotificationRecord[]>(STORAGE_KEYS.notifications, []);
  writeStorage(
    STORAGE_KEYS.notifications,
    notifications.map((item) => (item.userId === userId ? { ...item, read: true } : item)),
  );
}

export async function updateClientConsultation(
  consultationId: string,
  payload: { status?: ConsultationStatus; date?: string; time?: string; meetingType?: ConsultationMode; notes?: string },
) {
  if (isApiConfigured) {
    const response = await apiRequest<{ consultation: ConsultationBooking }>("client.consultation.update", {
      method: "POST",
      body: JSON.stringify({ consultationId, ...payload }),
    });
    return response.consultation;
  }

  const consultations = readStorage<ConsultationBooking[]>(STORAGE_KEYS.consultations, []);
  let updatedConsultation: ConsultationBooking | null = null;
  const updated = consultations.map((consultation) => {
    if (consultation.id !== consultationId) {
      return consultation;
    }
    updatedConsultation = {
      ...consultation,
      ...payload,
      updatedAt: new Date().toISOString(),
    };
    return updatedConsultation;
  });
  writeStorage(STORAGE_KEYS.consultations, updated);

  if (!updatedConsultation) {
    throw new Error("Consultation not found.");
  }

  return updatedConsultation;
}
