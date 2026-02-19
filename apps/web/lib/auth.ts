import { serverFetch } from "./api.server";

export async function getCurrentUser() {
  return serverFetch("/auth/me");
}
