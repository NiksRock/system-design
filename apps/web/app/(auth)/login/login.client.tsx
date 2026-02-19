"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
console.log(process.env.NODE_ENV, process.env.NEXT_PUBLIC_API_URL);
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3002/api";

export default function LoginClient() {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = () => {
    if (!API_URL) {
      console.error("NEXT_PUBLIC_API_URL is not defined");
      return;
    }

    setIsLoading(true);

    // Full redirect to backend OAuth endpoint
    window.location.href = `${API_URL}/auth/google`;
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-sm shadow-lg">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Sign in</CardTitle>
        </CardHeader>

        <CardContent>
          <Button onClick={handleLogin} className="w-full" disabled={isLoading}>
            {isLoading ? "Redirecting..." : "Continue with Google"}
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
