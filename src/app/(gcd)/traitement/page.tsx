"use client";

import { useRef, useState } from "react";
import { IconClose, IconFile, IconWarning } from "@/components/icons";

const CSV_COLUMNS = ["type", "valeur", "date_debut", "date_fin"] as const;

const CSV_ROWS = [
  ["msisdn", "22892XXXXXX", "05/04/2022", "15/04/2022"],
  ["msisdn", "22890XXXXXX", "10/04/2022", "20/04/2022"],
  ["imei", "652XXXX123654X", "10/04/2022", "22/04/2022"],
  ["imsi", "123XXXX896354X", "11/04/2022", "22/04/2022"],
];

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

export default function TraitementPage() {
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function takeFile(next?: File) {
    if (!next) return;
    if (!next.name.toLowerCase().endsWith(".csv")) return;
    setFile(next);
  }

  return (
    <section className="flex min-h-0 flex-1 items-center justify-center overflow-hidden py-2">
      <div className="flex w-full max-w-5xl flex-col items-center gap-6 lg:flex-row lg:items-center lg:justify-center lg:gap-8">
        <div className="w-full max-w-xs shrink-0">
          <h1 className="text-xl font-bold text-yas-navy sm:text-2xl">Traitements</h1>
          <p className="mt-2 text-sm font-medium leading-relaxed text-neutral-600">
            Lancer un traitement CSV en masse.
          </p>
          <div className="mt-3 h-1.5 w-24 rounded-full bg-yas-yellow" />
          <img
            src="/illustrations/traitements.svg"
            alt=""
            className="mt-4 h-auto max-h-40 w-full object-contain"
          />
        </div>

        <div className="yas-bubbles w-full max-w-xl rounded-2xl bg-white p-4 shadow-[0_18px_50px_rgba(1,55,125,0.08)] sm:p-5">
          <div className="flex gap-3 rounded-2xl bg-[#fff6ea] px-3.5 py-3">
            <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl bg-yas-yellow text-yas-navy">
              <IconWarning className="size-4" />
            </span>
            <div className="min-w-0 text-left">
              <p className="text-sm font-bold text-yas-navy">Fichier CSV uniquement</p>
              <p className="mt-0.5 text-xs leading-relaxed text-neutral-600">
                Le fichier doit contenir exactement ces quatre colonnes :
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {CSV_COLUMNS.map((column) => (
                  <span
                    key={column}
                    className="rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold text-yas-navy shadow-[0_1px_0_rgba(1,55,125,0.06)]"
                  >
                    {column}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 overflow-hidden rounded-xl border border-neutral-100">
            <div className="flex items-center justify-between bg-[#f7f9fc] px-3 py-2">
              <p className="text-xs font-semibold text-yas-navy">Exemple de fichier</p>
              <span className="text-[11px] font-medium text-neutral-400">CSV</span>
            </div>
            <table className="w-full text-left text-xs">
              <thead className="bg-yas-navy text-white">
                <tr>
                  {CSV_COLUMNS.map((column) => (
                    <th key={column} className="px-3 py-2 font-semibold">
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {CSV_ROWS.map((row, index) => (
                  <tr
                    key={row.join("-")}
                    className={index % 2 === 0 ? "bg-white" : "bg-[#f7f9fc]"}
                  >
                    {row.map((cell) => (
                      <td key={cell} className="px-3 py-1.5 font-medium text-neutral-700">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <input
            ref={inputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={(event) => {
              takeFile(event.target.files?.[0]);
              event.target.value = "";
            }}
          />

          {file ? (
            <div className="mt-4 flex items-center gap-3 rounded-2xl border border-yas-navy/10 bg-[#eef4ff] px-3.5 py-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white text-yas-navy">
                <IconFile className="size-5" />
              </span>
              <div className="min-w-0 flex-1 text-left">
                <p className="truncate text-sm font-semibold text-yas-navy">{file.name}</p>
                <p className="text-xs text-neutral-500">{formatFileSize(file.size)} · prêt à traiter</p>
              </div>
              <button
                type="button"
                aria-label="Retirer le fichier"
                onClick={() => setFile(null)}
                className="flex size-8 items-center justify-center rounded-full text-neutral-400 transition hover:bg-white hover:text-yas-navy"
              >
                <IconClose className="size-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              onDragOver={(event) => {
                event.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(event) => {
                event.preventDefault();
                setDragOver(false);
                takeFile(event.dataTransfer.files?.[0]);
              }}
              className={`mt-4 flex w-full flex-col items-center rounded-2xl border-2 border-dashed px-4 py-5 transition ${
                dragOver
                  ? "border-yas-navy bg-[#eef4ff]"
                  : "border-yas-navy/15 bg-[#f7f9fc] hover:border-yas-navy/40 hover:bg-[#eef4ff]"
              }`}
            >
              <span className="flex size-11 items-center justify-center rounded-2xl bg-yas-yellow text-yas-navy">
                <IconFile className="size-5" />
              </span>
              <p className="mt-2 text-sm font-semibold text-yas-navy">Déposez votre fichier CSV</p>
              <p className="mt-0.5 text-xs text-neutral-500">ou cliquez pour parcourir</p>
            </button>
          )}

          <button
            type="button"
            disabled={!file}
            className="btn mt-4 h-10 min-h-10 w-full rounded-xl border-none bg-yas-navy px-5 font-semibold text-white hover:bg-[#012d66] disabled:bg-neutral-200 disabled:text-neutral-400"
          >
            Procéder au traitement
          </button>
        </div>
      </div>
    </section>
  );
}
