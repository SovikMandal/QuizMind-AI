import { create } from "zustand";
import { api, tokenStore } from "@/lib/api";
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
    if (!tokenStore.get()) {
      set({ initializing: false });
      return;
    }
    try {
      const res = await api.get("/users/me");
      set({ user: res.data.user });
    } catch {
      tokenStore.clear();
    } finally {
      set({ initializing: false });
    }
  },
}));
