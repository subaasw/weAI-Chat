import { ApiError, HttpMethod, RequestConfig } from "@/types/serverCall";
import { BASE_URL } from "@/utils/api-constant";

class ServerCall {
  private baseURL: string;
  private defaultHeaders: HeadersInit;

  constructor(baseURL: string = BASE_URL || "") {
    this.baseURL = baseURL;
    this.defaultHeaders = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };
  }

  private buildUrl(
    endpoint: string,
    params?: Record<string, string | number>
  ): string {
    const url = new URL(endpoint, this.baseURL);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    return url.toString();
  }

  private createHeaders(config: RequestConfig): HeadersInit {
    const headers = new Headers(this.defaultHeaders);

    if (config.headers) {
      Object.entries(config.headers).forEach(([key, value]) => {
        headers.set(key, value);
      });
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get("content-type");

    if (!response.ok) {
      const error: ApiError = {
        status: response.status,
        message: response.statusText,
      };

      if (contentType?.includes("application/json")) {
        const errorData = await response.json();
        error.message = errorData.message || error.message;
        error.errors = errorData.errors;
      }

      return error as T;
    }

    if (contentType?.includes("application/json")) {
      return response.json();
    }

    return response.text() as T;
  }

  private async request<T>(
    method: HttpMethod,
    endpoint: string,
    data?: unknown,
    config: RequestConfig = {}
  ): Promise<T> {
    const url = this.buildUrl(endpoint, config.params);
    const headers = this.createHeaders(config);

    const requestOptions: RequestInit = {
      method,
      headers,
      credentials: config.credentials || "include",
      signal: config.signal,
    };

    if (data) {
      if (data instanceof FormData) {
        const formDataHeaders = new Headers(headers);
        formDataHeaders.delete("Content-Type");
        requestOptions.headers = formDataHeaders;
        requestOptions.body = data;
      } else {
        requestOptions.body = JSON.stringify(data);
      }
    }

    try {
      const response = await fetch(url, requestOptions);
      return this.handleResponse<T>(response);
    } catch (error) {
      if (error instanceof Error) {
        if ((error as ApiError).status === 401) {
          localStorage.removeItem("token");
        }
        throw error;
      }
      throw new Error("An unknown error occurred");
    }
  }

  public get<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.request<T>("GET", endpoint, undefined, config);
  }

  public post<T>(
    endpoint: string,
    data?: unknown,
    config?: RequestConfig
  ): Promise<T> {
    return this.request<T>("POST", endpoint, data, config);
  }

  public put<T>(
    endpoint: string,
    data?: unknown,
    config?: RequestConfig
  ): Promise<T> {
    return this.request<T>("PUT", endpoint, data, config);
  }

  public patch<T>(
    endpoint: string,
    data?: unknown,
    config?: RequestConfig
  ): Promise<T> {
    return this.request<T>("PATCH", endpoint, data, config);
  }

  public delete<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.request<T>("DELETE", endpoint, undefined, config);
  }
}

const serverCall = new ServerCall();
export default serverCall;

export { ServerCall };
