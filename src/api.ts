const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

function authHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "伺服器錯誤" }));
    throw new Error(err.detail || "請求失敗");
  }
  return res.json();
}

// ── Auth ──────────────────────────────────────────────
export const authApi = {
  login: (email: string, password: string) =>
    request<{ access_token: string; role: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  register: (name: string, email: string, password: string, phone?: string) =>
    request<{ access_token: string; role: string }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password, phone }),
    }),

  me: () => request<{ id: number; name: string; email: string }>("/auth/me"),
};

// ── Courses ───────────────────────────────────────────
export interface Course {
  id: number;
  name: string;
  category: string;
  instructor: string;
  date: string;
  start_time: string;
  duration_mins: number;
  price: number;
  capacity: number;
  current_count: number;
  image_url: string | null;
  tag: string | null;
  description: string | null;
}

export const coursesApi = {
  list: (category?: string, date?: string) => {
    const params = new URLSearchParams();
    if (category) params.append("category", category);
    if (date) params.append("date", date);
    const qs = params.toString() ? `?${params}` : "";
    return request<Course[]>(`/courses${qs}`);
  },

  get: (id: number) => request<Course>(`/courses/${id}`),
};

// ── Bookings ──────────────────────────────────────────
export interface Booking {
  id: number;
  course_id: number;
  status: string;
  payment_status: string;
  bank_last5: string | null;
  total_price: number;
  discount_applied: number;
  created_at: string;
  course: Course;
}

export const bookingsApi = {
  create: (course_ids: number[]) =>
    request<Booking[]>("/bookings", {
      method: "POST",
      body: JSON.stringify({ course_ids }),
    }),

  mine: () => request<Booking[]>("/bookings/mine"),

  submitPayment: (booking_id: number, bank_last5: string) =>
    request(`/bookings/${booking_id}/submit-payment`, {
      method: "PATCH",
      body: JSON.stringify({ bank_last5 }),
    }),

  cancel: (booking_id: number) =>
    request(`/bookings/${booking_id}`, { method: "DELETE" }),
};

// ── Discounts ─────────────────────────────────────────
export interface Discount {
  id: number;
  name: string;
  min_quantity: number;
  discount_rate: number;
  description: string | null;
}

export const discountsApi = {
  list: () => request<Discount[]>("/discounts"),
};
