import { serverFetch } from "./api.server";

export type MeResponse = {
  user: {
    id: string;
    email: string;
  };
  sourceAccount: {
    id: string;
    email: string;
    name: string | null;
    avatarUrl: string | null;
  } | null;
  destinationAccount: {
    id: string;
    email: string;
    name: string | null;
    avatarUrl: string | null;
  } | null;
};


export async function getCurrentUser(): Promise<MeResponse> {
  return serverFetch("/auth/me");
}
