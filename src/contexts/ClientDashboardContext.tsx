import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import {
  getClientApplicationDetail,
  getClientWorkspace,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  saveClientProfile,
  sendClientMessage,
  submitServiceRequest,
  updateClientConsultation,
} from "@/lib/clientWorkspace";
import { submitConsultation } from "@/lib/backend";
import type {
  ClientApplicationDetail,
  ClientProfile,
  ClientWorkspaceData,
  ConsultationBooking,
  ConsultationStatus,
  ServiceRequest,
} from "@/lib/types";

interface ClientDashboardContextValue {
  workspace: ClientWorkspaceData | null;
  loading: boolean;
  refresh: () => Promise<void>;
  getApplicationDetail: (applicationId: string) => Promise<ClientApplicationDetail>;
  saveProfile: (profile: ClientProfile) => Promise<void>;
  bookConsultation: (payload: Omit<ConsultationBooking, "id" | "status" | "createdAt" | "updatedAt">) => Promise<void>;
  createServiceRequest: (payload: Omit<ServiceRequest, "id" | "status" | "createdAt" | "updatedAt">) => Promise<void>;
  sendMessage: (payload: { body: string; subject?: string; threadId?: string }) => Promise<void>;
  updateConsultation: (consultationId: string, payload: { status?: ConsultationStatus; date?: string; time?: string }) => Promise<void>;
  markNotificationRead: (notificationId: string) => Promise<void>;
  markAllRead: () => Promise<void>;
}

const ClientDashboardContext = createContext<ClientDashboardContextValue | undefined>(undefined);

export function ClientDashboardProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [workspace, setWorkspace] = useState<ClientWorkspaceData | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) {
      setWorkspace(null);
      setLoading(false);
      return;
    }

    const initialLoad = workspace === null;
    if (initialLoad) {
      setLoading(true);
    }
    try {
      const nextWorkspace = await getClientWorkspace();
      setWorkspace(nextWorkspace);
    } finally {
      setLoading(false);
    }
  }, [user, workspace]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function saveProfile(profile: ClientProfile) {
    const previousWorkspace = workspace;
    setWorkspace((current) => (current ? { ...current, profile } : current));
    try {
      await saveClientProfile(profile);
      void refresh();
    } catch (error) {
      setWorkspace(previousWorkspace);
      throw error;
    }
  }

  async function bookConsultation(payload: Omit<ConsultationBooking, "id" | "status" | "createdAt" | "updatedAt">) {
    const record = await submitConsultation(payload);
    setWorkspace((current) =>
      current
        ? {
            ...current,
            consultations: [record, ...current.consultations],
          }
        : current,
    );
    void refresh();
  }

  async function createServiceRequest(payload: Omit<ServiceRequest, "id" | "status" | "createdAt" | "updatedAt">) {
    const record = await submitServiceRequest(payload);
    setWorkspace((current) =>
      current
        ? {
            ...current,
            serviceRequests: [record, ...current.serviceRequests],
          }
        : current,
    );
    void refresh();
  }

  async function sendMessage(payload: { body: string; subject?: string; threadId?: string }) {
    if (!user) return;
    const response = await sendClientMessage({ userId: user.id, ...payload });
    setWorkspace((current) => {
      if (!current) return current;
      const nextThreads = current.messageThreads.some((thread) => thread.id === response.thread.id)
        ? current.messageThreads.map((thread) => (thread.id === response.thread.id ? response.thread : thread))
        : [response.thread, ...current.messageThreads];
      const nextMessages = [response.message, ...current.messages];
      return {
        ...current,
        messageThreads: nextThreads,
        messages: nextMessages,
      };
    });
    void refresh();
  }

  async function updateConsultation(
    consultationId: string,
    payload: { status?: ConsultationStatus; date?: string; time?: string },
  ) {
    const previousWorkspace = workspace;
    setWorkspace((current) =>
      current
        ? {
            ...current,
            consultations: current.consultations.map((consultation) =>
              consultation.id === consultationId ? { ...consultation, ...payload } : consultation,
            ),
          }
        : current,
    );
    try {
      await updateClientConsultation(consultationId, payload);
      void refresh();
    } catch (error) {
      setWorkspace(previousWorkspace);
      throw error;
    }
  }

  async function markNotificationRead(notificationId: string) {
    const previousWorkspace = workspace;
    setWorkspace((current) =>
      current
        ? {
            ...current,
            notifications: current.notifications.map((notification) =>
              notification.id === notificationId ? { ...notification, read: true } : notification,
            ),
          }
        : current,
    );
    try {
      await markNotificationAsRead(notificationId);
      void refresh();
    } catch (error) {
      setWorkspace(previousWorkspace);
      throw error;
    }
  }

  async function markAllRead() {
    if (!user) return;
    const previousWorkspace = workspace;
    setWorkspace((current) =>
      current
        ? {
            ...current,
            notifications: current.notifications.map((notification) => ({ ...notification, read: true })),
          }
        : current,
    );
    try {
      await markAllNotificationsAsRead(user.id);
      void refresh();
    } catch (error) {
      setWorkspace(previousWorkspace);
      throw error;
    }
  }

  return (
    <ClientDashboardContext.Provider
      value={{
        workspace,
        loading,
        refresh,
        getApplicationDetail: getClientApplicationDetail,
        saveProfile,
        bookConsultation,
        createServiceRequest,
        sendMessage,
        updateConsultation,
        markNotificationRead,
        markAllRead,
      }}
    >
      {children}
    </ClientDashboardContext.Provider>
  );
}

export function useClientDashboard() {
  const context = useContext(ClientDashboardContext);
  if (!context) {
    throw new Error("useClientDashboard must be used within a ClientDashboardProvider");
  }

  return context;
}
