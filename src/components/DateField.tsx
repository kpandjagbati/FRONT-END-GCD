"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  IconCalendar,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
} from "@/components/icons";
import { frenchDateToIso, isoToFrenchDate } from "@/lib/format-date";
import { useIsClient } from "@/lib/use-client";

const WEEKDAYS = ["Lu", "Ma", "Me", "Je", "Ve", "Sa", "Di"];
const MONTHS = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
];

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function toIso(year: number, month: number, day: number) {
  return `${year}-${pad(month + 1)}-${pad(day)}`;
}

function parseIso(iso: string) {
  const match = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  return { year: Number(match[1]), month: Number(match[2]) - 1, day: Number(match[3]) };
}

function isSameDay(iso: string, year: number, month: number, day: number) {
  return iso === toIso(year, month, day);
}

type Cell = {
  day: number;
  month: number;
  year: number;
  current: boolean;
};

function monthCells(year: number, month: number): Cell[] {
  const startOffset = (new Date(year, month, 1).getDay() + 6) % 7;
  const count = new Date(year, month + 1, 0).getDate();
  const total = Math.ceil((startOffset + count) / 7) * 7;
  const cells: Cell[] = [];

  for (let index = 0; index < total; index += 1) {
    const date = new Date(year, month, 1 - startOffset + index);
    cells.push({
      day: date.getDate(),
      month: date.getMonth(),
      year: date.getFullYear(),
      current: date.getMonth() === month && date.getFullYear() === year,
    });
  }
  return cells;
}

