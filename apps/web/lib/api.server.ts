import { cookies } from "next/headers";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3002/api";

export async function serverFetch<T>(
  path: string,
  options?: RequestInit
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

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(
      `Server request failed: ${res.status} ${JSON.stringify(data)}`
    );
  }

  return data as T;
}

