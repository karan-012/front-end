import {
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens,
} from "@/utils/storage";

const DEFAULT_BASE_URL =
  (import.meta as any).env?.VITE_API_BASE_URL || "http://127.0.0.1:5000";

// If preview is remote but base URL is localhost, use offline mocks
const BACKEND_OFFLINE =
  typeof window !== "undefined" &&
  /^(?!localhost|127\.0\.0\.1)/.test(window.location.hostname) &&
  /localhost|127\.0\.0\.1/.test(DEFAULT_BASE_URL);

function sampleTrainers() {
  return [
    { experience_years: 5, id: 1, language: "English", location: "Delhi", name: "Alice Smith", price_per_session: 800.0, specialization: "strength training, weight loss", training_type: "online", username: "MJ" },
    { experience_years: 5, id: 2, language: "English", location: "Delhi", name: "Alice Smith", price_per_session: 800.0, specialization: "strength training, weight loss", training_type: "online", username: "mj" },
    { experience_years: 3, id: 3, language: "Hindi", location: "Una", name: "Mrigaank Jaswal", price_per_session: 1200.0, specialization: "Fat Loss", training_type: "Hybrid", username: "mj12" },
  ];
}

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
  searchTrainers: (params: Record<string, any>) => {
    if (BACKEND_OFFLINE) {
      let list = sampleTrainers();
      const { specialization = "", location = "", training_type = "", language = "", min_price, max_price, min_experience, page = 1, per_page = 10, sort_by = "experience", sort_order = "desc" } = params || ({} as any);
      list = list.filter((t:any) =>
        (!specialization || String(t.specialization).toLowerCase().includes(String(specialization).toLowerCase())) &&
        (!location || String(t.location).toLowerCase().includes(String(location).toLowerCase())) &&
        (!training_type || String(t.training_type).toLowerCase().includes(String(training_type).toLowerCase())) &&
        (!language || String(t.language).toLowerCase().includes(String(language).toLowerCase())) &&
        (min_price == null || Number(t.price_per_session) >= Number(min_price)) &&
        (max_price == null || Number(t.price_per_session) <= Number(max_price)) &&
        (min_experience == null || Number(t.experience_years) >= Number(min_experience))
      );
      list.sort((a:any,b:any)=>{
        const dir = sort_order === "asc" ? 1 : -1;
        if (sort_by === "price") return (a.price_per_session - b.price_per_session) * dir;
        return (a.experience_years - b.experience_years) * dir;
      });
      const start = (page - 1) * per_page;
      const pageItems = list.slice(start, start + per_page);
      return Promise.resolve({ page, pages: Math.max(1, Math.ceil(list.length / per_page)), per_page, total: list.length, trainers: pageItems });
    }
    return request<any>({ path: "/trainers/", method: "GET", params });
  },

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
    BACKEND_OFFLINE ? Promise.resolve([]) : request<any>({ path: "/booking/trainer", method: "GET", auth: true }),
  clientBookings: () =>
    BACKEND_OFFLINE ? Promise.resolve([]) : request<any>({ path: "/booking/client", method: "GET", auth: true }),

  // Notifications (placeholders)
  listNotifications: () =>
    request<any>({ path: "/notifications", method: "GET", auth: true }),
  markNotificationRead: (id: string) =>
    request<any>({
      path: `/notifications/${encodeURIComponent(id)}/read`,
      method: "PUT",
      auth: true,
    }),

  // Reviews (placeholders)
  listReviews: (trainer_username: string) =>
    request<any>({
      path: `/reviews/trainer/${encodeURIComponent(trainer_username)}`,
      method: "GET",
    }),
  addReview: (body: {
    trainer_username: string;
    rating: number;
    comment: string;
  }) => request<any>({ path: "/reviews", method: "POST", body, auth: true }),

  // Chat (placeholders)
  chatThreads: () =>
    request<any>({ path: "/chat/threads", method: "GET", auth: true }),
  chatMessages: (thread_id: string) =>
    request<any>({
      path: "/chat/messages",
      method: "GET",
      params: { thread_id },
      auth: true,
    }),
  chatSend: (body: { thread_id: string; message: string }) =>
    request<any>({ path: "/chat/messages", method: "POST", body, auth: true }),

  // Video (placeholders)
  createVideoRoom: (body: { name: string }) =>
    request<any>({ path: "/video/rooms", method: "POST", body, auth: true }),
  getVideoToken: (body: { room: string }) =>
    request<any>({ path: "/video/token", method: "POST", body, auth: true }),

  // Payments (placeholders)
  createCheckoutSession: (body: { amount: number; description?: string }) =>
    request<any>({
      path: "/payments/checkout",
      method: "POST",
      body,
      auth: true,
    }),
  paymentHistory: () =>
    request<any>({ path: "/payments/history", method: "GET", auth: true }),
};

export default api;
