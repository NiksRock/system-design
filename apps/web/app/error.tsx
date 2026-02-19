"use client";

import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  console.error(error);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="space-y-4 text-center">
        <h2 className="text-xl font-semibold">
          Something went wrong
        </h2>

        <Button onClick={() => reset()}>
          Try again
        </Button>
      </div>
    </div>
  );
}
