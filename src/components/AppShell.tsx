"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { BREADCRUMBS, NAV_ITEMS } from "@/lib/nav";
import {
  IconChevronsLeft,
  IconChevronsRight,
  IconDollar,
  IconFile,
  IconHome,
  IconLogin,
  IconPhone,
  IconScan,
  IconUser,
} from "@/components/icons";

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
    <div className="flex h-screen overflow-hidden bg-[#f4f5f7]">
      <aside
        className={`relative flex h-full shrink-0 flex-col bg-yas-yellow text-neutral-800 transition-[width] duration-200 ${
          collapsed ? "w-[72px]" : "w-[220px]"
        }`}
      >
        <div className="flex h-12 items-center justify-between px-3">
          <Link href="/accueil" className="flex items-center">
            <img
              src="/logo-yas.svg"
              alt="Yas"
              width={36}
              height={32}
              className="h-8 w-auto object-contain"
            />
          </Link>
          <button
            type="button"
            aria-label={collapsed ? "Ouvrir le menu" : "Réduire le menu"}
            onClick={() => setCollapsed((value) => !value)}
            className="btn btn-ghost btn-xs text-neutral-700"
          >
            {collapsed ? <IconChevronsRight className="size-4" /> : <IconChevronsLeft className="size-4" />}
          </button>
        </div>

        <nav className="mt-2 flex flex-col gap-1 px-2">
          {NAV_ITEMS.map((item) => {
            const Icon = ICONS[item.icon];
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                title={item.label}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-yas-active text-white"
                    : "text-neutral-800 hover:bg-black/5"
                } ${collapsed ? "justify-center px-0" : ""}`}
              >
                <Icon className="size-[18px] shrink-0" />
                {!collapsed ? <span className="truncate">{item.label}</span> : null}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-12 shrink-0 items-center justify-end bg-yas-orange px-5">
          <div className="flex items-center gap-2 text-sm text-neutral-800">
            <span>aogbone</span>
            <span className="flex size-8 items-center justify-center rounded-full bg-neutral-900 text-white">
              <IconUser className="size-4" />
            </span>
          </div>
        </header>

        <div className="flex h-12 shrink-0 items-center gap-3 border-b border-black/5 bg-white px-6 text-sm">
          <Link href="/accueil" className="text-neutral-500 hover:text-neutral-800">
            Yas
          </Link>
          <span className="h-4 w-px bg-neutral-300" />
          <Link href="/accueil" aria-label="Accueil" className="text-neutral-500 hover:text-neutral-800">
            <IconHome className="size-4" />
          </Link>
          <Link href="/accueil" className="yas-link hover:underline">
            GetCallDetail
          </Link>
          {crumb ? (
            <>
              <span className="text-neutral-400">»</span>
              <Link href={crumb.href} className="text-neutral-600 hover:text-neutral-800">
                {crumb.label}
              </Link>
            </>
          ) : null}
        </div>

        <main className="min-h-0 flex-1 overflow-auto p-5">{children}</main>
      </div>
    </div>
  );
}
