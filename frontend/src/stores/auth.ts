import { create } from "zustand";
import { api, tokenStore, trySilentRefresh } from "@/lib/api";
import type { User } from "@/types";

interface AuthState {
  user: User | null;
  initializing: boolean;
  setUser: (user: User) => void;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => Promise<void>;
  loadSession: () => Promise<void>;
}

interface SignupData {
  email: string;
  username: string;
  password: string;
  displayName?: string;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  initializing: true,

  setUser: (user) => set({ user }),

  login: async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    tokenStore.set(res.data.accessToken);
    set({ user: res.data.user });
  },

  signup: async (data) => {
    await api.post("/auth/register", data);
    // The user is created + logged in only after email verification (see Signup).
  },

  logout: async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      tokenStore.clear();
      set({ user: null });
    }
  },

  loadSession: async () => {
    // If there's no access token (e.g. the tab was closed long enough for it
    // to expire and be cleared), still try a silent refresh — the httpOnly
    // refresh cookie lives for 7 days and should keep the session alive.
    if (!tokenStore.get()) {
      const refreshed = await trySilentRefresh();
      if (!refreshed) {
        set({ initializing: false });
        return;
      }
    }

    try {
      const res = await api.get("/users/me");
      set({ user: res.data.user });
    } catch {
      // The response interceptor already handles 401 by attempting a refresh
      // and clearing the token if that fails. If we land here it means the
      // session genuinely can't be restored.
      tokenStore.clear();
    } finally {
      set({ initializing: false });
    }
  },
}));
