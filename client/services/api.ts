import {
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens,
} from "@/utils/storage";

const DEFAULT_BASE_URL =
  (import.meta as any).env?.VITE_API_BASE_URL || "https://api.mypter.example";

export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

export interface RequestOptions {
  method?: HttpMethod;
  path: string;
  params?: Record<string, any>;
  body?: any;
  auth?: boolean; // attach access token
  headers?: Record<string, string>;
}

async function request<T = any>(
  opts: RequestOptions,
  retry = true,
): Promise<T> {
  const baseUrl = DEFAULT_BASE_URL.replace(/\/$/, "");
  const url = new URL(baseUrl + opts.path);
  if (opts.params) {
    Object.entries(opts.params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "")
        url.searchParams.append(k, String(v));
    });
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(opts.headers || {}),
  };

  if (opts.auth) {
    const token = getAccessToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(url.toString(), {
    method: opts.method || (opts.body ? "POST" : "GET"),
    headers,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });

  if (res.status === 401 && opts.auth && retry) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      return request<T>(opts, false);
    }
  }

  const text = await res.text();
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    // non-JSON
    // @ts-ignore
    data = text;
  }

  if (!res.ok) {
    const message =
      data?.message || data?.error || res.statusText || "Request failed";
    throw new Error(message);
  }
  return data as T;
}

async function refreshAccessToken(): Promise<boolean> {
  const refresh = getRefreshToken();
  if (!refresh) return false;
  try {
    const res = await fetch(
      DEFAULT_BASE_URL.replace(/\/$/, "") + "/auth/refresh",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${refresh}`,
        },
      },
    );
    if (!res.ok) throw new Error("Failed to refresh");
    const data = await res.json();
    const newAccess = data?.access_token;
    if (newAccess) {
      setTokens(newAccess, null);
      return true;
    }
    return false;
  } catch {
    clearTokens();
    return false;
  }
}

// Auth endpoints
export const api = {
  register: (body: {
    first_name: string;
    last_name: string;
    email: string;
    username: string;
    password: string;
  }) =>
    request<{ user: any; msg?: string }>({
      path: "/auth/register",
      method: "POST",
      body,
    }),

  login: (body: { email_or_username: string; password: string }) =>
    request<{ access_token: string; refresh_token: string; user: any }>({
      path: "/auth/login",
      method: "POST",
      body,
    }),

  me: () =>
    request<{ me: any }>({ path: "/auth/me", method: "GET", auth: true }),

  // Profiles
  upsertTrainerProfile: (body: any, method: "POST" | "PUT" = "POST") =>
    request<any>({ path: "/profile/trainer", method, body, auth: true }),
  upsertClientProfile: (body: any, method: "POST" | "PUT" = "POST") =>
    request<any>({ path: "/profile/client", method, body, auth: true }),
  myTrainerProfile: () =>
    request<any>({ path: "/profile/trainer/me", method: "GET", auth: true }),
  myClientProfile: () =>
    request<any>({ path: "/profile/client/me", method: "GET", auth: true }),
  getTrainerByUsername: (username: string) =>
    request<any>({
      path: `/profile/trainer/${encodeURIComponent(username)}`,
      method: "GET",
    }),
  getClientByUsername: (username: string) =>
    request<any>({
      path: `/profile/client/${encodeURIComponent(username)}`,
      method: "GET",
    }),

  // Trainer search
  searchTrainers: (params: Record<string, any>) =>
    request<any>({ path: "/trainers/", method: "GET", params }),

  // Availability
  setAvailability: (
    availability: {
      day_of_week: string;
      start_time: string;
      end_time: string;
    }[],
  ) =>
    request<any>({
      path: "/trainer/availability/",
      method: "POST",
      body: { availability },
      auth: true,
    }),
  myAvailability: () =>
    request<any>({
      path: "/trainer/availability/me",
      method: "GET",
      auth: true,
    }),
  trainerAvailability: (username: string) =>
    request<any>({
      path: `/trainer/availability/${encodeURIComponent(username)}`,
      method: "GET",
      auth: true,
    }),
  blockDates: (dates: string[], reason?: string) =>
    request<any>({
      path: "/trainer/availability/block",
      method: "POST",
      body: { dates, reason },
      auth: true,
    }),
  unblockDate: (date: string) =>
    request<any>({
      path: `/trainer/availability/block/${encodeURIComponent(date)}`,
      method: "DELETE",
      auth: true,
    }),
  myBlockedDates: () =>
    request<any>({
      path: "/trainer/availability/block/me",
      method: "GET",
      auth: true,
    }),
  trainerBlockedDates: (username: string) =>
    request<any>({
      path: `/trainer/availability/block/${encodeURIComponent(username)}`,
      method: "GET",
      auth: true,
    }),

  // Bookings
  createBooking: (body: {
    trainer_username: string;
    session_date: string;
    start_time: string;
    end_time: string;
    notes?: string;
  }) => request<any>({ path: "/booking/", method: "POST", body, auth: true }),
  updateBookingStatus: (booking_id: string, status: "approved" | "rejected") =>
    request<any>({
      path: `/booking/${encodeURIComponent(booking_id)}/status`,
      method: "PUT",
      body: { status },
      auth: true,
    }),
  trainerBookings: () =>
    request<any>({ path: "/booking/trainer", method: "GET", auth: true }),
  clientBookings: () =>
    request<any>({ path: "/booking/client", method: "GET", auth: true }),
};

export default api;
