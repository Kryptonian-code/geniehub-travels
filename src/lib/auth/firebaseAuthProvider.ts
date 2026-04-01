import type { UserProfile } from "@/lib/types";

const FIREBASE_SESSION_KEY = "geniehub-firebase-session";

interface FirebaseIdentityResponse {
  localId: string;
  email: string;
  displayName?: string;
  idToken: string;
  refreshToken: string;
  expiresIn: string;
}

interface FirebaseSessionPayload {
  user: UserProfile;
  idToken: string;
  refreshToken: string;
}

function getFirebaseConfig() {
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
  const authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN;
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
  const appId = import.meta.env.VITE_FIREBASE_APP_ID;

  return { apiKey, authDomain, projectId, appId };
}

export function isFirebaseAuthReady() {
  const config = getFirebaseConfig();
  return Boolean(config.apiKey && config.authDomain && config.projectId && config.appId);
}

function persistSession(payload: FirebaseSessionPayload) {
  window.localStorage.setItem(FIREBASE_SESSION_KEY, JSON.stringify(payload));
}

function readSession() {
  const raw = window.localStorage.getItem(FIREBASE_SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as FirebaseSessionPayload;
  } catch {
    return null;
  }
}

async function callFirebase(endpoint: string, payload: Record<string, unknown>) {
  const { apiKey } = getFirebaseConfig();
  if (!apiKey) {
    throw new Error("Firebase authentication is not configured.");
  }

  const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:${endpoint}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...payload, returnSecureToken: true }),
  });

  const result = (await response.json()) as FirebaseIdentityResponse & { error?: { message?: string } };
  if (!response.ok) {
    const message = result.error?.message?.replaceAll("_", " ").toLowerCase() ?? "firebase sign-in failed";
    throw new Error(message.charAt(0).toUpperCase() + message.slice(1));
  }

  return result;
}

function toFirebaseUser(result: FirebaseIdentityResponse, fullName?: string): UserProfile {
  return {
    id: result.localId,
    email: result.email.toLowerCase(),
    fullName: fullName ?? result.displayName ?? result.email.split("@")[0],
    role: "client",
    authProvider: "firebase",
    createdAt: new Date().toISOString(),
  };
}

export async function getFirebaseSession() {
  return readSession()?.user ?? null;
}

export async function signInWithFirebase(email: string, password: string) {
  const result = await callFirebase("signInWithPassword", { email, password });
  const existing = readSession()?.user;
  const user = toFirebaseUser(result, existing?.fullName);
  persistSession({ user, idToken: result.idToken, refreshToken: result.refreshToken });
  return user;
}

export async function signUpWithFirebase(payload: {
  fullName: string;
  email: string;
  phone?: string;
  password: string;
}) {
  const result = await callFirebase("signUp", { email: payload.email, password: payload.password });
  const user = {
    ...toFirebaseUser(result, payload.fullName),
    phone: payload.phone,
  };
  persistSession({ user, idToken: result.idToken, refreshToken: result.refreshToken });
  return user;
}

export async function signOutFirebase() {
  window.localStorage.removeItem(FIREBASE_SESSION_KEY);
}
