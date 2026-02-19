import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export default async function DashboardPage() {
  const data = await getCurrentUser().catch(() => null);

  if (!data) {
    redirect("/login");
  }

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">
        Welcome {data.user.sub}
      </h1>
    </main>
  );
}
