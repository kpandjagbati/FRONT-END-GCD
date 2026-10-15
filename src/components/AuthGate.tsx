"use client";

import { useEffect, useState } from "react";
import LoginScreen from "@/components/LoginScreen";
import { clearSession, getSessionToken, subscribeSession } from "@/lib/session";
import { useIsClient } from "@/lib/use-client";

const AUTH_REQUIRED_EVENT = "gcd-auth-required";

export function requestAuthScreen() {
  if (typeof window === "undefined") return;
  clearSession();
  window.dispatchEvent(new Event(AUTH_REQUIRED_EVENT));
}

/**
 * Sans session valide : affiche la page de login SANS changer l'URL
 * (ex. barre reste sur /traitement/historique). Après login → contenu.
 */
export default function AuthGate({ children }: { children: React.ReactNode }) {
  const isClient = useIsClient();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    if (!isClient) return;

    function sync() {
      setAllowed(Boolean(getSessionToken()));
    }

    sync();
    const unsubscribe = subscribeSession(sync);
    window.addEventListener(AUTH_REQUIRED_EVENT, sync);
    return () => {
      unsubscribe();
      window.removeEventListener(AUTH_REQUIRED_EVENT, sync);
    };
  }, [isClient]);

  if (!isClient) {
    return (
      <div className="flex h-dvh items-center justify-center bg-[#eef2f7] text-sm font-medium text-neutral-500">
        Chargement…
      </div>
    );
  }

  if (!allowed) {
    return <LoginScreen onSuccess={() => setAllowed(true)} />;
  }

  return children;
}
