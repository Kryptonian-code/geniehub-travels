import {
  createStaffAccount,
  deleteBlogPost,
  getBlogPosts,
  getDashboardSnapshot,
  getSettings,
  resetStaffPassword,
  saveBlogPost,
  saveSettings,
  updateConsultationStatus,
  updateLeadStatus,
  updateTourStatus,
  updateVisaStatus,
} from "./backend";
import { apiRequest, isApiConfigured, shouldFallbackToLocalApi } from "./api";
import {
  DEFAULT_ADMIN_ALERTS,
  DEFAULT_ADMIN_USERS,
  DEFAULT_CHAT_MESSAGES,
  DEFAULT_CHAT_THREADS,
  DEFAULT_CONTENT_BLOCKS,
  DEFAULT_DESTINATION_OPTIONS,
  DEFAULT_FAQS,
  DEFAULT_SERVICE_PRICING,
  DEFAULT_STUDY_ABROAD_RECORDS,
  DEFAULT_TESTIMONIALS,
  DEFAULT_TOUR_PACKAGES,
  DEFAULT_VISA_SERVICES,
} from "./adminDefaults";
import { createId, readStorage, STORAGE_KEYS, writeStorage } from "./storage";
import type {
  AppSettings,
  BlogPost,
  ClientProfile,
  ConsultationBooking,
  ContactLead,
  DocumentRecord,
  MessageEntry,
  MessageThread,
  NotificationRecord,
  PaymentRecord,
  SessionUser,
  ServicePricingRecord,
  ServiceRequest,
  UserProfile,
  VisaApplication,
  TourEnquiry,
} from "./types";
import type {
  AdminAlertRecord,
  AuditLogRecord,
  AdminApplicationDetail,
  AdminApplicationRecord,
  AdminClientRecord,
  AdminDocumentStatus,
  AdminLeadRecord,
  AdminServiceType,
  AdminUserRecord,
  AdminWorkspaceData,
  ApplicationMetaRecord,
  ClientFacingUpdate,
  ConsultationMetaRecord,
  ChatMessageRecord,
  ChatThreadRecord,
  ContentBlockRecord,
  DestinationOptionRecord,
  FAQRecord,
  LeadMetaRecord,
  ServiceRequestMetaRecord,
  StudyAbroadRecord,
  TestimonialRecord,
  TourPackageRecord,
  VisaServiceRecord,
} from "./adminTypes";

interface AdminWorkspaceSource {
  users: UserProfile[];
  profiles: ClientProfile[];
  leadsBase: ContactLead[];
  consultations: ConsultationBooking[];
  visaApplications: VisaApplication[];
  tourEnquiries: TourEnquiry[];
  documents: DocumentRecord[];
  serviceRequests: ServiceRequest[];
  payments: PaymentRecord[];
  messageThreads: MessageThread[];
  messages: MessageEntry[];
  notifications: NotificationRecord[];
  blogPosts: BlogPost[];
  settings: AppSettings;
  leadMeta: LeadMetaRecord[];
  applicationMeta: ApplicationMetaRecord[];
  consultationMeta: ConsultationMetaRecord[];
  serviceRequestMeta: ServiceRequestMetaRecord[];
  visaServices: VisaServiceRecord[];
  studyAbroadRecords: StudyAbroadRecord[];
  tourPackages: TourPackageRecord[];
  destinationOptions: DestinationOptionRecord[];
  testimonials: TestimonialRecord[];
  faqs: FAQRecord[];
  contentBlocks: ContentBlockRecord[];
  servicePricing: ServicePricingRecord[];
  adminUsers: AdminUserRecord[];
  adminAlerts: AdminAlertRecord[];
  auditLogs: AuditLogRecord[];
  chatThreads: ChatThreadRecord[];
  chatMessages: ChatMessageRecord[];
}

function shouldFallbackToLocal(error: unknown) {
  return shouldFallbackToLocalApi(error);
}

function ensureAdminBootstrap() {
  const bootstrapMap: Array<[string, unknown[]]> = [
    [STORAGE_KEYS.leadMeta, []],
    [STORAGE_KEYS.applicationMeta, []],
    [STORAGE_KEYS.consultationMeta, []],
    [STORAGE_KEYS.serviceRequestMeta, []],
    [STORAGE_KEYS.visaServices, []],
    [STORAGE_KEYS.studyAbroadRecords, []],
    [STORAGE_KEYS.tourPackages, []],
    [STORAGE_KEYS.destinationOptions, []],
    [STORAGE_KEYS.testimonials, []],
    [STORAGE_KEYS.faqs, []],
    [STORAGE_KEYS.contentBlocks, []],
    [STORAGE_KEYS.servicePricing, []],
    [STORAGE_KEYS.adminUsers, []],
    [STORAGE_KEYS.adminAlerts, []],
    [STORAGE_KEYS.chatThreads, []],
    [STORAGE_KEYS.chatMessages, []],
    [STORAGE_KEYS.auditLogs, []],
  ];

  for (const [key, value] of bootstrapMap) {
    if (!window.localStorage.getItem(key)) {
      window.localStorage.setItem(key, JSON.stringify(value));
    }
  }
}

