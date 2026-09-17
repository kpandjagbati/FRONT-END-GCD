"use client";

import { useState } from "react";
import {
  ExcelButton,
  PdfNavyButton,
  PdfRedButton,
  VoirButton,
  WordButton,
} from "@/components/ActionButtons";

const CRITERIA = [
  { id: "numero", label: "Numero" },
  { id: "imei", label: "IMEI" },
  { id: "imsi", label: "IMSI" },
  { id: "appele", label: "Numero appelé" },
] as const;

export default function AppelsPage() {
  const [criteria, setCriteria] = useState<(typeof CRITERIA)[number]["id"]>("numero");
  const fieldLabel = CRITERIA.find((item) => item.id === criteria)?.label ?? "Numero";

  return (
    <section className="rounded-sm bg-[#f3f4f6] p-4">
      <div className="relative rounded-sm border border-white bg-white px-8 pb-8 pt-10 shadow-sm">
        <div className="absolute -top-3 left-6 bg-[#f3f4f6] px-3 py-1 text-sm yas-link">
          Critères de recherche
        </div>

        <div className="mx-auto mb-8 flex max-w-4xl flex-wrap items-center justify-between gap-x-16 gap-y-4 px-1 text-sm text-neutral-800">
          {CRITERIA.map((item) => (
            <label key={item.id} className="flex cursor-pointer items-center gap-2.5 font-semibold">
              <input
                type="radio"
                name="criteria"
                className="yas-radio"
                checked={criteria === item.id}
                onChange={() => setCriteria(item.id)}
              />
              {item.label}
            </label>
          ))}
        </div>

        <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-3">
          <div>
            <label className="yas-label">
              {fieldLabel} <span className="text-red-500">*</span>
            </label>
            <input className="yas-input" />
          </div>
          <div>
            <label className="yas-label">
              Date début <span className="text-red-500">*</span>
            </label>
            <input type="text" placeholder="jj/mm/aaaa" className="yas-input" />
          </div>
          <div>
            <label className="yas-label">
              Date fin <span className="text-red-500">*</span>
            </label>
            <input type="text" placeholder="jj/mm/aaaa" className="yas-input" />
          </div>
        </div>

        <label className="mt-7 flex items-center gap-2.5 text-sm font-semibold text-neutral-600">
          <input type="checkbox" className="yas-check" />
          Veuillez Cocher la case si vous souhaitez recevoir les détails de la recherche par mail
        </label>

        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <VoirButton />
          <PdfRedButton />
          <PdfNavyButton />
          <ExcelButton />
          <WordButton />
        </div>
      </div>
    </section>
  );
}
