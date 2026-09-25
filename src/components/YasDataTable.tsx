"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";

const PAGE_SIZE = 10;

export type YasColumn<T> = {
  key: keyof T & string;
  label: string;
  className?: string;
  render?: (row: T) => ReactNode;
};

export default function YasDataTable<T extends { id: string }>({
  columns,
  rows,
  embedded = false,
  compact = false,
}: Readonly<{
  columns: YasColumn<T>[];
  rows: T[];
  embedded?: boolean;
  compact?: boolean;
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
  const cellPad = compact ? "px-3 py-2.5" : "px-5 py-3";

  return (
    <div
      className={
        embedded
          ? "overflow-hidden rounded-2xl border border-neutral-100 bg-white"
          : "overflow-hidden rounded-2xl bg-white shadow-[0_12px_32px_rgba(1,55,125,0.06)] sm:rounded-3xl"
      }
    >
      <div className="flex flex-col gap-3 px-3 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:px-5 sm:py-4">
        <div className="relative z-10 flex max-w-full items-center self-start overflow-hidden rounded-full border border-neutral-200 text-xs text-neutral-500 sm:text-sm">
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
          <span className="border-x border-neutral-200 px-3 py-1.5 whitespace-nowrap">
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
          className="h-9 w-full rounded-full border border-neutral-200 px-4 text-base outline-none placeholder:text-neutral-400 focus:border-yas-navy sm:max-w-[220px] sm:text-sm"
        />
      </div>

      <div className="-mx-1 overflow-x-auto overscroll-x-contain px-1">
        <table className={`min-w-full text-left ${compact ? "text-xs" : "text-sm"}`}>
          <thead>
            <tr className="border-t border-neutral-100 bg-[#f7f9fc]">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`whitespace-nowrap font-semibold uppercase tracking-wide text-neutral-400 ${
                    compact ? "px-3 py-2.5 text-[10px]" : "px-5 py-3"
                  }`}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 ? (
              <tr className="border-t border-neutral-100">
                <td colSpan={columns.length} className="px-5 py-8 text-center text-neutral-400">
                  Aucun résultat
                </td>
              </tr>
            ) : (
              visible.map((row) => (
                <tr key={row.id} className="border-t border-neutral-100 hover:bg-[#f7f9fc]/80">
                  {columns.map((column, index) => {
                    const raw = String(row[column.key] ?? "").trim();
                    return (
                      <td
                        key={column.key}
                        className={`${cellPad} ${column.className ?? "whitespace-nowrap"} ${
                          index === 0 ? "font-semibold text-neutral-800" : "text-neutral-600"
                        }`}
                      >
                        {column.render ? column.render(row) : raw || "—"}
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
