"use client";

import { useQuery } from "@tanstack/react-query";
import { clientFetch } from "@/lib/api.client";
import { queryKeys } from "@/lib/query-keys";

type MeResponse = {
  user: {
    sub: string;
    iat: number;
    exp: number;
  };
};

export function useMe() {
  return useQuery({
    queryKey: queryKeys.me,
    queryFn: () => clientFetch<MeResponse>("/auth/me"),
    staleTime: Infinity,
  });
}

