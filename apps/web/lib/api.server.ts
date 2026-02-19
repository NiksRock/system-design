import { cookies } from "next/headers";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3002/api";

export class ServerApiError extends Error {
  public readonly status: number;
  public readonly details: unknown;

  constructor(status: number, details: unknown) {
    super(`Server request failed: ${status}`);
    this.status = status;
    this.details = details;
  }
}

export async function serverFetch<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const cookieStore = await cookies();

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...options?.headers,
      Cookie: cookieStore.toString(),
    },
    cache: "no-store",
  });

  let data: unknown = null;

  if (res.status !== 204) {
    const contentType = res.headers.get("content-type");
    if (contentType?.includes("application/json")) {
      data = await res.json().catch(() => null);
    }
  }

  if (!res.ok) {
    throw new ServerApiError(res.status, data);
  }

  return data as T;
}
