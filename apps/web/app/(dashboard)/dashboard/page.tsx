import { getCurrentUser } from "@/lib/auth";
import { queryKeys } from "@/lib/query-keys";
import { createQueryClient } from "@/lib/react-query";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { redirect } from "next/navigation";
import DashboardClient from "./dashboard.client";

export default async function DashboardPage() {
const queryClient=createQueryClient()

  const user = await getCurrentUser().catch(() => null);

  if (!user) redirect("/login");

  queryClient.setQueryData(queryKeys.me, user);

  const dehydratedState = dehydrate(queryClient);

  return (
    <HydrationBoundary state={dehydratedState}>
      <DashboardClient />
    </HydrationBoundary>
  );
}
