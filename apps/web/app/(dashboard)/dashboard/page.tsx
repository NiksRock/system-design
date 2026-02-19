import { redirect } from "next/navigation";
import Providers from "@/app/providers";
import { queryKeys } from "@/lib/query-keys";
import { serverFetch } from "@/lib/api.server";
import { getDehydratedState } from "@/lib/query-server"; 
import type { MeResponse } from "@/lib/auth"; 
import ConnectionCards from "@/components/dashboard/connection-cards";

export default async function DashboardPage() {
  // Fetch once
  const me = await serverFetch<MeResponse>("/auth/me").catch(() => null);

  if (!me) redirect("/login");

  const { dehydratedState } = await getDehydratedState(async (qc) => {
    await qc.setQueryData(queryKeys.auth.me, me);
  });

  return (
    <Providers dehydratedState={dehydratedState}>
      <ConnectionCards/>
    </Providers>
  );
}
