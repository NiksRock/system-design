"use client";

import { useQuery } from "@tanstack/react-query";
import { clientFetch } from "@/lib/api.client";
import { queryKeys } from "@/lib/query-keys";

export type Transfer = {
  id: string;
  status: string;
  totalItems: number;
  completedItems: number;
  failedItems: number;
  transferredBytes: number;
  createdAt: string;
};

export function useTransfers() {
  return useQuery({
    queryKey: queryKeys.transfers,
    queryFn: () =>
      clientFetch<Transfer[]>("/transfers"),
  });
}
