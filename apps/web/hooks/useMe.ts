"use client";

import { useQuery } from "@tanstack/react-query";
import { clientFetch } from "@/lib/api.client";
import { queryKeys } from "@/lib/query-keys";
import type { MeResponse } from "@/lib/auth";

export function useMe() {
  return useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: () => clientFetch<MeResponse>("/auth/me"),
    staleTime: 1000 * 60 * 5,
  });
}