export default function DateField({
  id,
  name,
  placeholder = "jj/mm/aaaa",
  value,
  onChange,
}: Readonly<{
  id?: string;
  name?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
}>) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const isClient = useIsClient();
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [internal, setInternal] = useState("");
  const display = value ?? internal;

  function setDisplay(next: string) {
    if (value === undefined) setInternal(next);
    onChange?.(next);
  }
  const [open, setOpen] = useState(false);
  const [cursor, setCursor] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 300 });

  const iso = frenchDateToIso(display);
  const todayIso = useMemo(() => {
    const now = new Date();
    return toIso(now.getFullYear(), now.getMonth(), now.getDate());
  }, []);
  const cells = useMemo(() => monthCells(cursor.year, cursor.month), [cursor.month, cursor.year]);

  function placePanel() {
    const anchor = buttonRef.current;
    if (!anchor) return;
    const rect = anchor.getBoundingClientRect();
    const width = Math.min(300, window.innerWidth - 24);
    let left = rect.right - width;
    if (left < 12) left = 12;
    if (left + width > window.innerWidth - 12) left = Math.max(12, window.innerWidth - width - 12);
    const estimatedHeight = 372;
    let top = rect.bottom + 8;
    if (top + estimatedHeight > window.innerHeight - 12) {
      top = rect.top - estimatedHeight - 8;
    }
    if (top < 12) top = 12;
    setCoords({ top, left, width });
  }

  function openCalendar() {
    const selected = parseIso(iso);
    const now = new Date();
    setCursor(
      selected
        ? { year: selected.year, month: selected.month }
        : { year: now.getFullYear(), month: now.getMonth() },
    );
    setOpen(true);
  }

  function pick(year: number, month: number, day: number) {
    setDisplay(isoToFrenchDate(toIso(year, month, day)));
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    placePanel();

    function onPointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (rootRef.current?.contains(target) || panelRef.current?.contains(target)) return;
      setOpen(false);
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    function onReposition() {
      placePanel();
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", onReposition);
    window.addEventListener("scroll", onReposition, true);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", onReposition);
      window.removeEventListener("scroll", onReposition, true);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="flex items-center gap-2">
      <input
        id={inputId}
        name={name}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        placeholder={placeholder}
        value={display}
        onChange={(event) => setDisplay(event.target.value)}
        className="yas-input min-w-0 flex-1"
      />
      <button
        ref={buttonRef}
        type="button"
        aria-label="Ouvrir le calendrier"
        aria-expanded={open}
        onClick={() => (open ? setOpen(false) : openCalendar())}
        className={`flex size-11 shrink-0 items-center justify-center rounded-xl border bg-white text-yas-navy transition ${
          open
            ? "border-yas-navy bg-[#eef4ff]"
            : "border-neutral-200 hover:border-yas-navy hover:bg-[#eef4ff]"
        }`}
      >
        <IconCalendar className="size-5" />
      </button>

      {isClient && open
        ? createPortal(
            <div
              ref={panelRef}
              role="dialog"
              aria-label="Choisir une date"
              className="fixed z-[90] overflow-hidden rounded-2xl bg-white shadow-[0_24px_50px_rgba(1,55,125,0.22)] ring-1 ring-black/5"
              style={{ top: coords.top, left: coords.left, width: coords.width }}
            >
              <div className="flex items-center justify-between bg-yas-navy px-2.5 py-2.5 text-white">
                <div className="flex items-center">
                  <button
                    type="button"
                    aria-label="Année précédente"
                    onClick={() => setCursor((value) => ({ ...value, year: value.year - 1 }))}
                    className="flex size-8 items-center justify-center rounded-lg text-white/80 hover:bg-white/10 hover:text-white"
                  >
                    <IconChevronsLeft className="size-4" />
                  </button>
                  <button
                    type="button"
                    aria-label="Mois précédent"
                    onClick={() =>
                      setCursor((value) =>
                        value.month === 0
                          ? { year: value.year - 1, month: 11 }
                          : { year: value.year, month: value.month - 1 },
                      )
                    }
                    className="flex size-8 items-center justify-center rounded-lg text-white/80 hover:bg-white/10 hover:text-white"
                  >
                    <IconChevronLeft className="size-4" />
                  </button>
                </div>
                <p className="min-w-0 truncate text-sm font-bold">
                  {MONTHS[cursor.month]} {cursor.year}
                </p>
                <div className="flex items-center">
                  <button
                    type="button"
                    aria-label="Mois suivant"
                    onClick={() =>
                      setCursor((value) =>
                        value.month === 11
                          ? { year: value.year + 1, month: 0 }
                          : { year: value.year, month: value.month + 1 },
                      )
                    }
                    className="flex size-8 items-center justify-center rounded-lg text-white/80 hover:bg-white/10 hover:text-white"
                  >
                    <IconChevronRight className="size-4" />
                  </button>
                  <button
                    type="button"
                    aria-label="Année suivante"
                    onClick={() => setCursor((value) => ({ ...value, year: value.year + 1 }))}
                    className="flex size-8 items-center justify-center rounded-lg text-white/80 hover:bg-white/10 hover:text-white"
                  >
                    <IconChevronsRight className="size-4" />
                  </button>
                </div>
              </div>
              <div className="h-1 bg-yas-yellow" />

              <div className="p-3">
                <div className="grid grid-cols-7 text-center text-[11px] font-semibold uppercase tracking-wide text-neutral-400">
                  {WEEKDAYS.map((day) => (
                    <span key={day} className="py-1">
                      {day}
                    </span>
                  ))}
                </div>
                <div className="mt-1 grid grid-cols-7 gap-y-1 text-center">
                  {cells.map((cell) => {
                    const value = toIso(cell.year, cell.month, cell.day);
                    const selected = Boolean(iso) && isSameDay(iso, cell.year, cell.month, cell.day);
                    const today = isSameDay(todayIso, cell.year, cell.month, cell.day);
                    return (
                      <button
                        key={value + String(cell.current)}
                        type="button"
                        onClick={() => pick(cell.year, cell.month, cell.day)}
                        className={`mx-auto flex size-9 items-center justify-center rounded-full text-sm font-semibold transition ${
                          selected
                            ? "bg-yas-navy text-white"
                            : today
                              ? "bg-yas-yellow text-yas-navy"
                              : cell.current
                                ? "text-neutral-700 hover:bg-[#eef4ff] hover:text-yas-navy"
                                : "text-neutral-300 hover:bg-neutral-50"
                        }`}
                      >
                        {cell.day}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-3 flex items-center justify-between gap-2 border-t border-neutral-100 pt-3">
                  <button
                    type="button"
                    onClick={() => {
                      setDisplay("");
                      setOpen(false);
                    }}
                    className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-neutral-500 hover:bg-neutral-50 hover:text-yas-navy"
                  >
                    Effacer
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const now = new Date();
                      pick(now.getFullYear(), now.getMonth(), now.getDate());
                    }}
                    className="rounded-lg bg-yas-yellow px-3 py-1.5 text-xs font-bold text-yas-navy hover:bg-[#f0ce00]"
                  >
                    Aujourd’hui
                  </button>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
