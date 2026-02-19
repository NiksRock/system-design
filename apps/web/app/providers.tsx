"use client";

import { createQueryClient } from "@/lib/react-query";
import {
  HydrationBoundary,
  QueryClientProvider,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";

export default function Providers({
  children,
  dehydratedState,
}: {
  children: React.ReactNode;
  dehydratedState?: unknown;
}) {
  const [queryClient] = useState(() => createQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <HydrationBoundary state={dehydratedState}>
        {children}
      </HydrationBoundary>

      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}
