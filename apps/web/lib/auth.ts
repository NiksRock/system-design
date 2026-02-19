import { serverFetch } from "./api.server";

export type MeResponse = {
  user: {
    sub: string;
    iat: number;
    exp: number;
  };
};

export async function getCurrentUser(): Promise<MeResponse> {
  return serverFetch("/auth/me");
}
