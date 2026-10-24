import axios, { AxiosError } from "axios";
import { auth } from "@/lib/firebase";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach fresh Firebase ID token on every request
apiClient.interceptors.request.use(async (config) => {
  if (typeof window !== "undefined") {
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Handle 401 — sign out and redirect to login
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        const { signOut } = await import("firebase/auth");
        await signOut(auth).catch(() => {});
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export interface ApiError {
  message: string;
  detail?: string;
  status: number;
}

function formatDetail(detail: unknown): string | undefined {
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    // FastAPI/Pydantic validation errors: [{ loc: ["body", "field"], msg: "..." }]
    return detail
      .map((d: { loc?: (string | number)[]; msg?: string }) => {
        const where = (d.loc || []).filter((part) => part !== "body").join(".");
        return where ? `${where}: ${d.msg}` : d.msg;
      })
      .join("\n");
  }
  return undefined;
}

export function handleApiError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    const detail = formatDetail(error.response?.data?.detail);
    return {
      message: detail || error.message,
      detail,
      status: error.response?.status || 500,
    };
  }
  return {
    message: "An unexpected error occurred",
    status: 500,
  };
}

export { API_BASE_URL };