ensureAdminBootstrap();

function readArray<T>(key: string, fallback: T[]): T[] {
  return readStorage<T[]>(key, fallback);
}

function writeArray<T>(key: string, value: T[]) {
  writeStorage(key, value);
}

function recordLocalAudit(actionKey: string, targetType: string, targetId: string, summary: string) {
  const session = readStorage<UserProfile | null>(STORAGE_KEYS.session, null);
  const logs = readArray<AuditLogRecord>(STORAGE_KEYS.auditLogs, []);
  writeArray(STORAGE_KEYS.auditLogs, [
    {
      id: createId("audit"),
      actorUserId: session?.id ?? null,
      actorRole: session?.adminRole ?? session?.role ?? "system",
      actionKey,
      targetType,
      targetId,
      summary,
      createdAt: new Date().toISOString(),
    },
    ...logs,
  ]);
}

function getLeadMetasLocal() {
  return readArray<LeadMetaRecord>(STORAGE_KEYS.leadMeta, []);
}

function getApplicationMetasLocal() {
  return readArray<ApplicationMetaRecord>(STORAGE_KEYS.applicationMeta, []);
}

function getConsultationMetasLocal() {
  return readArray<ConsultationMetaRecord>(STORAGE_KEYS.consultationMeta, []);
}

function getServiceRequestMetasLocal() {
  return readArray<ServiceRequestMetaRecord>(STORAGE_KEYS.serviceRequestMeta, []);
}

function getAdminUsersLocal() {
  return readArray<AdminUserRecord>(STORAGE_KEYS.adminUsers, []);
}

function guessLeadSource(category: string) {
  switch (category) {
    case "consultation":
      return "Consultation booking";
    case "tour":
      return "Tour enquiry";
    case "visa":
      return "Visa enquiry";
    default:
      return "Contact form";
  }
}

function guessServiceType(category: string): AdminServiceType {
  switch (category) {
    case "consultation":
      return "consultation";
    case "tour":
      return "tour-booking";
    case "visa":
      return "visa";
    default:
      return "travel-support";
  }
}

