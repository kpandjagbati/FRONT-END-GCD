"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";

const PAGE_SIZE = 10;

export type YasColumn<T> = {
  key: keyof T & string;
  label: string;
  className?: string;
  /** Met la valeur en avant (gras / navy). */
  emphasis?: boolean;
  align?: "left" | "right" | "center";
  render?: (row: T) => ReactNode;
};

export default function YasDataTable<T extends { id: string }>({
  columns,
  rows,
  embedded = false,
  compact = false,
  /** Force toutes les colonnes dans la largeur visible (pas de scroll horizontal). */
  fit = false,
}: Readonly<{
  columns: YasColumn<T>[];
  rows: T[];
  embedded?: boolean;
  compact?: boolean;
  fit?: boolean;
}>) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const rowsSignature = rows.map((row) => row.id).join("|");

  useEffect(() => {
    setQuery("");
    setPage(1);
  }, [rowsSignature]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return rows;
    return rows.filter((row) =>
      columns.some((column) => String(row[column.key]).toLowerCase().includes(needle)),
    );
  }, [columns, query, rows]);

  const total = filtered.length;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const start = total === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const end = Math.min(currentPage * PAGE_SIZE, total);
  const visible = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const tight = compact || fit;
  const cellPad = fit
    ? "px-1.5 py-2 sm:px-2"
    : tight
      ? "px-2.5 py-2 sm:px-3 sm:py-2.5"
      : "px-3 py-3 sm:px-5 sm:py-3.5";

  return (
    <div
      className={
        embedded
          ? "overflow-hidden rounded-2xl border border-neutral-100 bg-white"
          : "overflow-hidden rounded-2xl bg-white shadow-[0_12px_32px_rgba(1,55,125,0.06)] sm:rounded-3xl"
      }
    >
      <div className="flex flex-col gap-2.5 border-b border-neutral-100 bg-[#fbfcfe] px-2.5 py-2.5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-3 sm:px-5 sm:py-3.5">
        <div className="relative z-10 flex max-w-full items-center self-start overflow-hidden rounded-full border border-neutral-200 bg-white text-xs text-neutral-500 sm:text-sm">
          <button
            type="button"
            aria-label="Page précédente"
            onClick={() =>
              setPage((value) => {
                const count = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
                const current = Math.min(value, count);
                return current <= 1 ? count : current - 1;
              })
            }
            className="relative z-10 cursor-pointer select-none px-3 py-1.5 text-neutral-500 transition hover:bg-neutral-100 hover:text-yas-navy"
          >
            ‹
          </button>
          <span className="border-x border-neutral-200 px-3 py-1.5 whitespace-nowrap font-medium text-neutral-600">
            {start} - {end} sur {total}
          </span>
          <button
            type="button"
            aria-label="Page suivante"
            onClick={() =>
              setPage((value) => {
                const count = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
                const current = Math.min(value, count);
                return current >= count ? 1 : current + 1;
              })
            }
            className="relative z-10 cursor-pointer select-none px-3 py-1.5 text-neutral-500 transition hover:bg-neutral-100 hover:text-yas-navy"
          >
            ›
          </button>
        </div>
        <input
          type="search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setPage(1);
          }}
          placeholder="Rechercher..."
          className="h-9 w-full rounded-full border border-neutral-200 bg-white px-4 text-base outline-none placeholder:text-neutral-400 focus:border-yas-navy focus:shadow-[0_0_0_3px_rgba(1,55,125,0.08)] sm:max-w-[220px] sm:text-sm"
        />
      </div>

      <div className={fit ? "overflow-hidden" : "overflow-x-auto overscroll-x-contain [-webkit-overflow-scrolling:touch]"}>
        <table
          className={`w-full text-left ${
            fit
              ? "table-fixed text-[11px] sm:text-xs"
              : tight
                ? "min-w-full text-[11px] sm:text-xs"
                : "min-w-full text-xs sm:text-sm"
          }`}
        >
          <thead>
            <tr className="bg-yas-navy">
              {columns.map((column) => (
                <th
                  key={column.key}
                  title={column.label}
                  className={`font-semibold uppercase tracking-wide text-white/90 ${
                    fit
                      ? "truncate px-1.5 py-2 text-[9px] sm:px-2 sm:text-[10px]"
                      : tight
                        ? "whitespace-nowrap px-2.5 py-2 text-[9px] sm:px-3 sm:py-2.5 sm:text-[10px]"
                        : "whitespace-nowrap px-3 py-2.5 text-[10px] sm:px-5 sm:py-3 sm:text-[11px]"
                  } ${
                    column.align === "right"
                      ? "text-right"
                      : column.align === "center"
                        ? "text-center"
                        : "text-left"
                  }`}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-5 py-10 text-center text-sm font-medium text-neutral-400">
                  Aucun résultat
                </td>
              </tr>
            ) : (
              visible.map((row, rowIndex) => (
                <tr
                  key={row.id}
                  className={`border-t border-neutral-100 transition-colors hover:bg-[#eef4ff]/55 ${
                    rowIndex % 2 === 1 ? "bg-[#f8fafc]" : "bg-white"
                  }`}
                >
                  {columns.map((column) => {
                    const raw = String(row[column.key] ?? "").trim();
                    const emphasis = column.emphasis ?? false;
                    const content = column.render ? column.render(row) : raw || "—";
                    return (
                      <td
                        key={column.key}
                        title={typeof content === "string" || typeof content === "number" ? String(content) : raw || undefined}
                        className={`${cellPad} ${
                          column.className ??
                          (fit ? "truncate whitespace-nowrap" : "whitespace-nowrap")
                        } ${
                          emphasis
                            ? "font-bold text-yas-navy"
                            : "font-medium text-neutral-600"
                        } ${
                          column.align === "right"
                            ? "text-right"
                            : column.align === "center"
                              ? "text-center"
                              : "text-left"
                        }`}
                      >
                        {content}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
