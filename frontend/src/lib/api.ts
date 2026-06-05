import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

const TOKEN_KEY = "accessToken";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

export function apiError(e: unknown, fallback = "Something went wrong"): string {
  if (axios.isAxiosError(e)) {
    return (e.response?.data as { error?: string })?.error ?? e.message ?? fallback;
  }
  return fallback;
}

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (t: string) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // send the httpOnly refresh cookie
});

api.interceptors.request.use((config) => {
  const token = tokenStore.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let refreshing: Promise<string | null> | null = null;

async function refreshToken(): Promise<string | null> {
  try {
    const res = await axios.post(
      `${API_BASE_URL}/auth/refresh`,
      {},
      { withCredentials: true }
    );
    const token = res.data.accessToken as string;
    tokenStore.set(token);
    return token;
  } catch {
    return null;
  }
}

/**
 * Attempt to silently refresh the access token using the httpOnly refresh
 * cookie. Safe to call on app start when there is no access token in
 * localStorage — if the cookie is missing or invalid we just return false.
 */
export async function trySilentRefresh(): Promise<boolean> {
  refreshing ??= refreshToken().finally(() => {
    refreshing = null;
  });
  const token = await refreshing;
  return token !== null;
}

/**
 * Best-effort warm-up of the API. On Render's free tier the container spins
 * down after ~15 min idle and the first request can take 30–60 seconds.
 * Hitting `/health` early lets the server wake up while the UI is still
 * mounting, instead of stalling the first auth call.
 */
let warmedUp = false;
export function warmUpApi(): void {
  if (warmedUp || !API_BASE_URL) return;
  warmedUp = true;
  // /health lives at the root, not under /api/v1, so build the URL by
  // stripping any trailing /api/... segment from the base.
  const root = API_BASE_URL.replace(/\/api\/v\d+\/?$/, "");
  // Fire and forget — we don't care about the response.
  fetch(`${root}/health`, { method: "GET", credentials: "omit" }).catch(() => {
    /* ignore — this is just a wake-up nudge */
  });
}

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retried?: boolean };
    const isAuthCall = original?.url?.includes("/auth/");

    if (error.response?.status === 401 && original && !original._retried && !isAuthCall) {
      original._retried = true;
      refreshing ??= refreshToken().finally(() => {
        refreshing = null;
      });
      const token = await refreshing;
      if (token) {
        original.headers.Authorization = `Bearer ${token}`;
        return api(original);
      }
      tokenStore.clear();
      if (location.pathname !== "/login") location.assign("/login");
    }
    return Promise.reject(error);
  }
);