function mapApplications(
  visaApplications: VisaApplication[],
  consultations: ConsultationBooking[],
  tours: TourEnquiry[],
  serviceRequests: ServiceRequest[],
  users: UserProfile[],
  metas: ApplicationMetaRecord[],
) {
  const visaItems = visaApplications.map<AdminApplicationRecord>((item) => {
    const meta = metas.find((entry) => entry.applicationId === item.id);
    return {
      id: item.id,
      clientName: item.fullName,
      clientEmail: item.email,
      serviceType: "visa",
      destination: item.destinationCountry,
      status: item.status,
      currentStage: meta?.currentStage ?? item.timelineStep,
      assignedStaffId: meta?.assignedStaffId,
      submittedAt: item.createdAt,
      updatedAt: meta?.updatedAt ?? item.updatedAt,
    };
  });

  const consultationItems = consultations.map<AdminApplicationRecord>((item) => {
    const meta = metas.find((entry) => entry.applicationId === item.id);
    return {
      id: item.id,
      clientName: item.name,
      clientEmail: item.email,
      serviceType: "consultation",
      status: item.status,
      currentStage: meta?.currentStage ?? item.status.replaceAll("-", " "),
      assignedStaffId: meta?.assignedStaffId,
      submittedAt: item.createdAt,
      updatedAt: meta?.updatedAt ?? item.updatedAt ?? item.createdAt,
    };
  });

  const tourItems = tours.map<AdminApplicationRecord>((item) => {
    const meta = metas.find((entry) => entry.applicationId === item.id);
    return {
      id: item.id,
      clientName: item.name,
      clientEmail: item.email,
      serviceType: "tour-booking",
      destination: item.destination,
      status: item.status,
      currentStage: meta?.currentStage ?? item.status.replaceAll("-", " "),
      assignedStaffId: meta?.assignedStaffId,
      submittedAt: item.createdAt,
      updatedAt: meta?.updatedAt ?? item.updatedAt ?? item.createdAt,
    };
  });

  const requestItems = serviceRequests.map<AdminApplicationRecord>((item) => {
    const meta = metas.find((entry) => entry.applicationId === item.id);
    const user = users.find((candidate) => candidate.id === item.userId);
    return {
      id: item.id,
      clientName: user?.fullName ?? "Client request",
      clientEmail: user?.email ?? "",
      serviceType: item.requestType === "study-abroad-application" ? "study-abroad" : "travel-support",
      destination: item.destination,
      status: item.status,
      currentStage: meta?.currentStage ?? item.status.replaceAll("-", " "),
      assignedStaffId: meta?.assignedStaffId,
      submittedAt: item.createdAt,
      updatedAt: meta?.updatedAt ?? item.updatedAt,
    };
  });

  return [...visaItems, ...consultationItems, ...tourItems, ...requestItems].sort(
    (left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime(),
  );
}

function mapLeads(leads: ContactLead[], metas: LeadMetaRecord[]) {
  return leads.map<AdminLeadRecord>((lead) => {
    const meta = metas.find((entry) => entry.leadId === lead.id);
    return {
      id: lead.id,
      fullName: lead.name,
      email: lead.email,
      phone: lead.phone,
      source: meta?.source ?? guessLeadSource(lead.category),
      serviceType: meta?.serviceType ?? guessServiceType(lead.category),
      destination: meta?.destination,
      message: lead.message,
      assignedStaffId: meta?.assignedStaffId,
      status: meta?.status ?? (lead.status === "new" ? "new" : "in-progress"),
      priority: meta?.priority ?? "medium",
      createdAt: lead.createdAt,
      updatedAt: meta?.updatedAt ?? lead.createdAt,
      internalNotes: meta?.internalNotes,
    };
  });
}

function deriveClients(
  users: UserProfile[],
  profiles: ClientProfile[],
  applications: AdminApplicationRecord[],
  documents: DocumentRecord[],
  payments: PaymentRecord[],
  consultations: ConsultationBooking[],
  serviceRequests: ServiceRequest[],
) {
  return users
    .filter((user) => user.role === "client")
    .map<AdminClientRecord>((user) => {
      const profile = profiles.find((item) => item.userId === user.id) ?? {
        userId: user.id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        preferredContactMethod: "whatsapp",
        communicationPreferences: { email: true, whatsapp: true, sms: false },
        updatedAt: user.createdAt,
      };
      return {
        id: user.id,
        user,
        profile,
        applicationsCount: applications.filter((item) => item.clientEmail === user.email || item.clientName === user.fullName).length,
        documentsCount: documents.filter((item) => item.userId === user.id).length,
        paymentsCount: payments.filter((item) => item.userId === user.id).length,
        consultationsCount: consultations.filter((item) => item.userId === user.id).length,
        serviceRequestsCount: serviceRequests.filter((item) => item.userId === user.id).length,
      };
    });
}

function deriveAlerts(
  leads: AdminLeadRecord[],
  documents: DocumentRecord[],
  consultations: ConsultationBooking[],
  notifications: NotificationRecord[],
  seededAlerts: AdminAlertRecord[],
) {
  const dynamic: AdminAlertRecord[] = [
    ...documents
      .filter((item) => item.status === "pending-review")
      .slice(0, 3)
      .map((item) => ({
        id: `alert-doc-${item.id}`,
        title: "Document review needed",
        body: `${item.fileName} is waiting for review.`,
        actionPath: "/admin/documents",
        read: false,
        createdAt: item.uploadedAt,
      })),
    ...consultations
      .filter((item) => item.status === "pending")
      .slice(0, 3)
      .map((item) => ({
        id: `alert-consult-${item.id}`,
        title: "Consultation awaiting confirmation",
        body: `${item.name} booked ${item.service}.`,
        actionPath: "/admin/consultations",
        read: false,
        createdAt: item.createdAt,
      })),
    ...leads
      .filter((item) => item.status === "new")
      .slice(0, 3)
      .map((item) => ({
        id: `alert-lead-${item.id}`,
        title: "New lead submitted",
        body: `${item.fullName} sent a new ${item.source.toLowerCase()} enquiry.`,
        actionPath: "/admin/leads",
        read: false,
        createdAt: item.createdAt,
      })),
    ...notifications.slice(0, 3).map((item) => ({
      id: `alert-note-${item.id}`,
      title: item.title,
      body: item.body,
      actionPath: "/admin/notifications",
      read: item.read,
      createdAt: item.createdAt,
    })),
  ];

  return [...dynamic, ...seededAlerts].sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime());
}

