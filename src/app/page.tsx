"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import LoginScreen from "@/components/LoginScreen";
import { safeNextPath } from "@/lib/auth-redirect";
import { getSessionToken } from "@/lib/session";

function LoginPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = safeNextPath(searchParams.get("next")) || "/accueil";

  useEffect(() => {
    if (getSessionToken()) {
      router.replace(nextPath);
    }
  }, [nextPath, router]);

  return (
    <LoginScreen
      onSuccess={() => {
        router.push(nextPath);
      }}
    />
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-dvh items-center justify-center bg-[#eef2f7] text-sm font-medium text-neutral-500">
          Chargement…
        </div>
      }
    >
      <LoginPageInner />
    </Suspense>
  );
}
