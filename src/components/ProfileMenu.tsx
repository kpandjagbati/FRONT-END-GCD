"use client";

import { useEffect, useRef, useState } from "react";
import { IconChevronDown, IconLogout, IconUser } from "@/components/icons";
import { logoutSession } from "@/lib/session";
import { useSessionUsername } from "@/lib/use-client";

export default function ProfileMenu() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const username = useSessionUsername();

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
        className="flex items-center gap-2 rounded-full border border-neutral-200 bg-[#f8fafc] py-1 pl-3 pr-1 text-sm font-semibold text-yas-navy"
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen((value) => !value)}
      >
        <span>{username || "Utilisateur"}</span>
        <span className="flex size-8 items-center justify-center rounded-full bg-yas-navy text-white">
          <IconUser className="size-4" />
        </span>
        <IconChevronDown className={`mr-1 size-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open ? (
        <div
          role="dialog"
          aria-label="Informations du profil"
          className="absolute right-0 top-[calc(100%+10px)] z-50 w-80 overflow-hidden rounded-2xl bg-yas-surface text-left shadow-[0_24px_60px_rgba(1,55,125,0.18)]"
          onMouseDown={(event) => event.stopPropagation()}
        >
          <div className="yas-hero px-4 py-4 text-white">
            <p className="text-xs font-medium text-yas-yellow">Profil Yas</p>
            <p className="mt-1 text-lg font-bold">{username}</p>
          </div>
          <div className="p-4">
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-neutral-500">Identifiant</dt>
                <dd className="font-semibold text-neutral-800">{username}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-neutral-500">Nom d&apos;utilisateur</dt>
                <dd className="font-semibold text-neutral-800">{username}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-neutral-500">Application</dt>
                <dd className="font-semibold text-neutral-800">GetCallDetail</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-neutral-500">Rôle</dt>
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