async function loadAdminWorkspaceSource(): Promise<AdminWorkspaceSource> {
  if (isApiConfigured) {
    try {
      const response = await apiRequest<{ workspace: AdminWorkspaceSource }>("admin.workspace", {
        method: "GET",
      });
      return response.workspace;
    } catch (error) {
      if (!shouldFallbackToLocal(error)) {
        throw error;
      }
    }
  }

  const snapshot = await getDashboardSnapshot();
  const [blogPosts, settings] = await Promise.all([getBlogPosts(), getSettings()]);

  return {
    users: readArray<UserProfile>(STORAGE_KEYS.users, []),
    profiles: readArray<ClientProfile>(STORAGE_KEYS.profiles, []),
    leadsBase: snapshot.leads,
    consultations: snapshot.consultations,
    visaApplications: snapshot.visaApplications,
    tourEnquiries: snapshot.tourEnquiries,
    documents: readArray<DocumentRecord>(STORAGE_KEYS.documents, snapshot.documents),
    serviceRequests: readArray<ServiceRequest>(STORAGE_KEYS.serviceRequests, []),
    payments: readArray<PaymentRecord>(STORAGE_KEYS.payments, []),
    messageThreads: readArray<MessageThread>(STORAGE_KEYS.messageThreads, []),
    messages: readArray<MessageEntry>(STORAGE_KEYS.messages, []),
    notifications: readArray<NotificationRecord>(STORAGE_KEYS.notifications, []),
    blogPosts,
    settings,
    leadMeta: getLeadMetasLocal(),
    applicationMeta: getApplicationMetasLocal(),
    consultationMeta: getConsultationMetasLocal(),
    serviceRequestMeta: getServiceRequestMetasLocal(),
    visaServices: readArray<VisaServiceRecord>(STORAGE_KEYS.visaServices, []),
    studyAbroadRecords: readArray<StudyAbroadRecord>(STORAGE_KEYS.studyAbroadRecords, []),
    tourPackages: readArray<TourPackageRecord>(STORAGE_KEYS.tourPackages, []),
    destinationOptions: readArray<DestinationOptionRecord>(STORAGE_KEYS.destinationOptions, []),
    testimonials: readArray<TestimonialRecord>(STORAGE_KEYS.testimonials, []),
    faqs: readArray<FAQRecord>(STORAGE_KEYS.faqs, []),
    contentBlocks: readArray<ContentBlockRecord>(STORAGE_KEYS.contentBlocks, []),
    servicePricing: readArray<ServicePricingRecord>(STORAGE_KEYS.servicePricing, []),
    adminUsers: getAdminUsersLocal(),
    adminAlerts: readArray<AdminAlertRecord>(STORAGE_KEYS.adminAlerts, []),
    chatThreads: readArray<ChatThreadRecord>(STORAGE_KEYS.chatThreads, []),
    chatMessages: readArray<ChatMessageRecord>(STORAGE_KEYS.chatMessages, []),
    auditLogs: readArray<AuditLogRecord>(STORAGE_KEYS.auditLogs, []),
  };
}

export async function getAdminWorkspace(): Promise<AdminWorkspaceData> {
  const source = await loadAdminWorkspaceSource();
  const leads = mapLeads(source.leadsBase, source.leadMeta);
  const applications = mapApplications(
    source.visaApplications,
    source.consultations,
    source.tourEnquiries,
    source.serviceRequests,
    source.users,
    source.applicationMeta,
  );
  const clients = deriveClients(
    source.users,
    source.profiles,
    applications,
    source.documents,
    source.payments,
    source.consultations,
    source.serviceRequests,
  );
  const alerts = deriveAlerts(
    leads,
    source.documents,
    source.consultations,
    source.notifications,
    source.adminAlerts,
  );

  return {
    leads,
    applications,
    documents: source.documents,
    consultations: source.consultations,
    serviceRequests: source.serviceRequests,
    payments: source.payments,
    clients,
    messageThreads: source.messageThreads,
    messages: source.messages,
    notifications: source.notifications,
    alerts,
    blogPosts: source.blogPosts,
    visaServices: source.visaServices,
    studyAbroadRecords: source.studyAbroadRecords,
    tourPackages: source.tourPackages,
    destinationOptions: source.destinationOptions,
    testimonials: source.testimonials,
    faqs: source.faqs,
    contentBlocks: source.contentBlocks,
    servicePricing: source.servicePricing,
    settings: source.settings,
    adminUsers: source.adminUsers,
    auditLogs: source.auditLogs ?? [],
    chatThreads: source.chatThreads,
    chatMessages: source.chatMessages,
    visaApplications: source.visaApplications,
    tourEnquiries: source.tourEnquiries,
  };
}

export async function getAdminApplicationDetail(applicationId: string): Promise<AdminApplicationDetail> {
  const workspace = await getAdminWorkspace();
  const record = workspace.applications.find((item) => item.id === applicationId);
  if (!record) {
    throw new Error("Application not found.");
  }

  const source = await loadAdminWorkspaceSource();
  const meta = source.applicationMeta.find((item) => item.applicationId === applicationId);
  const consultationLinks = workspace.consultations.filter((item) => item.id === applicationId || item.userId && workspace.clients.some((client) => client.id === item.userId && client.user.email === record.clientEmail));

  return {
    ...record,
    clientPhone:
      workspace.visaApplications.find((item) => item.id === applicationId)?.phone ??
      workspace.consultations.find((item) => item.id === applicationId)?.phone ??
      workspace.tourEnquiries.find((item) => item.id === applicationId)?.phone,
    internalNotes: meta?.internalNotes,
    clientUpdates: meta?.clientUpdates ?? [],
    linkedChecklist: meta?.linkedChecklist ?? [],
    linkedDocuments: workspace.documents.filter((item) => item.applicationId === applicationId),
    linkedPayments: workspace.payments.filter((item) => item.applicationId === applicationId || item.consultationId === applicationId || item.serviceRequestId === applicationId),
    linkedConsultations: consultationLinks,
  };
}

