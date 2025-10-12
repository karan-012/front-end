import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "@/services/api";
import {
  getAccessToken,
  clearTokens,
  setTokens,
  saveUser,
  getUser,
  clearUser,
} from "@/utils/storage";

export interface AuthState {
  user: any | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (payload: {
    email_or_username: string;
    password: string;
  }) => Promise<void>;
  register: (payload: {
    first_name: string;
    last_name: string;
    email: string;
    username: string;
    password: string;
  }) => Promise<void>;
  logout: () => void;
  refreshMe: () => Promise<void>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(() => getUser());
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const init = async () => {
      try {
        if (getAccessToken()) {
          const { me } = await api.me();
          setUser(me);
          saveUser(me);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const login = async (payload: {
    email_or_username: string;
    password: string;
  }) => {
    setLoading(true);
    try {
      const { access_token, refresh_token, user } = await api.login(payload);
      setTokens(access_token, refresh_token);
      setUser(user);
      saveUser(user);
    } finally {
      setLoading(false);
    }
  };

  const register = async (payload: {
    first_name: string;
    last_name: string;
    email: string;
    username: string;
    password: string;
  }) => {
    setLoading(true);
    try {
      await api.register(payload);
      await login({
        email_or_username: payload.email || payload.username,
        password: payload.password,
      });
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    clearTokens();
    clearUser();
    setUser(null);
  };

  const refreshMe = async () => {
    try {
      const { me } = await api.me();
      setUser(me);
      saveUser(me);
    } catch {
      logout();
    }
  };

  const value = useMemo<AuthState>(
    () => ({
      user,
      loading,
      isAuthenticated: !!user,
      login,
      register,
      logout,
      refreshMe,
    }),
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
