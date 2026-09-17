"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import ProfileMenu from "@/components/ProfileMenu";
import { BREADCRUMBS, NAV_ITEMS } from "@/lib/nav";
import {
  IconChevronsLeft,
  IconChevronsRight,
  IconDollar,
  IconFile,
  IconHome,
  IconLogin,
  IconLogout,
  IconPhone,
  IconScan,
  IconUser,
} from "@/components/icons";
import { logoutSession } from "@/lib/session";

const ICONS = {
  home: IconHome,
  phone: IconPhone,
  user: IconUser,
  scan: IconScan,
  dollar: IconDollar,
  file: IconFile,
  login: IconLogin,
};

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const crumb = BREADCRUMBS[pathname];

  return (
    <div className="flex h-screen overflow-hidden bg-yas-page">
      <aside
        className={`relative flex h-full shrink-0 flex-col bg-yas-yellow text-yas-navy transition-[width] duration-200 ${
          collapsed ? "w-[84px]" : "w-[248px]"
        }`}
      >
        <div className="flex h-16 items-center justify-between px-3">
          <Link href="/accueil" className="flex min-w-0 items-center gap-2.5">
            <img
              src="/logo-yas.svg"
              alt="Yas"
              width={40}
              height={36}
              className="h-9 w-auto object-contain"
            />
            {!collapsed ? (
              <span className="min-w-0">
                <span className="block truncate text-sm font-bold leading-none">GetCallDetail</span>
                <span className="mt-1 block truncate text-[11px] font-medium text-yas-navy/70">Yas Togo</span>
              </span>
            ) : null}
          </Link>
          <button
            type="button"
            aria-label={collapsed ? "Ouvrir le menu" : "Réduire le menu"}
            onClick={() => setCollapsed((value) => !value)}
            className="btn btn-ghost btn-xs text-yas-navy hover:bg-black/5"
          >
            {collapsed ? <IconChevronsRight className="size-4" /> : <IconChevronsLeft className="size-4" />}
          </button>
        </div>

        <nav className="mt-3 flex flex-1 flex-col gap-1.5 px-2.5">
          {NAV_ITEMS.map((item) => {
            const Icon = ICONS[item.icon];
            const active = pathname === item.href;
            const isMixx = item.href === "/tmoney";

            return (
              <Link
                key={item.href}
                href={item.href}
                title={item.label}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all ${
                  isMixx ? "mixx-nav" : ""
                } ${
                  active
                    ? "bg-white text-yas-navy"
                    : "text-yas-navy/85 hover:bg-black/5"
                } ${collapsed ? "justify-center px-0" : ""}`}
              >
                {isMixx ? (
                  <img
                    src="/logo-mixx.svg"
                    alt="Mixx by Yas"
                    className={`mixx-nav-logo h-6 w-auto object-contain object-left ${collapsed ? "max-w-[48px]" : "max-w-[150px]"}`}
                  />
                ) : (
                  <Icon className="size-[18px] shrink-0" />
                )}
                {!collapsed && !isMixx ? <span className="truncate">{item.label}</span> : null}
              </Link>
            );
          })}
          <button
            type="button"
            title="Se déconnecter"
            onClick={logoutSession}
            className={`mt-3 flex items-center gap-3 rounded-xl bg-yas-navy px-3 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[#012d66] ${
              collapsed ? "justify-center px-0" : ""
            }`}
          >
            <IconLogout className="size-[18px] shrink-0" />
            {!collapsed ? <span className="truncate">Se déconnecter</span> : null}
          </button>
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="yas-topbar relative z-30 flex h-16 shrink-0 items-center justify-between border-b border-black/5 bg-yas-surface px-6 shadow-[0_8px_24px_rgba(1,55,125,0.04)]">
          <div className="flex min-w-0 items-center gap-3 text-sm">
            <Link href="/accueil" className="font-semibold text-yas-navy hover:text-yas-blue">
              Yas
            </Link>
            <span className="h-4 w-px bg-neutral-200" />
            <Link href="/accueil" aria-label="Accueil" className="text-neutral-400 hover:text-yas-navy">
              <IconHome className="size-4" />
            </Link>
            <Link href="/accueil" className="yas-link hover:underline">
              GetCallDetail
            </Link>
            {crumb ? (
              <>
                <span className="text-neutral-300">/</span>
                <Link href={crumb.href} className="truncate font-semibold text-neutral-700 hover:text-yas-navy">
                  {crumb.label}
                </Link>
              </>
            ) : null}
          </div>
          <div className="flex items-center gap-3">
            <ProfileMenu />
          </div>
        </header>

        <main className="yas-content min-h-0 flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