export async function saveLeadMeta(leadId: string, patch: Partial<Omit<LeadMetaRecord, "leadId" | "updatedAt">>) {
  if (isApiConfigured) {
    try {
      await apiRequest("admin.lead-meta.save", {
        method: "POST",
        body: JSON.stringify({ leadId, ...patch }),
      });
      return;
    } catch (error) {
      if (!shouldFallbackToLocal(error)) {
        throw error;
      }
    }
  }

  const records = getLeadMetasLocal();
  const existing = records.find((item) => item.leadId === leadId);
  const next: LeadMetaRecord = {
    leadId,
    source: patch.source ?? existing?.source ?? "Contact form",
    serviceType: patch.serviceType ?? existing?.serviceType,
    destination: patch.destination ?? existing?.destination,
    assignedStaffId: patch.assignedStaffId ?? existing?.assignedStaffId,
    priority: patch.priority ?? existing?.priority ?? "medium",
    status: patch.status ?? existing?.status ?? "new",
    internalNotes: patch.internalNotes ?? existing?.internalNotes,
    archived: patch.archived ?? existing?.archived,
    updatedAt: new Date().toISOString(),
  };
  writeArray(
    STORAGE_KEYS.leadMeta,
    existing ? records.map((item) => (item.leadId === leadId ? next : item)) : [next, ...records],
  );
  recordLocalAudit("lead.update", "lead", leadId, "Updated lead workflow details.");
  if (patch.status) {
    await updateLeadStatus(leadId, patch.status as never);
  }
}

export async function saveApplicationMeta(applicationId: string, patch: Partial<Omit<ApplicationMetaRecord, "applicationId" | "updatedAt">>) {
  if (isApiConfigured) {
    try {
      await apiRequest("admin.application-meta.save", {
        method: "POST",
        body: JSON.stringify({ applicationId, ...patch }),
      });
      return;
    } catch (error) {
      if (!shouldFallbackToLocal(error)) {
        throw error;
      }
    }
  }

  const records = getApplicationMetasLocal();
  const existing = records.find((item) => item.applicationId === applicationId);
  const next: ApplicationMetaRecord = {
    applicationId,
    serviceType: patch.serviceType ?? existing?.serviceType ?? "travel-support",
    assignedStaffId: patch.assignedStaffId ?? existing?.assignedStaffId,
    currentStage: patch.currentStage ?? existing?.currentStage ?? "Enquiry received",
    internalNotes: patch.internalNotes ?? existing?.internalNotes,
    clientUpdates: patch.clientUpdates ?? existing?.clientUpdates ?? [],
    linkedChecklist: patch.linkedChecklist ?? existing?.linkedChecklist ?? [],
    updatedAt: new Date().toISOString(),
  };
  writeArray(
    STORAGE_KEYS.applicationMeta,
    existing ? records.map((item) => (item.applicationId === applicationId ? next : item)) : [next, ...records],
  );
  recordLocalAudit("application.update", "application", applicationId, "Updated application workflow metadata.");
}

export async function addClientUpdate(applicationId: string, message: string) {
  if (isApiConfigured) {
    try {
      await apiRequest("admin.application-update.add", {
        method: "POST",
        body: JSON.stringify({ applicationId, message }),
      });
      return;
    } catch (error) {
      if (!shouldFallbackToLocal(error)) {
        throw error;
      }
    }
  }

  const records = getApplicationMetasLocal();
  const existing = records.find((item) => item.applicationId === applicationId);
  const update: ClientFacingUpdate = { id: createId("client-update"), message, createdAt: new Date().toISOString() };
  await saveApplicationMeta(applicationId, {
    serviceType: existing?.serviceType,
    assignedStaffId: existing?.assignedStaffId,
    currentStage: existing?.currentStage,
    internalNotes: existing?.internalNotes,
    clientUpdates: [...(existing?.clientUpdates ?? []), update],
    linkedChecklist: existing?.linkedChecklist ?? [],
  });
}

export async function updateDocumentReview(documentId: string, status: AdminDocumentStatus, adminNotes?: string) {
  if (isApiConfigured) {
    try {
      await apiRequest("admin.document.review", {
        method: "POST",
        body: JSON.stringify({ documentId, status, adminNotes }),
      });
      return;
    } catch (error) {
      if (!shouldFallbackToLocal(error)) {
        throw error;
      }
    }
  }

  const documents = readArray<DocumentRecord>(STORAGE_KEYS.documents, []);
  writeArray(
    STORAGE_KEYS.documents,
    documents.map((item) =>
      item.id === documentId
        ? {
            ...item,
            status,
            adminNotes,
          }
        : item,
    ),
  );
  recordLocalAudit("document.review", "document", documentId, "Reviewed an uploaded document.");
}

