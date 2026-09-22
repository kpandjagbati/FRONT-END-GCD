"use client";

import { useEffect, useRef, useState } from "react";
import { IconChevronDown, IconLogout } from "@/components/icons";
import { getSessionEmail, logoutSession } from "@/lib/session";
import { useIsClient, useSessionDisplayName, useSessionUsername } from "@/lib/use-client";

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
  const sessionName = useSessionDisplayName() || username;
  const displayName = isClient && sessionName ? sessionName : "Compte";
  const email = isClient ? getSessionEmail() : "";

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
        className={`flex h-11 max-w-[calc(100vw-1.5rem)] items-center gap-2.5 rounded-full bg-white py-1 pl-3.5 pr-1.5 text-left shadow-[0_8px_20px_rgba(1,55,125,0.08)] ring-1 transition ${
          open
            ? "ring-yas-navy/25 shadow-[0_10px_24px_rgba(1,55,125,0.14)]"
            : "ring-black/5 hover:shadow-[0_10px_24px_rgba(1,55,125,0.14)] hover:ring-yas-navy/15"
        }`}
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen((value) => !value)}
      >
        <span className="hidden min-w-0 sm:flex sm:flex-col sm:items-end">
          <span className="max-w-[12rem] truncate text-[13px] font-bold leading-tight text-yas-navy">
            {displayName}
          </span>
          <span className="text-[10px] font-medium leading-tight text-neutral-400">Connecté</span>
        </span>
        <Avatar name={displayName} status />
        <IconChevronDown
          className={`mr-1.5 size-4 text-neutral-400 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open ? (
        <div
          role="dialog"
          aria-label="Informations du profil"
          className="absolute right-0 top-[calc(100%+12px)] z-50 w-[min(20.5rem,calc(100vw-1.5rem))] overflow-hidden rounded-2xl bg-white text-left shadow-[0_24px_60px_rgba(1,55,125,0.18)] ring-1 ring-black/5"
          onMouseDown={(event) => event.stopPropagation()}
        >
          <div className="yas-hero px-4 py-4 text-white">
            <div className="flex items-center gap-3">
              <Avatar name={displayName} size="lg" />
              <div className="min-w-0">
                <p className="text-[11px] font-medium text-yas-yellow">Profil Yas</p>
                <p className="mt-0.5 truncate text-base font-bold">{displayName}</p>
                <p className="truncate text-xs text-white/70">{email}</p>
              </div>
            </div>
          </div>
          <div className="p-4">
            <dl className="space-y-2.5 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-neutral-400">Identifiant</dt>
                <dd className="truncate font-semibold text-neutral-800">{username || displayName}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-neutral-400">Nom d&apos;utilisateur</dt>
                <dd className="truncate font-semibold text-neutral-800">{displayName}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-neutral-400">Application</dt>
                <dd className="font-semibold text-neutral-800">GetCallDetail</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-neutral-400">Rôle</dt>
                <dd className="font-semibold text-neutral-800">Utilisateur</dd>
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
