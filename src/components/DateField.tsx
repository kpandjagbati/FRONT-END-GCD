"use client";

import { useId, useState } from "react";
import { IconCalendar } from "@/components/icons";
import { frenchDateToIso, isoToFrenchDate } from "@/lib/format-date";

export default function DateField({
  id,
  name,
  placeholder = "jj/mm/aaaa",
}: Readonly<{
  id?: string;
  name?: string;
  placeholder?: string;
}>) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const [display, setDisplay] = useState("");
  const iso = frenchDateToIso(display);

  return (
    <div className="flex items-center gap-2">
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
      <span className="relative flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-neutral-200 bg-white text-yas-navy hover:border-yas-navy hover:bg-[#eef4ff]">
        <IconCalendar className="pointer-events-none size-5" />
        <input
          type="date"
          aria-label="Ouvrir le calendrier"
          value={iso}
          onChange={(event) => setDisplay(isoToFrenchDate(event.target.value))}
          className="yas-date-picker absolute inset-0 cursor-pointer opacity-0"
        />
      </span>
    </div>
  );
}