export async function saveConsultationMeta(consultationId: string, patch: Partial<Omit<ConsultationMetaRecord, "consultationId" | "updatedAt">>) {
  if (isApiConfigured) {
    try {
      await apiRequest("admin.consultation-meta.save", {
        method: "POST",
        body: JSON.stringify({ consultationId, ...patch }),
      });
      return;
    } catch (error) {
      if (!shouldFallbackToLocal(error)) {
        throw error;
      }
    }
  }

  const records = getConsultationMetasLocal();
  const existing = records.find((item) => item.consultationId === consultationId);
  const next: ConsultationMetaRecord = {
    consultationId,
    assignedStaffId: patch.assignedStaffId ?? existing?.assignedStaffId,
    adminNotes: patch.adminNotes ?? existing?.adminNotes,
    clientVisibleNote: patch.clientVisibleNote ?? existing?.clientVisibleNote,
    updatedAt: new Date().toISOString(),
  };
  writeArray(
    STORAGE_KEYS.consultationMeta,
    existing ? records.map((item) => (item.consultationId === consultationId ? next : item)) : [next, ...records],
  );
  recordLocalAudit("consultation.update", "consultation", consultationId, "Updated consultation notes or assignment.");
}

export async function saveServiceRequestMeta(requestId: string, patch: Partial<Omit<ServiceRequestMetaRecord, "requestId" | "updatedAt">>) {
  if (isApiConfigured) {
    try {
      await apiRequest("admin.service-request-meta.save", {
        method: "POST",
        body: JSON.stringify({ requestId, ...patch }),
      });
      return;
    } catch (error) {
      if (!shouldFallbackToLocal(error)) {
        throw error;
      }
    }
  }

  const records = getServiceRequestMetasLocal();
  const existing = records.find((item) => item.requestId === requestId);
  const next: ServiceRequestMetaRecord = {
    requestId,
    assignedStaffId: patch.assignedStaffId ?? existing?.assignedStaffId,
    internalNotes: patch.internalNotes ?? existing?.internalNotes,
    updatedAt: new Date().toISOString(),
  };
  writeArray(
    STORAGE_KEYS.serviceRequestMeta,
    existing ? records.map((item) => (item.requestId === requestId ? next : item)) : [next, ...records],
  );
  recordLocalAudit("service_request.update", "service_request", requestId, "Updated service request notes or assignment.");
}

export async function updateServiceRequestRecord(requestId: string, patch: Partial<ServiceRequest>) {
  if (isApiConfigured) {
    try {
      await apiRequest("admin.service-request.update", {
        method: "POST",
        body: JSON.stringify({ requestId, ...patch }),
      });
      return;
    } catch (error) {
      if (!shouldFallbackToLocal(error)) {
        throw error;
      }
    }
  }

  const records = readArray<ServiceRequest>(STORAGE_KEYS.serviceRequests, []);
  writeArray(
    STORAGE_KEYS.serviceRequests,
    records.map((item) =>
      item.id === requestId ? { ...item, ...patch, updatedAt: new Date().toISOString() } : item,
    ),
  );
}

export async function updateConsultationRecord(consultationId: string, status: ConsultationBooking["status"]) {
  await updateConsultationStatus(consultationId, status);
}

export async function updateTourRecord(tourId: string, status: TourEnquiry["status"]) {
  await updateTourStatus(tourId, status);
}

export async function updateVisaRecord(applicationId: string, status: VisaApplication["status"], timelineStep: string) {
  await updateVisaStatus(applicationId, status, timelineStep);
}

export async function updatePaymentRecord(paymentId: string, patch: Partial<PaymentRecord>) {
  if (isApiConfigured) {
    try {
      await apiRequest("admin.payment.update", {
        method: "POST",
        body: JSON.stringify({ paymentId, ...patch }),
      });
      return;
    } catch (error) {
      if (!shouldFallbackToLocal(error)) {
        throw error;
      }
    }
  }

  const payments = readArray<PaymentRecord>(STORAGE_KEYS.payments, []);
  writeArray(
    STORAGE_KEYS.payments,
    payments.map((item) => (item.id === paymentId ? { ...item, ...patch } : item)),
  );
  recordLocalAudit("payment.update", "payment", paymentId, "Updated payment status or receipt details.");
}

export async function sendAdminReply(threadId: string, body: string) {
  if (isApiConfigured) {
    try {
      await apiRequest("admin.message.reply", {
        method: "POST",
        body: JSON.stringify({ threadId, body }),
      });
      return;
    } catch (error) {
      if (!shouldFallbackToLocal(error)) {
        throw error;
      }
    }
  }

  const messages = readArray<MessageEntry>(STORAGE_KEYS.messages, []);
  const threads = readArray<MessageThread>(STORAGE_KEYS.messageThreads, []);
  const createdAt = new Date().toISOString();
  const message: MessageEntry = {
    id: createId("msg"),
    threadId,
    sender: "agency",
    body,
    createdAt,
  };
  writeArray(STORAGE_KEYS.messages, [message, ...messages]);
  writeArray(
    STORAGE_KEYS.messageThreads,
    threads.map((item) => (item.id === threadId ? { ...item, lastMessageAt: createdAt } : item)),
  );
  recordLocalAudit("message.reply", "thread", threadId, "Sent an admin reply in a secure client thread.");
}

