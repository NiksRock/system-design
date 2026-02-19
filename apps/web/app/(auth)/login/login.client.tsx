"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

export default function LoginClient() {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = () => {
    setIsLoading(true);
    window.location.href = `${API_URL}/auth/google`;
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-sm shadow-lg">
        <CardHeader>
          <CardTitle className="text-center text-2xl">
            Sign in to GDriveBridge
          </CardTitle>
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
