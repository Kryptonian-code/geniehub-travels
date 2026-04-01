import { DEFAULT_BLOG_POSTS, DEFAULT_SETTINGS } from "./defaults";
import {
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
import { readStorage, STORAGE_KEYS, writeStorage, createId } from "./storage";
import { apiRequest, isApiConfigured, shouldFallbackToLocalApi } from "./api";
import {
  addChecklistItems,
  addPayment,
  completeChecklistForPath,
  initializeClientWorkspace,
  pushNotification,
} from "./clientWorkspace";
import { validateUploadFile } from "./validation";
import type {
  AdminRole,
  AppSettings,
  BlogPost,
  ServicePricingRecord,
  ConsultationBooking,
  ContactLead,
  DashboardSnapshot,
  DocumentCategory,
  DocumentRecord,
  SessionUser,
  TourEnquiry,
  UserProfile,
  VisaApplication,
} from "./types";
import type { ChatMessageRecord, ChatThreadRecord, ContentBlockRecord, DestinationOptionRecord, StudyAbroadRecord, VisaServiceRecord } from "./adminTypes";

function shouldFallbackToLocal(error: unknown) {
  return shouldFallbackToLocalApi(error);
}

function ensureLocalBootstrap() {
  const settings = readStorage<AppSettings | null>(STORAGE_KEYS.settings, null);
  if (!settings) {
    writeStorage(STORAGE_KEYS.settings, DEFAULT_SETTINGS);
  }

  for (const key of [
    STORAGE_KEYS.users,
    STORAGE_KEYS.profiles,
    STORAGE_KEYS.serviceRequests,
    STORAGE_KEYS.payments,
    STORAGE_KEYS.checklistItems,
    STORAGE_KEYS.messageThreads,
    STORAGE_KEYS.messages,
    STORAGE_KEYS.notifications,
    STORAGE_KEYS.passwordResetTokens,
    STORAGE_KEYS.auditLogs,
    STORAGE_KEYS.clientErrorLogs,
  ]) {
    if (!window.localStorage.getItem(key)) {
      window.localStorage.setItem(key, JSON.stringify([]));
    }
  }

  const collectionBootstrap: Array<[string, unknown[]]> = [
    [STORAGE_KEYS.blogPosts, []],
    [STORAGE_KEYS.adminUsers, []],
    [STORAGE_KEYS.contentBlocks, []],
    [STORAGE_KEYS.servicePricing, []],
    [STORAGE_KEYS.tourPackages, []],
    [STORAGE_KEYS.chatThreads, []],
    [STORAGE_KEYS.chatMessages, []],
  ];

  for (const [key, value] of collectionBootstrap) {
    if (!window.localStorage.getItem(key)) {
      writeStorage(key, value);
    }
  }
}

ensureLocalBootstrap();

function toProfile(user: SessionUser): UserProfile {
  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    phone: user.phone,
    role: user.role,
    adminRole: user.adminRole,
    authProvider: "local",
    mustChangePassword: user.mustChangePassword,
    createdAt: user.createdAt,
  };
}

function generateTemporaryPassword() {
  return `Genie${Math.random().toString(36).slice(2, 6).toUpperCase()}${Math.floor(100 + Math.random() * 900)}!`;
}

function generateResetToken() {
  return `${crypto.randomUUID().replaceAll("-", "")}${Date.now().toString(36)}`;
}

async function uploadLocalFile(file: File) {
  const fileUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.readAsDataURL(file);
  });

  return fileUrl;
}

export async function uploadMediaAsset(file: File) {
  validateUploadFile(file);

  if (isApiConfigured) {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await apiRequest<{ asset: { fileName: string; fileUrl: string; filePath?: string; mimeType?: string; fileSize: number } }>("admin.media.upload", {
        method: "POST",
        body: formData,
      });
      return response.asset;
    } catch (error) {
      if (!shouldFallbackToLocal(error)) {
        throw error;
      }
    }
  }

  const fileUrl = await uploadLocalFile(file);
  return {
    fileName: file.name,
    fileUrl,
    mimeType: file.type || "application/octet-stream",
    fileSize: file.size,
  };
}

