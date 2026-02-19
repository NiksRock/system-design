const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3002/api";

export type NormalizedApiError = {
  status: number;
  message: string;
  path?: string | null;
  timestamp?: string;
  details?: unknown;
};

export class ApiError extends Error {
  public readonly status: number;
  public readonly body: NormalizedApiError;

  constructor(body: NormalizedApiError) {
    super(body.message);
    this.status = body.status;
    this.body = body;
  }
}

function hasJsonBody(body: unknown): boolean {
  if (!body) return false;
  if (typeof body === "string") return false;
  if (body instanceof FormData) return false;
  if (body instanceof Blob) return false;
  if (body instanceof ArrayBuffer) return false;
  return typeof body === "object";
}

function normalizeError(status: number, raw: unknown): NormalizedApiError {
  if (
    raw &&
    typeof raw === "object" &&
    "statusCode" in raw &&
    "message" in raw
  ) {
    const r = raw as {
      statusCode: number;
      message: unknown;
      path?: string;
      timestamp?: string;
    };

    return {
      status: r.statusCode ?? status,
      message:
        typeof r.message === "string" ? r.message : JSON.stringify(r.message),
      path: r.path ?? null,
      timestamp: r.timestamp,
      details: raw,
    };
  }

  return {
    status,
    message: "Request failed",
    details: raw,
  };
}

export async function clientFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const body = options.body;

  const shouldStringify = hasJsonBody(body);

  const finalBody = shouldStringify && body ? JSON.stringify(body) : body;

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: "include",
    body: finalBody,
    headers: {
      ...(shouldStringify ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });

  // 🔥 204 — no content
  if (res.status === 204) {
    return undefined as T;
  }

  // Avoid JSON parsing for empty responses
let data: unknown = null;

if (res.status !== 204) {
  const contentType = res.headers.get("content-type");
  if (contentType?.includes("application/json")) {
    data = await res.json().catch(() => null);
  }
}


  if (!res.ok) {
    throw new ApiError(normalizeError(res.status, data));
  }

  return data as T;
}
