/**
 * API config and auth endpoints.
 * Base URL: http://localhost:5000 (or NEXT_PUBLIC_API_URL)
 * Auth: POST /api/auth/login, POST /api/auth/register
 */

const API_ORIGIN =
  typeof window !== "undefined"
    ? (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000")
    : process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const API_BASE = API_ORIGIN + "/api";

/** Full URL for upload paths returned by the API (e.g. /uploads/complaints/xxx.jpg) */
export function getUploadUrl(path: string): string {
  if (!path) return "";
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${API_ORIGIN}${p}`;
}

export const AUTH = {
  login: `${API_BASE}/auth/login`,
  register: `${API_BASE}/auth/register`,
  registerGovernment: `${API_BASE}/auth/register/government`,
  forgotPassword: `${API_BASE}/auth/forgot-password`,
  profile: `${API_BASE}/auth/profile`,
  logout: `${API_BASE}/auth/logout`,
} as const;

const CITIZEN_BASE = `${API_BASE}/citizen`;
export const CITIZEN = {
  dashboard: `${CITIZEN_BASE}/dashboard`,
  complaints: `${CITIZEN_BASE}/complaints`,
  complaintById: (id: string) => `${CITIZEN_BASE}/complaints/${id}`,
  leaderboard: `${CITIZEN_BASE}/leaderboard`,
} as const;

const GOVERNMENT_BASE = `${API_BASE}/government`;
export const GOVERNMENT = {
  dashboard: `${GOVERNMENT_BASE}/dashboard`,
  complaints: `${GOVERNMENT_BASE}/complaints`,
  complaintById: (id: string) => `${GOVERNMENT_BASE}/complaints/${id}`,
  complaintStatus: (id: string) => `${GOVERNMENT_BASE}/complaints/${id}/status`,
} as const;

export type LoginPayload = { email: string; password: string };
export type LoginResponse = { token: string; role: string };

export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
  phone: string;
  address: string;
};
export type RegisterGovernmentPayload = {
  governmentId: string;
  name: string;
  password: string;
  phone?: string;
  address?: string;
};
export type RegisterResponse = { message: string };

async function request<T>(
  url: string,
  options: RequestInit & { body?: object } = {}
): Promise<{ data: T; ok: true } | { error: string; ok: false }> {
  const { body, ...rest } = options;
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };
  try {
    const res = await fetch(url, {
      ...rest,
      headers,
      body: body ? JSON.stringify(body) : options.body,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { ok: false, error: (data as { message?: string }).message || "Request failed" };
    }
    return { ok: true, data: data as T };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Network error";
    return { ok: false, error: message };
  }
}

export const authApi = {
  login(payload: LoginPayload) {
    return request<LoginResponse>(AUTH.login, { method: "POST", body: payload });
  },

  register(payload: RegisterPayload) {
    return request<RegisterResponse>(AUTH.register, { method: "POST", body: payload });
  },

  registerGovernment(payload: RegisterGovernmentPayload) {
    return request<RegisterResponse>(AUTH.registerGovernment, { method: "POST", body: payload });
  },

  forgotPassword(email: string) {
    return request<{ message: string }>(AUTH.forgotPassword, {
      method: "POST",
      body: { email },
    });
  },

  getProfile(): Promise<
    | { data: ProfileResponse; ok: true }
    | { error: string; ok: false }
  > {
    const headers = getAuthHeaders();
    if (!headers.Authorization) {
      return Promise.resolve({
        ok: false,
        error: "Not logged in",
      });
    }
    return request<ProfileResponse>(AUTH.profile, {
      method: "GET",
      headers: { ...headers, "Content-Type": "application/json" },
    });
  },

  logout(): Promise<{ ok: true } | { ok: false; error: string }> {
    const headers = getAuthHeaders();
    if (!headers.Authorization) {
      return Promise.resolve({ ok: true });
    }
    return request<{ message: string }>(AUTH.logout, {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
    }).then((res) => (res.ok ? { ok: true as const } : { ok: false as const, error: res.error }));
  },
};

export type ProfileResponse = {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  role?: string;
  createdAt?: string;
};

export function getAuthHeaders(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const token = window.localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/** Citizen dashboard and complaints (requires auth) */
export type DashboardData = {
  totalComplaints: number;
  resolved: number;
  inProgress: number;
  points: number;
};

export type ComplaintItem = {
  _id: string;
  title?: string;
  description?: string;
  category?: string;
  location?: string;
  photos?: string[];
  status?: string;
  createdAt?: string;
};

/** Complaint with populated user (government API) */
export type GovComplaintItem = ComplaintItem & {
  user?: { name?: string; email?: string };
};

/** Government dashboard: budget + citizen engagement */
export type GovernmentDashboardResponse = {
  budget: {
    months: string[];
    allocatedData: number[];
    spentData: number[];
    totalAllocated: number;
    totalSpent: number;
    byDepartment: { dept: string; value: number }[];
  };
  engagement: {
    totalCitizens: number;
    totalComplaints: number;
    complaintsByMonth: number[];
    months: string[];
  };
};

export type LeaderboardEntry = {
  _id?: string;
  name: string;
  totalResolved: number;
  totalComplaints?: number;
};

function citizenRequest<T>(
  url: string,
  options: RequestInit & { body?: object } = {}
): Promise<{ data: T; ok: true } | { error: string; ok: false }> {
  const headers = getAuthHeaders();
  if (!headers.Authorization) {
    return Promise.resolve({ ok: false, error: "Not logged in" });
  }
  return request<T>(url, {
    ...options,
    headers: { ...headers, ...options.headers },
  });
}

export const citizenApi = {
  getDashboard() {
    return citizenRequest<DashboardData>(CITIZEN.dashboard, { method: "GET" });
  },
  getComplaints() {
    return citizenRequest<ComplaintItem[]>(CITIZEN.complaints, { method: "GET" });
  },
  getComplaint(id: string) {
    return citizenRequest<ComplaintItem>(CITIZEN.complaintById(id), { method: "GET" });
  },
  getLeaderboard() {
    return citizenRequest<LeaderboardEntry[]>(CITIZEN.leaderboard, { method: "GET" });
  },
  /** Submit complaint (multipart/form-data with optional photos) */
  async submitComplaint(
    formData: FormData
  ): Promise<{ data: ComplaintItem; ok: true } | { error: string; ok: false }> {
    const headers = getAuthHeaders();
    if (!headers.Authorization) {
      return { ok: false, error: "Not logged in" };
    }
    try {
      const res = await fetch(CITIZEN.complaints, {
        method: "POST",
        headers,
        body: formData,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        return {
          ok: false,
          error: (data as { message?: string }).message || "Submit failed",
        };
      }
      return { ok: true, data: data as ComplaintItem };
    } catch (e) {
      return {
        ok: false,
        error: e instanceof Error ? e.message : "Network error",
      };
    }
  },
};

/** Government dashboard (requires auth, government role) */
function governmentRequest<T>(
  url: string,
  options: RequestInit & { body?: object } = {}
): Promise<{ data: T; ok: true } | { error: string; ok: false }> {
  const headers = getAuthHeaders();
  if (!headers.Authorization) {
    return Promise.resolve({ ok: false, error: "Not logged in" });
  }
  return request<T>(url, {
    ...options,
    headers: { ...headers, ...options.headers },
  });
}

export const governmentApi = {
  getDashboard() {
    return governmentRequest<GovernmentDashboardResponse>(GOVERNMENT.dashboard, { method: "GET" });
  },
  getComplaints() {
    return governmentRequest<GovComplaintItem[]>(GOVERNMENT.complaints, { method: "GET" });
  },
  getComplaintById(id: string) {
    return governmentRequest<GovComplaintItem>(GOVERNMENT.complaintById(id), { method: "GET" });
  },
  updateComplaintStatus(
    id: string,
    status: "Pending" | "Approved" | "In Progress" | "Resolved"
  ) {
    return governmentRequest<GovComplaintItem>(GOVERNMENT.complaintStatus(id), {
      method: "PATCH",
      body: { status },
    });
  },
};
