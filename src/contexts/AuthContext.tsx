import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { getAuthSession, getAuthStrategyName, loginWithProvider, logoutWithProvider, signupWithProvider, type AuthWorkspaceIntent } from "@/lib/auth/authProvider";
import { isApiConfigured } from "@/lib/api";
import type { UserProfile } from "@/lib/types";
import { getAdminRole } from "@/lib/adminAccess";

interface AuthContextValue {
  user: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  adminRole: ReturnType<typeof getAdminRole>;
  mustChangePassword: boolean;
  apiEnabled: boolean;
  authStrategy: "local" | "firebase";
  login: (email: string, password: string, workspace?: AuthWorkspaceIntent) => Promise<UserProfile>;
  signup: (payload: {
    fullName: string;
    email: string;
    phone?: string;
    password: string;
  }) => Promise<UserProfile>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    setLoading(true);
    try {
      const session = await getAuthSession();
      setUser(session);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  async function login(email: string, password: string, workspace: AuthWorkspaceIntent = "client") {
    const profile = await loginWithProvider(email, password, workspace);
    setUser(profile);
    return profile;
  }

  async function signup(payload: {
    fullName: string;
    email: string;
    phone?: string;
    password: string;
  }) {
    const profile = await signupWithProvider(payload);
    setUser(profile);
    return profile;
  }

  async function logout() {
    await logoutWithProvider(user);
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAdmin: user?.role === "admin",
        adminRole: getAdminRole(user),
        mustChangePassword: Boolean(user?.mustChangePassword),
        apiEnabled: isApiConfigured,
        authStrategy: getAuthStrategyName(user?.role === "admin" ? "admin" : "client"),
        login,
        signup,
        logout,
        refresh,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
