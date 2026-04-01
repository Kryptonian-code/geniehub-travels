import { getStoredSession, signInUser, signOutUser, signUpUser } from "@/lib/backend";
import type { UserProfile } from "@/lib/types";
import {
  getFirebaseSession,
  isFirebaseAuthReady,
  signInWithFirebase,
  signOutFirebase,
  signUpWithFirebase,
} from "./firebaseAuthProvider";

export type AuthWorkspaceIntent = "client" | "admin";

function shouldUseFirebase(workspace: AuthWorkspaceIntent) {
  return workspace === "client" && isFirebaseAuthReady();
}

export function getAuthStrategyName(workspace: AuthWorkspaceIntent = "client") {
  return shouldUseFirebase(workspace) ? "firebase" : "local";
}

export async function getAuthSession() {
  if (isFirebaseAuthReady()) {
    const firebaseSession = await getFirebaseSession();
    if (firebaseSession) {
      return firebaseSession;
    }
  }

  return getStoredSession();
}

export async function loginWithProvider(
  email: string,
  password: string,
  workspace: AuthWorkspaceIntent = "client",
): Promise<UserProfile> {
  if (shouldUseFirebase(workspace)) {
    return signInWithFirebase(email, password);
  }

  return signInUser(email, password);
}

export async function signupWithProvider(payload: {
  fullName: string;
  email: string;
  phone?: string;
  password: string;
}) {
  if (shouldUseFirebase("client")) {
    return signUpWithFirebase(payload);
  }

  return signUpUser(payload);
}

export async function logoutWithProvider(user: UserProfile | null) {
  if (user?.authProvider === "firebase") {
    await signOutFirebase();
    return;
  }

  await signOutUser();
}
