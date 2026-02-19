"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { clientFetch } from "@/lib/api.client";

export function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await clientFetch("/auth/logout", {
      method: "POST",
    });

    router.push("/login");
    router.refresh();
  }

  return (
    <Button variant="ghost" onClick={handleLogout}>
      Logout
    </Button>
  );
}