export async function markAdminAlertRead(alertId: string) {
  if (isApiConfigured) {
    try {
      await apiRequest("admin.alert.read", {
        method: "POST",
        body: JSON.stringify({ alertId }),
      });
      return;
    } catch (error) {
      if (!shouldFallbackToLocal(error)) {
        throw error;
      }
    }
  }

  const alerts = readArray<AdminAlertRecord>(STORAGE_KEYS.adminAlerts, []);
  writeArray(
    STORAGE_KEYS.adminAlerts,
    alerts.map((item) => (item.id === alertId ? { ...item, read: true } : item)),
  );
}

export async function markAllAdminAlertsRead() {
  if (isApiConfigured) {
    try {
      await apiRequest("admin.alert.read-all", {
        method: "POST",
      });
      return;
    } catch (error) {
      if (!shouldFallbackToLocal(error)) {
        throw error;
      }
    }
  }

  const alerts = readArray<AdminAlertRecord>(STORAGE_KEYS.adminAlerts, []);
  writeArray(
    STORAGE_KEYS.adminAlerts,
    alerts.map((item) => ({ ...item, read: true })),
  );
}

async function upsertCollectionItem<T extends { id: string }>(key: string, item: T) {
  const records = readArray<T>(key, []);
  writeArray(key, records.some((entry) => entry.id === item.id) ? records.map((entry) => (entry.id === item.id ? item : entry)) : [item, ...records]);
}

async function saveRemoteCollectionItem(collection: string, item: unknown) {
  await apiRequest("admin.collection.save", {
    method: "POST",
    body: JSON.stringify({ collection, item }),
  });
}

export async function saveVisaService(item: VisaServiceRecord) {
  if (isApiConfigured) {
    try {
      await saveRemoteCollectionItem("visaServices", item);
      return;
    } catch (error) {
      if (!shouldFallbackToLocal(error)) {
        throw error;
      }
    }
  }
  await upsertCollectionItem(STORAGE_KEYS.visaServices, item);
  recordLocalAudit("collection.save", "visaServices", item.id, "Saved a visa service item.");
}

export async function saveStudyAbroadRecord(item: StudyAbroadRecord) {
  if (isApiConfigured) {
    try {
      await saveRemoteCollectionItem("studyAbroadRecords", item);
      return;
    } catch (error) {
      if (!shouldFallbackToLocal(error)) {
        throw error;
      }
    }
  }
  await upsertCollectionItem(STORAGE_KEYS.studyAbroadRecords, item);
  recordLocalAudit("collection.save", "studyAbroadRecords", item.id, "Saved a study abroad content item.");
}

export async function saveTourPackage(item: TourPackageRecord) {
  if (isApiConfigured) {
    try {
      await saveRemoteCollectionItem("tourPackages", item);
      return;
    } catch (error) {
      if (!shouldFallbackToLocal(error)) {
        throw error;
      }
    }
  }
  await upsertCollectionItem(STORAGE_KEYS.tourPackages, item);
  recordLocalAudit("collection.save", "tourPackages", item.id, "Saved a tour package.");
}

export async function saveDestinationOption(item: DestinationOptionRecord) {
  if (isApiConfigured) {
    try {
      await saveRemoteCollectionItem("destinationOptions", item);
      return;
    } catch (error) {
      if (!shouldFallbackToLocal(error)) {
        throw error;
      }
    }
  }
  await upsertCollectionItem(STORAGE_KEYS.destinationOptions, item);
  recordLocalAudit("collection.save", "destinationOptions", item.id, "Saved a destination option.");
}

export async function saveTestimonial(item: TestimonialRecord) {
  if (isApiConfigured) {
    try {
      await saveRemoteCollectionItem("testimonials", item);
      return;
    } catch (error) {
      if (!shouldFallbackToLocal(error)) {
        throw error;
      }
    }
  }
  await upsertCollectionItem(STORAGE_KEYS.testimonials, item);
  recordLocalAudit("collection.save", "testimonials", item.id, "Saved a testimonial record.");
}

export async function saveFaq(item: FAQRecord) {
  if (isApiConfigured) {
    try {
      await saveRemoteCollectionItem("faqs", item);
      return;
    } catch (error) {
      if (!shouldFallbackToLocal(error)) {
        throw error;
      }
    }
  }
  await upsertCollectionItem(STORAGE_KEYS.faqs, item);
  recordLocalAudit("collection.save", "faqs", item.id, "Saved an FAQ item.");
}

export async function saveContentBlock(item: ContentBlockRecord) {
  if (isApiConfigured) {
    try {
      await saveRemoteCollectionItem("contentBlocks", item);
      return;
    } catch (error) {
      if (!shouldFallbackToLocal(error)) {
        throw error;
      }
    }
  }
  await upsertCollectionItem(STORAGE_KEYS.contentBlocks, item);
  recordLocalAudit("collection.save", "contentBlocks", item.id, "Saved a content block.");
}

