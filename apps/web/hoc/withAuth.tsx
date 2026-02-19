"use client";

import { useMe } from "@/hooks/useMe";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import type { ComponentType, JSX } from "react";

export function withAuth<T extends object>(
  Component: ComponentType<T>,
) {
  return function ProtectedComponent(
    props: T,
  ): JSX.Element | null {
    const { data, isLoading, isError } = useMe();
    const router = useRouter();

    useEffect(() => {
      if (!isLoading && (isError || !data)) {
        router.replace("/login");
      }
    }, [isLoading, isError, data, router]);

    if (isLoading) {
      return (
        <div className="flex min-h-screen items-center justify-center">
          Loading...
        </div>
      );
    }

    if (!data) return null;

    return <Component {...props} />;
  };
}
