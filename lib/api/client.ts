export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

/** When true (default in development), log Spring API calls made during SSR/RSC to the Node terminal. */
function shouldLogSsrApi(): boolean {
  if (process.env.NODE_ENV !== "development") return false;
  if (typeof window !== "undefined") return false;
  if (process.env.DEBUG_API === "0") return false;
  return true;
}

export type ApiErrorPayload = {
  status: number;
  message: string;
  errors?: Record<string, string>;
};

export class ApiError extends Error {
  readonly status: number;
  readonly errors?: Record<string, string>;

  constructor(payload: ApiErrorPayload) {
    super(payload.message);
    this.name = "ApiError";
    this.status = payload.status;
    this.errors = payload.errors;
  }
}

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  token?: string | null;
  body?: unknown;
  signal?: AbortSignal;
  cache?: RequestCache;
};

function buildHeaders(options: RequestOptions): HeadersInit {
  const headers: Record<string, string> = {};
  if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
  }
  if (options.token) {
    headers["Authorization"] = `Bearer ${options.token}`;
  }
  return headers;
}

async function readErrorPayload(response: Response): Promise<ApiErrorPayload> {
  try {
    const data = (await response.json()) as Partial<ApiErrorPayload>;
    return {
      status: response.status,
      message:
        typeof data.message === "string" && data.message.length > 0
          ? data.message
          : defaultMessageForStatus(response.status),
      errors: data.errors,
    };
  } catch {
    return {
      status: response.status,
      message: defaultMessageForStatus(response.status),
    };
  }
}

function defaultMessageForStatus(status: number): string {
  if (status === 401) return "You need to sign in again.";
  if (status === 403) return "You do not have access to this resource.";
  if (status === 404) return "The requested resource was not found.";
  if (status >= 500) return "The server is having trouble. Please try again.";
  return "Request failed. Please try again.";
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const url = path.startsWith("http") ? path : `${API_BASE_URL}${path}`;
  const method = options.method ?? "GET";
  const log = shouldLogSsrApi();
  if (log) {
    // eslint-disable-next-line no-console -- intentional dev SSR observability
    console.info(`[SSR API] ${method} ${url}`);
  }
  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers: buildHeaders(options),
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
      signal: options.signal,
      cache: options.cache ?? "no-store",
    });
  } catch (error) {
    if (log) {
      // eslint-disable-next-line no-console
      console.info(`[SSR API] ${method} ${url} → network error`);
    }
    throw new ApiError({
      status: 0,
      message:
        error instanceof Error && error.name === "AbortError"
          ? "Request cancelled."
          : "Cannot reach the server. Check your connection.",
    });
  }

  if (log) {
    // eslint-disable-next-line no-console
    console.info(`[SSR API] ${method} ${url} → ${response.status}`);
  }

  if (!response.ok) {
    throw new ApiError(await readErrorPayload(response));
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return undefined as T;
  }
  return (await response.json()) as T;
}

export function extractErrorMessage(error: unknown, fallback = "Something went wrong."): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return fallback;
}

export function extractFieldErrors(error: unknown): Record<string, string> | undefined {
  if (error instanceof ApiError) return error.errors;
  if (typeof error === "object" && error !== null && "errors" in error) {
    const maybe = (error as { errors?: unknown }).errors;
    if (maybe && typeof maybe === "object") {
      return maybe as Record<string, string>;
    }
  }
  return undefined;
}