export async function saveServicePricing(item: ServicePricingRecord) {
  if (isApiConfigured) {
    try {
      await saveRemoteCollectionItem("servicePricing", item);
      return;
    } catch (error) {
      if (!shouldFallbackToLocal(error)) {
        throw error;
      }
    }
  }
  await upsertCollectionItem(STORAGE_KEYS.servicePricing, item);
  recordLocalAudit("collection.save", "servicePricing", item.id, "Saved a service pricing record.");
}

export async function assignChatThread(threadId: string, assignedStaffId?: string) {
  if (isApiConfigured) {
    try {
      await apiRequest("admin.chat.assign", {
        method: "POST",
        body: JSON.stringify({ threadId, assignedStaffId }),
      });
      return;
    } catch (error) {
      if (!shouldFallbackToLocal(error)) {
        throw error;
      }
    }
  }

  const threads = readArray<ChatThreadRecord>(STORAGE_KEYS.chatThreads, []);
  writeArray(
    STORAGE_KEYS.chatThreads,
    threads.map((thread) => (thread.id === threadId ? { ...thread, assignedStaffId } : thread)),
  );
  recordLocalAudit("chat.assign", "chat_thread", threadId, "Assigned a live chat thread.");
}

export async function sendChatReply(threadId: string, body: string, senderName = "GenieHub Team") {
  if (isApiConfigured) {
    try {
      await apiRequest("admin.chat.reply", {
        method: "POST",
        body: JSON.stringify({ threadId, body, senderName }),
      });
      return;
    } catch (error) {
      if (!shouldFallbackToLocal(error)) {
        throw error;
      }
    }
  }

  const message: ChatMessageRecord = {
    id: createId("chat-message"),
    threadId,
    senderRole: "staff",
    senderName,
    body,
    createdAt: new Date().toISOString(),
  };
  const messages = readArray<ChatMessageRecord>(STORAGE_KEYS.chatMessages, []);
  writeArray(STORAGE_KEYS.chatMessages, [message, ...messages]);

  const threads = readArray<ChatThreadRecord>(STORAGE_KEYS.chatThreads, []);
  writeArray(
    STORAGE_KEYS.chatThreads,
    threads.map((thread) =>
      thread.id === threadId ? { ...thread, unreadCount: 0, lastMessageAt: message.createdAt } : thread,
    ),
  );
  recordLocalAudit("chat.reply", "chat_thread", threadId, "Replied to a synced live chat thread.");
}

export async function saveAdminUser(item: AdminUserRecord) {
  if (isApiConfigured) {
    try {
      await saveRemoteCollectionItem("adminUsers", item);
      return;
    } catch (error) {
      if (!shouldFallbackToLocal(error)) {
        throw error;
      }
    }
  }
  await upsertCollectionItem(STORAGE_KEYS.adminUsers, item);
  const users = readArray<SessionUser>(STORAGE_KEYS.users, []);
  writeArray(
    STORAGE_KEYS.users,
    users.map((user) =>
      user.id === (item.linkedUserId ?? item.id)
        ? { ...user, fullName: item.fullName, email: item.email, phone: item.phone, adminRole: item.role }
        : user,
    ),
  );
  recordLocalAudit("collection.save", "adminUsers", item.id, "Saved an admin user profile.");
}

export async function createAdminStaffAccount(payload: {
  fullName: string;
  email: string;
  phone?: string;
  adminRole: AdminUserRecord["role"];
  isChatAgent?: boolean;
}) {
  return createStaffAccount(payload);
}

export async function resetAdminStaffPassword(staffUserId: string) {
  return resetStaffPassword(staffUserId);
}

export async function deleteCollectionItem(key: string, id: string) {
  if (isApiConfigured) {
    const collectionMap: Record<string, string> = {
      [STORAGE_KEYS.visaServices]: "visaServices",
      [STORAGE_KEYS.studyAbroadRecords]: "studyAbroadRecords",
      [STORAGE_KEYS.tourPackages]: "tourPackages",
      [STORAGE_KEYS.destinationOptions]: "destinationOptions",
      [STORAGE_KEYS.testimonials]: "testimonials",
      [STORAGE_KEYS.faqs]: "faqs",
      [STORAGE_KEYS.contentBlocks]: "contentBlocks",
      [STORAGE_KEYS.servicePricing]: "servicePricing",
      [STORAGE_KEYS.adminUsers]: "adminUsers",
    };
    const collection = collectionMap[key];
    if (!collection) {
      return;
    }
    try {
      await apiRequest("admin.collection.delete", {
        method: "POST",
        body: JSON.stringify({ collection, id }),
      });
      return;
    } catch (error) {
      if (!shouldFallbackToLocal(error)) {
        throw error;
      }
    }
  }

  const records = readArray<{ id: string }>(key, []);
  writeArray(key, records.filter((item) => item.id !== id));
  recordLocalAudit("collection.delete", key, id, "Deleted an admin collection item.");
}

export async function saveAdminSettings(settings: AppSettings) {
  await saveSettings(settings);
}

export async function saveAdminBlogPost(post: BlogPost) {
  await saveBlogPost(post);
}

export async function deleteAdminBlogPost(postId: string) {
  await deleteBlogPost(postId);
}
