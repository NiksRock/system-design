"use client";

import { useMe } from "@/hooks/useMe";

export default function DashboardClient() {
  const { data, isLoading } = useMe();

  if (isLoading) {
    return <p>Loading...</p>;
  }

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">
        Welcome {data?.user.sub}
      </h1>
    </main>
  );
}