export async function signUpLocal(payload: {
  fullName: string;
  email: string;
  phone?: string;
  password: string;
}) {
  const users = readStorage<SessionUser[]>(STORAGE_KEYS.users, []);
  if (users.some((user) => user.email.toLowerCase() === payload.email.toLowerCase())) {
    throw new Error("An account with that email already exists.");
  }

  const user: SessionUser = {
    id: createId("user"),
    email: payload.email.toLowerCase(),
    fullName: payload.fullName,
    phone: payload.phone,
    role: "client",
    authProvider: "local",
    mustChangePassword: false,
    createdAt: new Date().toISOString(),
    password: payload.password,
  };

  writeStorage(STORAGE_KEYS.users, [...users, user]);
  writeStorage(STORAGE_KEYS.session, toProfile(user));
  initializeClientWorkspace(toProfile(user));
  return toProfile(user);
}

export async function signInLocal(email: string, password: string) {
  const users = readStorage<SessionUser[]>(STORAGE_KEYS.users, []);
  const user = users.find(
    (candidate) =>
      candidate.email.toLowerCase() === email.toLowerCase() && candidate.password === password,
  );

  if (!user) {
    throw new Error("Incorrect email or password.");
  }

  writeStorage(STORAGE_KEYS.session, toProfile(user));
  initializeClientWorkspace(toProfile(user));
  return toProfile(user);
}

export async function getStoredSession() {
  if (isApiConfigured) {
    try {
      const response = await apiRequest<{ user: UserProfile | null }>("auth.session", {
        method: "GET",
      });
      return response.user;
    } catch (error) {
      if (!shouldFallbackToLocal(error)) {
        throw error;
      }
    }
  }

  const session = readStorage<UserProfile | null>(STORAGE_KEYS.session, null);
  if (!session) {
    return null;
  }

  const users = readStorage<SessionUser[]>(STORAGE_KEYS.users, []);
  const matched = users.find((user) => user.id === session.id);
  return matched ? toProfile(matched) : session;
}

export async function updatePassword(newPassword: string) {
  if (isApiConfigured) {
    try {
      await apiRequest<{ ok: boolean }>("auth.password.update", {
        method: "POST",
        body: JSON.stringify({ newPassword }),
      });
      return;
    } catch (error) {
      if (!shouldFallbackToLocal(error)) {
        throw error;
      }
    }
  }

  const session = readStorage<UserProfile | null>(STORAGE_KEYS.session, null);
  if (!session) {
    throw new Error("No active session found.");
  }

  const users = readStorage<SessionUser[]>(STORAGE_KEYS.users, []);
  const updatedUsers = users.map((user) =>
    user.id === session.id
      ? { ...user, password: newPassword, mustChangePassword: false }
      : user,
  );
  const updatedUser = updatedUsers.find((user) => user.id === session.id);
  writeStorage(STORAGE_KEYS.users, updatedUsers);
  if (session.role === "admin") {
    const adminUsers = readStorage(STORAGE_KEYS.adminUsers, DEFAULT_ADMIN_USERS);
    writeStorage(
      STORAGE_KEYS.adminUsers,
      adminUsers.map((user) =>
        user.linkedUserId === session.id || user.id === session.id
          ? { ...user, mustChangePassword: false, lastPasswordResetAt: new Date().toISOString() }
          : user,
      ),
    );
  }
  if (updatedUser) {
    writeStorage(STORAGE_KEYS.session, toProfile(updatedUser));
  }
}

