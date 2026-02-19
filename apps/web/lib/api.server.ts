import { cookies } from "next/headers";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3002/api";

export async function serverFetch(
  path: string,
  options?: RequestInit
) {
  const cookieStore = await cookies();

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...options?.headers,
      Cookie: cookieStore.toString(),
    },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Request failed");
  }

  return res.json();
}
