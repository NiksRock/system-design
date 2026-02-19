import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export default async function HomePage() {
  const user = await getCurrentUser().catch(() => null);

  if (!user) {
    redirect("/login");
  }

  redirect("/dashboard");
}
