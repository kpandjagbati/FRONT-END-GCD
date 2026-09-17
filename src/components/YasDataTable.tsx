"use client";

import { useEffect, useMemo, useState } from "react";

const PAGE_SIZE = 10;

export type YasColumn<T> = {
  key: keyof T & string;
  label: string;
};

export default function YasDataTable<T extends { id: string }>({
  columns,
  rows,
  embedded = false,
}: {
  columns: YasColumn<T>[];
  rows: T[];
  embedded?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    setQuery("");
    setPage(1);
  }, [rows]);

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

  return (
    <div
      className={
        embedded
          ? "overflow-hidden rounded-2xl border border-neutral-100 bg-white"
          : "overflow-hidden rounded-3xl bg-white shadow-[0_12px_32px_rgba(1,55,125,0.06)]"
      }
    >
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
        <div className="flex items-center overflow-hidden rounded-full border border-neutral-200 text-sm text-neutral-500">
          <button
            type="button"
            aria-label="Page précédente"
            disabled={currentPage <= 1}
            onClick={() => setPage((value) => Math.max(1, value - 1))}
            className="px-3 py-1.5 disabled:opacity-30"
          >
            ‹
          </button>
          <span className="border-x border-neutral-200 px-3 py-1.5 whitespace-nowrap">
            {start} - {end} sur {total}
          </span>
          <button
            type="button"
            aria-label="Page suivante"
            disabled={currentPage >= pageCount || total === 0}
            onClick={() => setPage((value) => Math.min(pageCount, value + 1))}
            className="px-3 py-1.5 disabled:opacity-30"
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
          className="h-9 w-full max-w-[220px] rounded-full border border-neutral-200 px-4 text-sm outline-none placeholder:text-neutral-400 focus:border-yas-navy"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-t border-neutral-100">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="whitespace-nowrap px-5 py-3 font-medium text-neutral-400"
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
                <tr key={row.id} className="border-t border-neutral-100">
                  {columns.map((column, index) => (
                    <td
                      key={column.key}
                      className={`whitespace-nowrap px-5 py-3 ${
                        index === 0 ? "font-semibold text-neutral-800" : "text-neutral-500"
                      }`}
                    >
                      {String(row[column.key])}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
