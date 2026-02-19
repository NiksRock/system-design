const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";

export async function clientFetch(
  path: string,
  options?: RequestInit
) {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: "include", // send cookies automatically
  });

  if (!res.ok) {
    throw new Error("Request failed");
  }

  return res.json();
}
