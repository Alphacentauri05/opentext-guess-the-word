import type {
  User,
  TokenResponse,
  GameDetail,
  DailyQuotaStatus,
  GameHistoryItem,
  DailyActivityReportItem,
  UserActivityReportItem,
  AdminSummaryStats,
} from "../types";

const API_BASE = "/api/v1";

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem("opentext_wordle_token");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorDetail = "An unexpected error occurred.";
    try {
      const errorJson = await response.json();
      if (typeof errorJson.detail === "string") {
        errorDetail = errorJson.detail;
      } else if (Array.isArray(errorJson.detail)) {
        errorDetail = errorJson.detail.map((err: any) => err.msg).join(", ");
      }
    } catch {
      // response wasn't JSON
      errorDetail = response.statusText || errorDetail;
    }

    if (response.status === 401) {
      // If unauthorized, clear invalid token
      localStorage.removeItem("opentext_wordle_token");
      localStorage.removeItem("opentext_wordle_user");
    }

    throw new ApiError(errorDetail, response.status);
  }

  return response.json();
}

export const authApi = {
  register: (data: { username: string; password: string }) =>
    request<TokenResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  login: (data: { username: string; password: string }) =>
    request<TokenResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getMe: () => request<User>("/auth/me"),
};

export const gamesApi = {
  start: () =>
    request<GameDetail>("/games/start", {
      method: "POST",
    }),

  getActive: () => request<GameDetail>("/games/active"),

  getQuota: () => request<DailyQuotaStatus>("/games/quota"),

  submitGuess: (gameId: string, guess: string) =>
    request<GameDetail>(`/games/${gameId}/guess`, {
      method: "POST",
      body: JSON.stringify({ guess }),
    }),

  getHistory: () => request<GameHistoryItem[]>("/games/history"),
};

export const adminApi = {
  getDailyReport: () =>
    request<DailyActivityReportItem[]>("/admin/reports/daily"),

  getUserReport: (userId?: string) => {
    const query = userId ? `?user_id=${userId}` : "";
    return request<UserActivityReportItem[]>(`/admin/reports/users${query}`);
  },

  getSummary: () => request<AdminSummaryStats>("/admin/reports/summary"),
};
