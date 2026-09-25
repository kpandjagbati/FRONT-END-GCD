"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import ProfileMenu from "@/components/ProfileMenu";
import { FileDownloadNotice, FileDownloadProvider } from "@/components/FileDownload";
import { BREADCRUMBS, NAV_ITEMS } from "@/lib/nav";
import {
  IconChevronsLeft,
  IconChevronsRight,
  IconClose,
  IconDollar,
  IconFile,
  IconHome,
  IconLogin,
  IconLogout,
  IconMenu,
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

export default function AppShell({ children }: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const crumb = BREADCRUMBS[pathname];

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setMobileOpen(false);
    }

    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileOpen]);

  return (
    <FileDownloadProvider>
    <div className="flex h-dvh overflow-hidden bg-yas-page pt-[env(safe-area-inset-top)]">
      {mobileOpen ? (
        <button
          type="button"
          aria-label="Fermer le menu"
          className="fixed inset-0 z-40 bg-[#01377d]/40 backdrop-blur-[2px] lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-full w-[min(248px,86vw)] shrink-0 flex-col bg-yas-yellow text-yas-navy shadow-[12px_0_32px_rgba(1,55,125,0.16)] transition-transform duration-200 dark:!bg-[#01275a] dark:text-yas-yellow lg:relative lg:z-auto lg:shadow-none ${
          collapsed ? "lg:w-[84px]" : "lg:w-[248px]"
        } ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
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
            <span className={`min-w-0 ${collapsed ? "lg:hidden" : ""}`}>
              <span className="block truncate text-sm font-bold leading-none">GetCallDetail</span>
              <span className="mt-1 block truncate text-[11px] font-medium text-yas-navy/70 dark:text-yas-yellow/70">
                Yas Togo
              </span>
            </span>
          </Link>
          <button
            type="button"
            aria-label="Fermer le menu"
            onClick={() => setMobileOpen(false)}
            className="inline-flex size-8 shrink-0 items-center justify-center rounded-full border-0 bg-white text-yas-navy shadow-[0_4px_12px_rgba(1,55,125,0.16)] outline-none transition hover:bg-yas-navy hover:text-white focus-visible:bg-yas-navy focus-visible:text-white dark:hover:!bg-[#fcd90b] dark:hover:!text-yas-navy lg:hidden"
          >
            <IconClose className="size-4" />
          </button>
          <button
            type="button"
            aria-label={collapsed ? "Ouvrir le menu" : "Réduire le menu"}
            onClick={() => setCollapsed((value) => !value)}
            className="hidden size-8 shrink-0 items-center justify-center rounded-full border-0 bg-white text-yas-navy shadow-[0_4px_12px_rgba(1,55,125,0.16)] outline-none transition hover:bg-yas-navy hover:text-white focus-visible:bg-yas-navy focus-visible:text-white dark:hover:!bg-[#fcd90b] dark:hover:!text-yas-navy lg:inline-flex"
          >
            {collapsed ? <IconChevronsRight className="size-4" /> : <IconChevronsLeft className="size-4" />}
          </button>
        </div>

        <nav className="mt-3 flex flex-1 flex-col gap-1.5 overflow-y-auto px-2.5 pb-[max(1rem,env(safe-area-inset-bottom))]">
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
                  active ? "bg-white text-yas-navy dark:text-yas-navy" : "text-yas-navy/85 hover:bg-black/5 dark:text-yas-yellow/85 dark:hover:bg-white/10"
                } ${collapsed ? "lg:justify-center lg:px-0" : ""}`}
              >
                {isMixx ? (
                  <img
                    src="/logo-mixx.svg"
                    alt="Mixx by Yas"
                    className={`mixx-nav-logo h-6 w-auto object-contain object-left ${
                      collapsed ? "max-w-[150px] lg:max-w-[48px]" : "max-w-[150px]"
                    }`}
                  />
                ) : (
                  <Icon className="size-[18px] shrink-0" />
                )}
                {!isMixx ? (
                  <span className={`truncate ${collapsed ? "lg:hidden" : ""}`}>{item.label}</span>
                ) : null}
              </Link>
            );
          })}
          <button
            type="button"
            title="Se déconnecter"
            onClick={logoutSession}
            className={`mt-3 flex items-center gap-3 rounded-xl bg-yas-navy px-3 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[#012d66] dark:!bg-[#fcd90b] dark:!text-yas-navy dark:hover:!bg-[#f0ce00] ${
              collapsed ? "lg:justify-center lg:px-0" : ""
            }`}
          >
            <IconLogout className="size-[18px] shrink-0" />
            <span className={`truncate ${collapsed ? "lg:hidden" : ""}`}>Se déconnecter</span>
          </button>
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="yas-topbar relative z-30 flex h-14 shrink-0 items-center justify-between gap-2 border-b border-black/5 bg-yas-surface px-3 shadow-[0_8px_24px_rgba(1,55,125,0.04)] sm:h-16 sm:px-6">
          <div className="flex min-w-0 items-center gap-2 text-sm sm:gap-3">
            <button
              type="button"
              aria-label="Ouvrir le menu"
              onClick={() => setMobileOpen(true)}
              className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl text-yas-navy lg:hidden"
            >
              <IconMenu className="size-5" />
            </button>
            <Link href="/accueil" className="hidden font-semibold text-yas-navy hover:text-yas-blue sm:inline">
              Yas
            </Link>
            <span className="hidden h-4 w-px bg-neutral-200 sm:block" />
            <Link href="/accueil" aria-label="Accueil" className="hidden text-neutral-400 hover:text-yas-navy sm:inline">
              <IconHome className="size-4" />
            </Link>
            <Link href="/accueil" className="yas-link hidden hover:underline md:inline">
              GetCallDetail
            </Link>
            {crumb ? (
              <>
                <span className="hidden text-neutral-300 md:inline">/</span>
                <Link href={crumb.href} className="truncate font-semibold text-neutral-700 hover:text-yas-navy">
                  {crumb.label}
                </Link>
              </>
            ) : null}
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <ProfileMenu />
          </div>
        </header>

        <main className="yas-content flex min-h-0 flex-1 flex-col overflow-x-hidden overflow-y-auto p-3 sm:p-6">
          {children}
        </main>

        <footer className="shrink-0 border-t border-black/5 bg-white px-3 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] text-center sm:px-6">
          <p className="text-[11px] font-medium text-neutral-500">© 2026 Yas Togo · GetCallDetail</p>
        </footer>
      </div>
    </div>
    <FileDownloadNotice />
    </FileDownloadProvider>
  );
}
