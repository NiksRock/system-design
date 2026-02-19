import { QueryClient } from "@tanstack/react-query";
import { ApiError } from "./api.client";

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 30,
        retry: (failureCount, error: unknown) => {
          if (error instanceof ApiError && error.status === 401) {
            return false;
          }

          return failureCount < 2;
        },
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: 0,
      },
    },
  });
}
