"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { IconChevronsDown, IconChevronsUp, IconClose, IconHistory } from "@/components/icons";
import { useIsClient } from "@/lib/use-client";
import {
  getRecentSearches,
  getRecentSearchesSnapshot,
  stagePrefill,
  subscribeRecentSearches,
  type RecentSearch,
} from "@/lib/recent-searches";

const MODULES: Record<string, string> = {
  appels: "Appels",
  identites: "Identités",
  mixx: "Mixx",
  identification: "Identification",
  ftth: "FTTH",
};

const CRITERIA: Record<string, string> = {
  numero: "Numéro",
  imei: "IMEI",
  imsi: "IMSI",
  appele: "Numéro appelé",
};

function searchedValue(item: RecentSearch) {
  const payload = item.payload;
  if (item.module === "identites") return [payload.nom, payload.prenoms].filter(Boolean).join(" ");
  return payload.query || payload.numero || payload.phone || payload.ligne || "";
}

function period(item: RecentSearch) {
  const { dateDebut, dateFin } = item.payload;
  if (!dateDebut && !dateFin) return "—";
  return `${dateDebut || "—"} → ${dateFin || "—"}`;
}

export default function RecentSearchesMenu() {
  const router = useRouter();
  const isClient = useIsClient();
  const [open, setOpen] = useState(false);
  const [listScrollDir, setListScrollDir] = useState<"down" | "up" | null>(null);
  const tableScrollRef = useRef<HTMLDivElement>(null);
  const recent = useSyncExternalStore(subscribeRecentSearches, getRecentSearches, getRecentSearchesSnapshot);
  const close = useCallback(() => setOpen(false), []);

  function updateListScrollDir() {
    const node = tableScrollRef.current;
    if (!node) {
      setListScrollDir(null);
      return;
    }
    const overflow = node.scrollHeight - node.clientHeight > 8;
    if (!overflow) {
      setListScrollDir(null);
      return;
    }
    const remaining = node.scrollHeight - node.scrollTop - node.clientHeight;
    setListScrollDir(remaining <= 8 ? "up" : "down");
  }

  function scrollRecentList() {
    const node = tableScrollRef.current;
    if (!node || !listScrollDir) return;
    const step = Math.max(160, node.clientHeight * 0.75);
    node.scrollBy({ top: listScrollDir === "up" ? -step : step, behavior: "smooth" });
  }

  useEffect(() => {
    if (!open) {
      setListScrollDir(null);
      return;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") close();
    }

    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, close]);

  useEffect(() => {
    if (!open) return;
    const node = tableScrollRef.current;
    if (!node) return;

    updateListScrollDir();
    node.addEventListener("scroll", updateListScrollDir, { passive: true });
    const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(updateListScrollDir) : null;
    observer?.observe(node);
    window.addEventListener("resize", updateListScrollDir);
    return () => {
      node.removeEventListener("scroll", updateListScrollDir);
      observer?.disconnect();
      window.removeEventListener("resize", updateListScrollDir);
    };
  }, [open, recent.length]);

  function openSearch(item: RecentSearch) {
    stagePrefill(item);
    setOpen(false);
    if (window.location.pathname !== item.href) router.push(item.href);
  }

  return (
    <>
      <button
        type="button"
        aria-label="Recherches récentes"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="flex size-10 items-center justify-center rounded-full border border-neutral-200 bg-white text-yas-navy shadow-sm transition hover:border-yas-navy"
      >
        <IconHistory className="size-5" />
      </button>

      {isClient && open
        ? createPortal(
            <div
              className="fixed inset-0 z-[95] flex items-end justify-center bg-[#01377d]/40 p-0 sm:items-center sm:p-4"
              onClick={close}
            >
              <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="recent-searches-title"
                className="relative flex h-[min(96dvh,64rem)] w-full max-w-7xl flex-col overflow-hidden rounded-t-3xl bg-white shadow-[0_28px_80px_rgba(1,55,125,0.22)] sm:rounded-3xl"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="shrink-0 px-4 pb-0 pt-4 sm:px-6 sm:pt-6">
                  <button
                    type="button"
                    aria-label="Fermer"
                    onClick={close}
                    className="absolute right-3 top-3 z-10 flex size-10 items-center justify-center rounded-full bg-white text-yas-navy hover:bg-neutral-100 sm:right-4 sm:top-4"
                  >
                    <IconClose className="size-5" />
                  </button>
                  <h2 id="recent-searches-title" className="pr-10 text-lg font-bold text-yas-navy sm:text-xl">
                    Dernières recherches
                  </h2>
                  <div className="mt-3 h-1.5 w-16 rounded-full bg-yas-yellow" />
                  <p className="mt-3 text-sm font-medium text-neutral-500">
                    {recent.length} recherche{recent.length > 1 ? "s" : ""} — cliquez une ligne pour la relancer.
                  </p>
                </div>

                <div className="relative mt-4 min-h-0 flex-1 px-4 sm:px-6">
                  {recent.length === 0 ? (
                    <p className="py-12 text-center text-sm font-medium text-neutral-500">
                      Aucune recherche pour le moment.
                    </p>
                  ) : (
                    <>
                      <div
                        ref={tableScrollRef}
                        className="h-full overflow-auto rounded-xl border border-neutral-100"
                      >
                        <table className="w-full min-w-[36rem] text-left text-sm">
                          <thead className="sticky top-0 z-[1] bg-yas-navy text-xs uppercase tracking-wide text-white">
                            <tr>
                              <th className="px-4 py-3 font-semibold">Module</th>
                              <th className="px-4 py-3 font-semibold">Critère</th>
                              <th className="px-4 py-3 font-semibold">Valeur</th>
                              <th className="px-4 py-3 font-semibold">Période</th>
                            </tr>
                          </thead>
                          <tbody>
                            {recent.map((item, index) => (
                              <tr
                                key={item.id}
                                onClick={() => openSearch(item)}
                                className={`cursor-pointer border-t border-neutral-100 ${
                                  index % 2 === 0 ? "bg-white" : "bg-[#f8fafc]"
                                } hover:bg-[#eef4ff]`}
                              >
                                <td className="px-4 py-3 font-bold text-yas-navy">
                                  {MODULES[item.module] ?? item.module}
                                </td>
                                <td className="px-4 py-3 font-medium text-neutral-600">
                                  {item.module === "appels"
                                    ? CRITERIA[item.payload.criteria] || "Numéro"
                                    : "—"}
                                </td>
                                <td className="px-4 py-3 font-bold text-yas-navy">
                                  {searchedValue(item) || "—"}
                                </td>
                                <td className="px-4 py-3 font-medium text-neutral-600">{period(item)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      {listScrollDir ? (
                        <button
                          type="button"
                          aria-label={listScrollDir === "up" ? "Remonter la liste" : "Défiler la liste"}
                          title={listScrollDir === "up" ? "Remonter la liste" : "Défiler la liste"}
                          onClick={scrollRecentList}
                          className="absolute bottom-3 right-7 z-[2] flex size-11 items-center justify-center rounded-full bg-yas-navy text-white shadow-[0_10px_24px_rgba(1,55,125,0.28)] hover:bg-[#012d66] sm:right-9"
                        >
                          {listScrollDir === "up" ? (
                            <IconChevronsUp className="size-5" />
                          ) : (
                            <IconChevronsDown className="size-5" />
                          )}
                        </button>
                      ) : null}
                    </>
                  )}
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
