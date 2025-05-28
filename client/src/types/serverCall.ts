type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface RequestConfig {
  headers?: HeadersInit;
  params?: Record<string, string | number>;
  credentials?: RequestCredentials;
  signal?: AbortSignal;
}

interface ApiError {
  status?: number;
  message: string;
  errors?: Record<string, string[]>;
}

export type { HttpMethod, RequestConfig, ApiError };
