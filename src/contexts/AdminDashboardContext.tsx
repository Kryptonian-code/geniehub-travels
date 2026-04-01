import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from "react";
import {
  addClientUpdate,
  createAdminStaffAccount,
  deleteAdminBlogPost,
  deleteCollectionItem,
  getAdminApplicationDetail,
  getAdminWorkspace,
  markAdminAlertRead,
  markAllAdminAlertsRead,
  resetAdminStaffPassword,
  saveAdminBlogPost,
  saveAdminSettings,
  saveAdminUser,
  saveApplicationMeta,
  saveConsultationMeta,
  saveContentBlock,
  saveFaq,
  saveLeadMeta,
  saveServicePricing,
  saveServiceRequestMeta,
  saveStudyAbroadRecord,
  saveTestimonial,
  saveTourPackage,
  saveDestinationOption,
  saveVisaService,
  assignChatThread,
  sendChatReply,
  sendAdminReply,
  updateConsultationRecord,
  updateDocumentReview,
  updatePaymentRecord,
  updateServiceRequestRecord,
  updateTourRecord,
  updateVisaRecord,
} from "@/lib/adminData";
import { useSiteData } from "./SiteDataContext";
import type {
  AdminAlertRecord,
  AdminApplicationDetail,
  AdminUserRecord,
  AdminWorkspaceData,
  ContentBlockRecord,
  FAQRecord,
  StudyAbroadRecord,
  TestimonialRecord,
  TourPackageRecord,
  DestinationOptionRecord,
  VisaServiceRecord,
} from "@/lib/adminTypes";
import type { AppSettings, BlogPost, ConsultationBooking, PaymentRecord, ServicePricingRecord, ServiceRequest, VisaApplication } from "@/lib/types";

interface AdminDashboardContextValue {
  workspace: AdminWorkspaceData | null;
  loading: boolean;
  refresh: () => Promise<void>;
  getApplicationDetail: (applicationId: string) => Promise<AdminApplicationDetail>;
  saveLead: typeof saveLeadMeta;
  saveApplication: typeof saveApplicationMeta;
  addClientUpdate: (applicationId: string, message: string) => Promise<void>;
  reviewDocument: (documentId: string, status: "pending-review" | "approved" | "rejected" | "re-upload-required", adminNotes?: string) => Promise<void>;
  updateConsultation: (consultationId: string, status: ConsultationBooking["status"]) => Promise<void>;
  updateServiceRequest: (requestId: string, patch: Partial<ServiceRequest>) => Promise<void>;
  updateTour: (tourId: string, status: string) => Promise<void>;
  updateVisa: (applicationId: string, status: VisaApplication["status"], timelineStep: string) => Promise<void>;
  updatePayment: (paymentId: string, patch: Partial<PaymentRecord>) => Promise<void>;
  saveConsultationMeta: typeof saveConsultationMeta;
  saveServiceRequestMeta: typeof saveServiceRequestMeta;
  sendReply: (threadId: string, body: string) => Promise<void>;
  markAlertRead: (alertId: string) => Promise<void>;
  markAllAlertsRead: () => Promise<void>;
  saveBlogPost: (post: BlogPost) => Promise<void>;
  deleteBlogPost: (postId: string) => Promise<void>;
  saveSettings: (settings: AppSettings) => Promise<void>;
  saveVisaService: (item: VisaServiceRecord) => Promise<void>;
  saveStudyAbroadRecord: (item: StudyAbroadRecord) => Promise<void>;
  saveTourPackage: (item: TourPackageRecord) => Promise<void>;
  saveDestinationOption: (item: DestinationOptionRecord) => Promise<void>;
  saveTestimonial: (item: TestimonialRecord) => Promise<void>;
  saveFaq: (item: FAQRecord) => Promise<void>;
  saveContentBlock: (item: ContentBlockRecord) => Promise<void>;
  saveServicePricing: (item: ServicePricingRecord) => Promise<void>;
  saveAdminUser: (item: AdminUserRecord) => Promise<void>;
  assignChat: (threadId: string, assignedStaffId?: string) => Promise<void>;
  sendChatReply: (threadId: string, body: string, senderName?: string) => Promise<void>;
  createStaffAccount: (payload: { fullName: string; email: string; phone?: string; adminRole: AdminUserRecord["role"]; isChatAgent?: boolean }) => Promise<{ adminUser: { id: string }; tempPassword: string }>;
  resetStaffPassword: (staffUserId: string) => Promise<{ tempPassword: string }>;
  deleteCollectionItem: (key: string, id: string) => Promise<void>;
}