export async function requestPasswordReset(email: string) {
  if (isApiConfigured) {
    return apiRequest<{ ok: boolean; message: string; resetUrl?: string }>("auth.password.request", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  }

  const users = readStorage<SessionUser[]>(STORAGE_KEYS.users, []);
  const user = users.find((candidate) => candidate.email.toLowerCase() === email.toLowerCase());
  const message = "If that account exists, a secure recovery link is now ready.";
  if (!user) {
    return { ok: true, message };
  }

  const tokens = readStorage<Array<{ token: string; userId: string; expiresAt: string }>>(STORAGE_KEYS.passwordResetTokens, []);
  const token = generateResetToken();
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();
  writeStorage(STORAGE_KEYS.passwordResetTokens, [{ token, userId: user.id, expiresAt }, ...tokens]);

  return {
    ok: true,
    message,
    resetUrl: `${window.location.origin}/recover-password?token=${token}`,
  };
}

export async function consumePasswordReset(token: string, newPassword: string) {
  if (newPassword.length < 8) {
    throw new Error("Use at least 8 characters for the new password.");
  }

  if (isApiConfigured) {
    await apiRequest<{ ok: boolean }>("auth.password.recover", {
      method: "POST",
      body: JSON.stringify({ token, newPassword }),
    });
    return;
  }

  const tokens = readStorage<Array<{ token: string; userId: string; expiresAt: string }>>(STORAGE_KEYS.passwordResetTokens, []);
  const match = tokens.find((item) => item.token === token);
  if (!match || new Date(match.expiresAt).getTime() < Date.now()) {
    throw new Error("This recovery link is no longer valid.");
  }

  const users = readStorage<SessionUser[]>(STORAGE_KEYS.users, []);
  const updatedUsers = users.map((user) =>
    user.id === match.userId ? { ...user, password: newPassword, mustChangePassword: false } : user,
  );
  writeStorage(STORAGE_KEYS.users, updatedUsers);
  const adminUsers = readStorage(STORAGE_KEYS.adminUsers, DEFAULT_ADMIN_USERS);
  writeStorage(
    STORAGE_KEYS.adminUsers,
    adminUsers.map((user) =>
      user.linkedUserId === match.userId || user.id === match.userId
        ? { ...user, mustChangePassword: false, lastPasswordResetAt: new Date().toISOString() }
        : user,
    ),
  );
  writeStorage(
    STORAGE_KEYS.passwordResetTokens,
    tokens.filter((item) => item.token !== token),
  );
}

export async function signOutUser() {
  if (isApiConfigured) {
    try {
      await apiRequest<{ ok: boolean }>("auth.logout", {
        method: "POST",
        body: JSON.stringify({}),
      });
      return;
    } catch (error) {
      if (!shouldFallbackToLocal(error)) {
        throw error;
      }
    }
  }

  window.localStorage.removeItem(STORAGE_KEYS.session);
}

export async function signUpUser(payload: {
  fullName: string;
  email: string;
  phone?: string;
  password: string;
}) {
  if (isApiConfigured) {
    try {
      const response = await apiRequest<{ user: UserProfile }>("auth.signup", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      return response.user;
    } catch (error) {
      if (!shouldFallbackToLocal(error)) {
        throw error;
      }
    }
  }

  return signUpLocal(payload);
}

export async function createStaffAccount(payload: {
  fullName: string;
  email: string;
  phone?: string;
  adminRole: AdminRole;
  isChatAgent?: boolean;
}) {
  if (isApiConfigured) {
    try {
      return await apiRequest<{ adminUser: { id: string }; tempPassword: string }>("admin.staff.create", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    } catch (error) {
      if (!shouldFallbackToLocal(error)) {
        throw error;
      }
    }
  }

  const users = readStorage<SessionUser[]>(STORAGE_KEYS.users, []);
  if (users.some((user) => user.email.toLowerCase() === payload.email.toLowerCase())) {
    throw new Error("An account with that email already exists.");
  }

  const tempPassword = generateTemporaryPassword();
  const id = createId("staff");
  const createdAt = new Date().toISOString();
  const user: SessionUser = {
    id,
    email: payload.email.toLowerCase(),
    fullName: payload.fullName,
    phone: payload.phone,
    role: "admin",
    adminRole: payload.adminRole,
    authProvider: "local",
    mustChangePassword: true,
    createdAt,
    password: tempPassword,
  };
  writeStorage(STORAGE_KEYS.users, [user, ...users]);

  const adminUsers = readStorage(STORAGE_KEYS.adminUsers, DEFAULT_ADMIN_USERS);
  writeStorage(STORAGE_KEYS.adminUsers, [
    {
      id,
      linkedUserId: id,
      fullName: payload.fullName,
      email: payload.email.toLowerCase(),
      phone: payload.phone,
      role: payload.adminRole,
      active: true,
      isChatAgent: payload.isChatAgent ?? false,
      mustChangePassword: true,
      lastPasswordResetAt: createdAt,
      createdAt,
    },
    ...adminUsers,
  ]);

  return {
    adminUser: { id },
    tempPassword,
  };
}

export async function resetStaffPassword(staffUserId: string) {
  if (isApiConfigured) {
    try {
      return await apiRequest<{ tempPassword: string }>("admin.staff.reset-password", {
        method: "POST",
        body: JSON.stringify({ staffUserId }),
      });
    } catch (error) {
      if (!shouldFallbackToLocal(error)) {
        throw error;
      }
    }
  }

  const tempPassword = generateTemporaryPassword();
  const users = readStorage<SessionUser[]>(STORAGE_KEYS.users, []);
  writeStorage(
    STORAGE_KEYS.users,
    users.map((user) =>
      user.id === staffUserId ? { ...user, password: tempPassword, mustChangePassword: true } : user,
    ),
  );

  const adminUsers = readStorage(STORAGE_KEYS.adminUsers, DEFAULT_ADMIN_USERS);
  writeStorage(
    STORAGE_KEYS.adminUsers,
    adminUsers.map((user) =>
      user.linkedUserId === staffUserId || user.id === staffUserId
        ? { ...user, mustChangePassword: true, lastPasswordResetAt: new Date().toISOString() }
        : user,
    ),
  );

  return { tempPassword };
}

export async function signInUser(email: string, password: string) {
  if (isApiConfigured) {
    try {
      const response = await apiRequest<{ user: UserProfile }>("auth.login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      return response.user;
    } catch (error) {
      if (!shouldFallbackToLocal(error)) {
        throw error;
      }
    }
  }

  return signInLocal(email, password);
}

export async function getSettings() {
  if (isApiConfigured) {
    try {
      const response = await apiRequest<{ settings: AppSettings | null }>("settings.get", {
        method: "GET",
      });
      return response.settings ?? DEFAULT_SETTINGS;
    } catch {
      return readStorage<AppSettings>(STORAGE_KEYS.settings, DEFAULT_SETTINGS);
    }
  }

  return readStorage<AppSettings>(STORAGE_KEYS.settings, DEFAULT_SETTINGS);
}

export async function saveSettings(settings: AppSettings) {
  if (isApiConfigured) {
    try {
      const response = await apiRequest<{ settings: AppSettings }>("settings.save", {
        method: "POST",
        body: JSON.stringify(settings),
      });
      return response.settings;
    } catch (error) {
      if (!shouldFallbackToLocal(error)) {
        throw error;
      }
    }
  }

  writeStorage(STORAGE_KEYS.settings, settings);
  return settings;
}

export async function getBlogPosts() {
  if (isApiConfigured) {
    try {
      const response = await apiRequest<{ posts: BlogPost[] }>("blog.list", {
        method: "GET",
      });
      return response.posts;
    } catch {
      return readStorage<BlogPost[]>(STORAGE_KEYS.blogPosts, []);
    }
  }

  return readStorage<BlogPost[]>(STORAGE_KEYS.blogPosts, []);
}

export async function getTestimonials() {
  if (isApiConfigured) {
    try {
      const response = await apiRequest<{ testimonials: Array<{ id: string; name: string; quote: string; category: string; featured: boolean; displayOrder: number; status: string; imageUrl?: string; updatedAt: string }> }>("testimonials.list", {
        method: "GET",
      });
      return response.testimonials;
    } catch {
      return readStorage(STORAGE_KEYS.testimonials, []);
    }
  }

  return readStorage(STORAGE_KEYS.testimonials, []);
}

export async function getFaqs() {
  if (isApiConfigured) {
    try {
      const response = await apiRequest<{ faqs: Array<{ id: string; question: string; answer: string; category: string; displayOrder: number; published: boolean; updatedAt: string }> }>("faq.list", {
        method: "GET",
      });
      return response.faqs;
    } catch {
      return readStorage(STORAGE_KEYS.faqs, []);
    }
  }

  return readStorage(STORAGE_KEYS.faqs, []);
}

export async function getContentBlocks() {
  if (isApiConfigured) {
    try {
      const response = await apiRequest<{ contentBlocks: ContentBlockRecord[] }>("content-blocks.list", {
        method: "GET",
      });
      return response.contentBlocks;
    } catch {
      return readStorage(STORAGE_KEYS.contentBlocks, []);
    }
  }

  return readStorage(STORAGE_KEYS.contentBlocks, []);
}

export async function getServicePricing() {
  if (isApiConfigured) {
    try {
      const response = await apiRequest<{ services: ServicePricingRecord[] }>("service-pricing.list", {
        method: "GET",
      });
      return response.services;
    } catch {
      return readStorage(STORAGE_KEYS.servicePricing, []);
    }
  }

  return readStorage(STORAGE_KEYS.servicePricing, []);
}

export async function getPublicTourPackages() {
  if (isApiConfigured) {
    try {
      const response = await apiRequest<{ tours: typeof DEFAULT_TOUR_PACKAGES }>("tour-packages.list", {
        method: "GET",
      });
      return response.tours;
    } catch {
      return readStorage(STORAGE_KEYS.tourPackages, []);
    }
  }

  return readStorage(STORAGE_KEYS.tourPackages, []);
}

export async function getPublicVisaServices() {
  if (isApiConfigured) {
    try {
      const response = await apiRequest<{ services: VisaServiceRecord[] }>("visa-services.list", {
        method: "GET",
      });
      return response.services;
    } catch {
      return readStorage(STORAGE_KEYS.visaServices, []);
    }
  }

  return readStorage(STORAGE_KEYS.visaServices, []);
}

export async function getPublicStudyAbroadRecords() {
  if (isApiConfigured) {
    try {
      const response = await apiRequest<{ records: StudyAbroadRecord[] }>("study-abroad.list", {
        method: "GET",
      });
      return response.records;
    } catch {
      return readStorage(STORAGE_KEYS.studyAbroadRecords, []);
    }
  }

  return readStorage(STORAGE_KEYS.studyAbroadRecords, []);
}

export async function getPublicDestinations() {
  if (isApiConfigured) {
    try {
      const response = await apiRequest<{ destinations: DestinationOptionRecord[] }>("destinations.list", {
        method: "GET",
      });
      return response.destinations;
    } catch {
      return readStorage(STORAGE_KEYS.destinationOptions, []);
    }
  }

  return readStorage(STORAGE_KEYS.destinationOptions, []);
}

export async function saveBlogPost(post: BlogPost) {
  if (isApiConfigured) {
    try {
      const response = await apiRequest<{ post: BlogPost }>("blog.save", {
        method: "POST",
        body: JSON.stringify(post),
      });
      return response.post;
    } catch (error) {
      if (!shouldFallbackToLocal(error)) {
        throw error;
      }
    }
  }

  const posts = readStorage<BlogPost[]>(STORAGE_KEYS.blogPosts, DEFAULT_BLOG_POSTS);
  const updated = posts.some((item) => item.id === post.id)
    ? posts.map((item) => (item.id === post.id ? post : item))
    : [post, ...posts];
  writeStorage(STORAGE_KEYS.blogPosts, updated);
  return post;
}

export async function deleteBlogPost(postId: string) {
  if (isApiConfigured) {
    try {
      await apiRequest<{ ok: boolean }>("blog.delete", {
        method: "POST",
        body: JSON.stringify({ postId }),
      });
      return;
    } catch (error) {
      if (!shouldFallbackToLocal(error)) {
        throw error;
      }
    }
  }

  const posts = readStorage<BlogPost[]>(STORAGE_KEYS.blogPosts, DEFAULT_BLOG_POSTS);
  writeStorage(
    STORAGE_KEYS.blogPosts,
    posts.filter((item) => item.id !== postId),
  );
}

export async function submitConsultation(payload: Omit<ConsultationBooking, "id" | "status" | "createdAt">) {
  if (isApiConfigured) {
    try {
      const response = await apiRequest<{ record: ConsultationBooking }>("consultation.create", {
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
  const record: ConsultationBooking = {
    ...payload,
    id: createId("consult"),
    status: "pending",
    createdAt,
    updatedAt: createdAt,
  };

  const consultations = readStorage<ConsultationBooking[]>(STORAGE_KEYS.consultations, []);
  writeStorage(STORAGE_KEYS.consultations, [record, ...consultations]);

  const leads = readStorage<ContactLead[]>(STORAGE_KEYS.leads, []);
  const lead: ContactLead = {
    id: createId("lead"),
    userId: payload.userId,
    name: payload.name,
    email: payload.email,
    phone: payload.phone,
    subject: `Consultation: ${payload.service}`,
    message: payload.notes ?? payload.meetingType,
    category: "consultation",
    status: "scheduled",
    createdAt,
  };
  writeStorage(STORAGE_KEYS.leads, [lead, ...leads]);

  if (payload.userId) {
    addChecklistItems(payload.userId, [
      {
        applicationId: record.id,
        title: "Prepare for your consultation",
        description: "Gather your questions and key documents before the session.",
        status: "pending",
        actionLabel: "View consultations",
        actionPath: "/dashboard/consultations",
      },
    ]);
    addPayment({
      userId: payload.userId,
      consultationId: record.id,
      category: "consultation-fee",
      reference: `CONS-${record.id.slice(-6).toUpperCase()}`,
      amount: 150,
      currency: "GHS",
      status: "pending",
    });
    pushNotification(payload.userId, {
      type: "consultation",
      title: "Consultation request received",
      body: "Your consultation request has been received and is waiting for confirmation.",
      actionPath: "/dashboard/consultations",
    });
  }

  return record;
}

export async function submitContactLead(payload: Omit<ContactLead, "id" | "status" | "createdAt" | "category">) {
  if (isApiConfigured) {
    try {
      const response = await apiRequest<{ record: Partial<ContactLead> }>("contact.create", {
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

  const record: ContactLead = {
    ...payload,
    id: createId("lead"),
    category: "contact",
    status: "new",
    createdAt: new Date().toISOString(),
  };
  const leads = readStorage<ContactLead[]>(STORAGE_KEYS.leads, []);
  writeStorage(STORAGE_KEYS.leads, [record, ...leads]);
  return record;
}

export async function submitTourEnquiry(payload: Omit<TourEnquiry, "id" | "status" | "createdAt">) {
  if (isApiConfigured) {
    try {
      const response = await apiRequest<{ record: TourEnquiry }>("tour.create", {
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
  const record: TourEnquiry = {
    ...payload,
    id: createId("tour"),
    status: "submitted",
    createdAt,
    updatedAt: createdAt,
  };
  const tours = readStorage<TourEnquiry[]>(STORAGE_KEYS.tours, []);
  writeStorage(STORAGE_KEYS.tours, [record, ...tours]);

  if (payload.userId) {
    addChecklistItems(payload.userId, [
      {
        applicationId: record.id,
        title: "Review your travel brief",
        description: "Double-check your destination, dates, and budget so we can build the right quotation.",
        status: "pending",
        actionLabel: "View my applications",
        actionPath: "/dashboard/applications",
      },
    ]);
    pushNotification(payload.userId, {
      type: "application",
      title: "Travel request received",
      body: "Your travel request is now in review.",
      actionPath: "/dashboard/applications",
    });
  }
  return record;
}

export async function submitVisaApplication(
  payload: Omit<VisaApplication, "id" | "status" | "timelineStep" | "createdAt" | "updatedAt">,
) {
  if (isApiConfigured) {
    try {
      const response = await apiRequest<{ record: VisaApplication }>("visa.create", {
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
  const record: VisaApplication = {
    ...payload,
    id: createId("visa"),
    status: "documents-pending",
    timelineStep: "Documents requested",
    createdAt,
    updatedAt: createdAt,
  };
  const applications = readStorage<VisaApplication[]>(STORAGE_KEYS.visaApplications, []);
  writeStorage(STORAGE_KEYS.visaApplications, [record, ...applications]);
  addChecklistItems(payload.userId, [
    {
      applicationId: record.id,
      title: "Upload your passport",
      description: "Upload the bio-data page of your passport so the team can begin review.",
      status: "pending",
      actionLabel: "Upload document",
      actionPath: "/dashboard/documents",
    },
    {
      applicationId: record.id,
      title: "Upload your supporting documents",
      description: "Add the remaining documents requested for this application.",
      status: "pending",
      actionLabel: "Upload documents",
      actionPath: "/dashboard/documents",
    },
  ]);
  addPayment({
    userId: payload.userId,
    applicationId: record.id,
    category: "application-fee",
    reference: `APP-${record.id.slice(-6).toUpperCase()}`,
    amount: 500,
    currency: "GHS",
    status: "pending",
  });
  pushNotification(payload.userId, {
    type: "application",
    title: "Visa application started",
    body: "Your application is now live. The next step is to upload the requested documents.",
    actionPath: `/dashboard/applications/${record.id}`,
  });
  return record;
}

export async function uploadDocument(payload: {
  userId: string;
  applicationId?: string;
  file: File;
  category?: DocumentCategory;
  clientNotes?: string;
}) {
  validateUploadFile(payload.file);

  if (isApiConfigured) {
    try {
      const formData = new FormData();
      formData.append("file", payload.file);
      formData.append("applicationId", payload.applicationId ?? "");
      formData.append("category", payload.category ?? "other");
      formData.append("clientNotes", payload.clientNotes ?? "");
      const response = await apiRequest<{ record: DocumentRecord }>("document.upload", {
        method: "POST",
        body: formData,
      });
      return response.record;
    } catch (error) {
      if (!shouldFallbackToLocal(error)) {
        throw error;
      }
    }
  }

  const fileUrl = await uploadLocalFile(payload.file);
  const record: DocumentRecord = {
    id: createId("doc"),
    userId: payload.userId,
    applicationId: payload.applicationId,
    fileName: payload.file.name,
    fileType: payload.file.type || "application/octet-stream",
    fileSize: payload.file.size,
    fileUrl,
    category: payload.category ?? "other",
    status: "pending-review",
    clientNotes: payload.clientNotes,
    uploadedAt: new Date().toISOString(),
  };
  const documents = readStorage<DocumentRecord[]>(STORAGE_KEYS.documents, []);
  writeStorage(STORAGE_KEYS.documents, [record, ...documents]);
  completeChecklistForPath(payload.userId, "/dashboard/documents");
  pushNotification(payload.userId, {
    type: "document",
    title: "Document uploaded",
    body: `${record.fileName} has been uploaded and is waiting for review.`,
    actionPath: "/dashboard/documents",
  });
  return record;
}

export async function deleteDocument(documentId: string) {
  if (isApiConfigured) {
    try {
      await apiRequest<{ ok: boolean }>("document.delete", {
        method: "POST",
        body: JSON.stringify({ documentId }),
      });
      return;
    } catch (error) {
      if (!shouldFallbackToLocal(error)) {
        throw error;
      }
    }
  }

  const documents = readStorage<DocumentRecord[]>(STORAGE_KEYS.documents, []);
  writeStorage(
    STORAGE_KEYS.documents,
    documents.filter((item) => item.id !== documentId),
  );
}

export async function getDashboardSnapshot(userId?: string): Promise<DashboardSnapshot> {
  if (isApiConfigured) {
    try {
      const adminFlag = userId ? "" : "&admin=1";
      const userFlag = userId ? `&userId=${encodeURIComponent(userId)}` : "";
      const response = await apiRequest<{ snapshot: DashboardSnapshot }>(`dashboard.get${adminFlag}${userFlag}`, {
        method: "GET",
      });
      return response.snapshot;
    } catch (error) {
      if (!shouldFallbackToLocal(error)) {
        throw error;
      }
    }
  }

  const consultations = readStorage<ConsultationBooking[]>(STORAGE_KEYS.consultations, []);
  const visaApplications = readStorage<VisaApplication[]>(STORAGE_KEYS.visaApplications, []);
  const tourEnquiries = readStorage<TourEnquiry[]>(STORAGE_KEYS.tours, []);
  const documents = readStorage<DocumentRecord[]>(STORAGE_KEYS.documents, []);
  const leads = readStorage<ContactLead[]>(STORAGE_KEYS.leads, []);

  if (!userId) {
    return { consultations, visaApplications, tourEnquiries, documents, leads };
  }

  return {
    consultations: consultations.filter((item) => item.userId === userId),
    visaApplications: visaApplications.filter((item) => item.userId === userId),
    tourEnquiries: tourEnquiries.filter((item) => item.userId === userId),
    documents: documents.filter((item) => item.userId === userId),
    leads: leads.filter((item) => item.userId === userId),
  };
}

export async function updateVisaStatus(applicationId: string, status: VisaApplication["status"], timelineStep: string) {
  if (isApiConfigured) {
    await apiRequest<{ ok: boolean }>("visa.update", {
      method: "POST",
      body: JSON.stringify({ applicationId, status, timelineStep }),
    });
    return;
  }

  const applications = readStorage<VisaApplication[]>(STORAGE_KEYS.visaApplications, []);
  const updated = applications.map((application) =>
    application.id === applicationId
      ? { ...application, status, timelineStep, updatedAt: new Date().toISOString() }
      : application,
  );
  writeStorage(STORAGE_KEYS.visaApplications, updated);
}

export async function updateLeadStatus(leadId: string, status: ContactLead["status"]) {
  if (isApiConfigured) {
    await apiRequest<{ ok: boolean }>("lead.update", {
      method: "POST",
      body: JSON.stringify({ leadId, status }),
    });
    return;
  }

  const leads = readStorage<ContactLead[]>(STORAGE_KEYS.leads, []);
  writeStorage(
    STORAGE_KEYS.leads,
    leads.map((lead) => (lead.id === leadId ? { ...lead, status } : lead)),
  );
}

export async function updateConsultationStatus(consultationId: string, status: ConsultationBooking["status"]) {
  if (isApiConfigured) {
    await apiRequest<{ ok: boolean }>("consultation.update", {
      method: "POST",
      body: JSON.stringify({ consultationId, status }),
    });
    return;
  }

  const consultations = readStorage<ConsultationBooking[]>(STORAGE_KEYS.consultations, []);
  writeStorage(
    STORAGE_KEYS.consultations,
    consultations.map((consultation) =>
      consultation.id === consultationId ? { ...consultation, status } : consultation,
    ),
  );
}

export async function updateTourStatus(tourId: string, status: TourEnquiry["status"]) {
  if (isApiConfigured) {
    await apiRequest<{ ok: boolean }>("tour.update", {
      method: "POST",
      body: JSON.stringify({ tourId, status }),
    });
    return;
  }

  const tours = readStorage<TourEnquiry[]>(STORAGE_KEYS.tours, []);
  writeStorage(
    STORAGE_KEYS.tours,
    tours.map((tour) => (tour.id === tourId ? { ...tour, status } : tour)),
  );
}
