"use client";

import { useEffect, useRef, useState } from "react";
import { IconChevronDown, IconLogout } from "@/components/icons";
import { loginUser } from "@/lib/gcd-api";
import {
  getSessionEmail,
  getSessionPassword,
  getSessionUsername,
  logoutSession,
  saveSessionToken,
  saveSessionUser,
} from "@/lib/session";
import { useIsClient, useSessionDisplayName, useSessionUser, useSessionUsername } from "@/lib/use-client";

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase() || "U";
}

function Avatar({
  name,
  size = "sm",
  status = false,
}: Readonly<{
  name: string;
  size?: "sm" | "lg";
  status?: boolean;
}>) {
  const large = size === "lg";
  return (
    <span className="relative shrink-0">
      <span
        className={`flex items-center justify-center rounded-full bg-yas-navy font-bold text-white ring-2 ring-yas-yellow ${
          large ? "size-12 text-sm" : "size-9 text-[11px]"
        }`}
      >
        {initials(name)}
      </span>
      {status ? (
        <span className="absolute bottom-0 right-0 size-2.5 rounded-full bg-[#22a45a] ring-2 ring-white" />
      ) : null}
    </span>
  );
}

export default function ProfileMenu() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const isClient = useIsClient();
  const username = useSessionUsername();
  const user = useSessionUser();
  const sessionName = useSessionDisplayName() || username;
  const displayName = isClient && sessionName ? sessionName : "Compte";
  const email = isClient ? getSessionEmail() : "";
  const identifier = isClient ? user?.username || username : "";
  const lastConnection = isClient ? user?.lastConnection || "—" : "—";
  const needsProfile = isClient && Boolean(username) && (!user?.email || !user?.lastConnection);

  useEffect(() => {
    if (!needsProfile) return;
    let cancelled = false;
    void (async () => {
      const login = getSessionUsername().trim();
      const password = getSessionPassword();
      if (!login || !password) return;
      try {
        const { token, user: profile } = await loginUser(login, password);
        if (cancelled || !profile) return;
        saveSessionToken(token);
        saveSessionUser(profile);
      } catch {
        // Profil optionnel : ne pas déconnecter si le refresh échoue.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [needsProfile]);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function logout() {
    setOpen(false);
    logoutSession();
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        className={`flex h-10 items-center gap-1.5 rounded-full bg-white py-1 pl-1.5 pr-1 text-left shadow-[0_8px_20px_rgba(1,55,125,0.08)] ring-1 transition sm:h-11 sm:max-w-[min(16rem,calc(100vw-8rem))] sm:gap-2.5 sm:pl-3.5 sm:pr-1.5 ${
          open
            ? "ring-yas-navy/25 shadow-[0_10px_24px_rgba(1,55,125,0.14)]"
            : "ring-black/5 hover:shadow-[0_10px_24px_rgba(1,55,125,0.14)] hover:ring-yas-navy/15"
        }`}
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen((value) => !value)}
      >
        <span className="hidden min-w-0 sm:flex sm:flex-col sm:items-end">
          <span className="max-w-[10rem] truncate text-[13px] font-bold leading-tight text-yas-navy md:max-w-[12rem]">
            {displayName}
          </span>
          <span className="text-[10px] font-medium leading-tight text-neutral-400">Connecté</span>
        </span>
        <Avatar name={displayName} status />
        <IconChevronDown
          className={`hidden size-4 text-neutral-400 transition-transform sm:mr-1.5 sm:block ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open ? (
        <div
          role="dialog"
          aria-label="Informations du profil"
          className="fixed right-2.5 top-[3.75rem] z-50 w-[min(20.5rem,calc(100vw-1.25rem))] overflow-hidden rounded-2xl bg-white text-left shadow-[0_24px_60px_rgba(1,55,125,0.18)] ring-1 ring-black/5 sm:absolute sm:right-0 sm:top-[calc(100%+12px)]"
          onMouseDown={(event) => event.stopPropagation()}
        >
          <div className="yas-hero px-4 py-4 text-white">
            <div className="flex items-center gap-3">
              <Avatar name={displayName} size="lg" />
              <div className="min-w-0">
                <p className="text-[11px] font-medium text-yas-yellow">Profil Yas</p>
                <p className="mt-0.5 truncate text-base font-bold">{displayName}</p>
                <p className="truncate text-xs text-white/70">{email || "—"}</p>
              </div>
            </div>
          </div>
          <div className="p-4">
            <dl className="space-y-2.5 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-neutral-400">Identifiant</dt>
                <dd className="truncate font-semibold text-neutral-800">{identifier || "—"}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-neutral-400">Nom d&apos;utilisateur</dt>
                <dd className="truncate font-semibold text-neutral-800">{displayName}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-neutral-400">Email</dt>
                <dd className="truncate font-semibold text-neutral-800" title={email || undefined}>
                  {email || "—"}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-neutral-400">Application</dt>
                <dd className="font-semibold text-neutral-800">GetCallDetail</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-neutral-400">Dernière connexion</dt>
                <dd className="truncate font-semibold text-neutral-800">{lastConnection}</dd>
              </div>
            </dl>
            <button
              type="button"
              onClick={logout}
              className="btn mt-4 h-10 min-h-10 w-full rounded-xl border-none bg-yas-navy px-4 text-sm font-semibold text-white hover:bg-[#012d66]"
            >
              Déconnecter
              <IconLogout className="size-4" />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