const AdminDashboardContext = createContext<AdminDashboardContextValue | undefined>(undefined);

export function AdminDashboardProvider({ children }: { children: ReactNode }) {
  const [workspace, setWorkspace] = useState<AdminWorkspaceData | null>(null);
  const [loading, setLoading] = useState(true);
  const { refreshAll } = useSiteData();

  const refresh = useCallback(async () => {
    const initialLoad = workspace === null;
    if (initialLoad) {
      setLoading(true);
    }
    try {
      const nextWorkspace = await getAdminWorkspace();
      setWorkspace(nextWorkspace);
    } finally {
      setLoading(false);
    }
  }, [workspace]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function runAndRefresh(task: () => Promise<void>) {
    await task();
    void refresh();
  }

  async function runOptimistic(task: () => Promise<void>, apply: (current: AdminWorkspaceData) => AdminWorkspaceData) {
    const previousWorkspace = workspace;
    if (previousWorkspace) {
      setWorkspace(apply(previousWorkspace));
    }
    try {
      await task();
      void refresh();
    } catch (error) {
      setWorkspace(previousWorkspace);
      throw error;
    }
  }

  return (
    <AdminDashboardContext.Provider
      value={{
        workspace,
        loading,
        refresh,
        getApplicationDetail: getAdminApplicationDetail,
        saveLead: async (leadId, patch) =>
          runOptimistic(
            () => saveLeadMeta(leadId, patch),
            (current) => ({
              ...current,
              leads: current.leads.map((lead) =>
                lead.id === leadId
                  ? {
                      ...lead,
                      ...patch,
                      updatedAt: new Date().toISOString(),
                    }
                  : lead,
              ),
            }),
          ),
        saveApplication: async (...args) => runAndRefresh(() => saveApplicationMeta(...args)),
        addClientUpdate: async (applicationId, message) => runAndRefresh(() => addClientUpdate(applicationId, message)),
        reviewDocument: async (documentId, status, adminNotes) =>
          runOptimistic(
            () => updateDocumentReview(documentId, status, adminNotes),
            (current) => ({
              ...current,
              documents: current.documents.map((document) =>
                document.id === documentId ? { ...document, status, adminNotes } : document,
              ),
            }),
          ),
        updateConsultation: async (consultationId, status) =>
          runOptimistic(
            () => updateConsultationRecord(consultationId, status),
            (current) => ({
              ...current,
              consultations: current.consultations.map((consultation) =>
                consultation.id === consultationId ? { ...consultation, status } : consultation,
              ),
            }),
          ),
        updateServiceRequest: async (requestId, patch) =>
          runOptimistic(
            () => updateServiceRequestRecord(requestId, patch),
            (current) => ({
              ...current,
              serviceRequests: current.serviceRequests.map((request) =>
                request.id === requestId ? { ...request, ...patch } : request,
              ),
            }),
          ),
        updateTour: async (tourId, status) => runAndRefresh(() => updateTourRecord(tourId, status as never)),
        updateVisa: async (applicationId, status, timelineStep) => runAndRefresh(() => updateVisaRecord(applicationId, status, timelineStep)),
        updatePayment: async (paymentId, patch) =>
          runOptimistic(
            () => updatePaymentRecord(paymentId, patch),
            (current) => ({
              ...current,
              payments: current.payments.map((payment) =>
                payment.id === paymentId ? { ...payment, ...patch } : payment,
              ),
            }),
          ),
        saveConsultationMeta: async (...args) => runAndRefresh(() => saveConsultationMeta(...args)),
        saveServiceRequestMeta: async (...args) => runAndRefresh(() => saveServiceRequestMeta(...args)),
        sendReply: async (threadId, body) =>
          runOptimistic(
            () => sendAdminReply(threadId, body),
            (current) => ({
              ...current,
              messages: [
                {
                  id: `local-${Date.now()}`,
                  threadId,
                  sender: "agency",
                  senderName: "GenieHub Team",
                  senderRole: "agency",
                  body,
                  createdAt: new Date().toISOString(),
                },
                ...current.messages,
              ],
              messageThreads: current.messageThreads.map((thread) =>
                thread.id === threadId ? { ...thread, lastMessageAt: new Date().toISOString() } : thread,
              ),
            }),
          ),
        markAlertRead: async (alertId) =>
          runOptimistic(
            () => markAdminAlertRead(alertId),
            (current) => ({
              ...current,
              alerts: current.alerts.map((alert) => (alert.id === alertId ? { ...alert, read: true } : alert)),
            }),
          ),
        markAllAlertsRead: async () =>
          runOptimistic(
            () => markAllAdminAlertsRead(),
            (current) => ({
              ...current,
              alerts: current.alerts.map((alert) => ({ ...alert, read: true })),
            }),
          ),
        saveBlogPost: async (post) => {
          await runAndRefresh(() => saveAdminBlogPost(post));
          await refreshAll();
        },
        deleteBlogPost: async (postId) => {
          await runAndRefresh(() => deleteAdminBlogPost(postId));
          await refreshAll();
        },
        saveSettings: async (settings) => {
          await runAndRefresh(() => saveAdminSettings(settings));
          await refreshAll();
        },
        saveVisaService: async (item) => runAndRefresh(() => saveVisaService(item)),
        saveStudyAbroadRecord: async (item) => runAndRefresh(() => saveStudyAbroadRecord(item)),
        saveTourPackage: async (item) => runAndRefresh(() => saveTourPackage(item)),
        saveDestinationOption: async (item) => runAndRefresh(() => saveDestinationOption(item)),
        saveTestimonial: async (item) => {
          await runAndRefresh(() => saveTestimonial(item));
          await refreshAll();
        },
        saveFaq: async (item) => {
          await runAndRefresh(() => saveFaq(item));
          await refreshAll();
        },
        saveContentBlock: async (item) => {
          await runAndRefresh(() => saveContentBlock(item));
          await refreshAll();
        },
        saveServicePricing: async (item) => {
          await runAndRefresh(() => saveServicePricing(item));
          await refreshAll();
        },
        saveAdminUser: async (item) => runAndRefresh(() => saveAdminUser(item)),
        assignChat: async (threadId, assignedStaffId) =>
          runOptimistic(
            () => assignChatThread(threadId, assignedStaffId),
            (current) => ({
              ...current,
              chatThreads: current.chatThreads.map((thread) =>
                thread.id === threadId ? { ...thread, assignedStaffId } : thread,
              ),
            }),
          ),
        sendChatReply: async (threadId, body, senderName) =>
          runOptimistic(
            () => sendChatReply(threadId, body, senderName),
            (current) => ({
              ...current,
              chatMessages: [
                {
                  id: `local-chat-${Date.now()}`,
                  threadId,
                  senderRole: "staff",
                  senderName: senderName ?? "GenieHub Team",
                  body,
                  createdAt: new Date().toISOString(),
                },
                ...current.chatMessages,
              ],
              chatThreads: current.chatThreads.map((thread) =>
                thread.id === threadId
                  ? { ...thread, unreadCount: 0, lastMessageAt: new Date().toISOString() }
                  : thread,
              ),
            }),
          ),
        createStaffAccount: async (payload) => {
          const result = await createAdminStaffAccount(payload);
          await refresh();
          return result;
        },
        resetStaffPassword: async (staffUserId) => {
          const result = await resetAdminStaffPassword(staffUserId);
          await refresh();
          return result;
        },
        deleteCollectionItem: async (key, id) => {
          await runAndRefresh(() => deleteCollectionItem(key, id));
          if (["geniehub-admin-testimonials", "geniehub-admin-faqs", "geniehub-admin-content-blocks", "geniehub-admin-service-pricing", "geniehub-admin-tour-packages"].includes(key)) {
            await refreshAll();
          }
        },
      }}
    >
      {children}
    </AdminDashboardContext.Provider>
  );
}

export function useAdminDashboard() {
  const context = useContext(AdminDashboardContext);
  if (!context) {
    throw new Error("useAdminDashboard must be used within an AdminDashboardProvider");
  }

  return context;
}
