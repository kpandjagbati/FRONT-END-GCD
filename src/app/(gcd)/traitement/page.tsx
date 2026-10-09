/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { IconChevronsDown, IconChevronsUp, IconClose, IconFile, IconWarning } from "@/components/icons";
import { PdfRedButton } from "@/components/ActionButtons";
import YasLoadingOverlay from "@/components/YasLoadingOverlay";
import { saveBlob } from "@/lib/downloads";
import { bulkSearch, downloadFile } from "@/lib/gcd-api";
import { useIsClient } from "@/lib/use-client";

const CSV_COLUMNS = ["type", "valeur", "date_debut", "date_fin"] as const;

/** Aperçu visuel pour Arif. Passer à false quand l'API renverra les fichiers. */
const SHOW_TREATMENT_PREVIEW = true;

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

function isCsv(file: File) {
  const name = file.name.toLowerCase();
  return name.endsWith(".csv") || file.type === "text/csv";
}

type TreatmentJob = {
  id: string;
  type: string;
  valeur: string;
  dateDebut: string;
  status: "pending" | "ready";
  pdfFileName?: string;
  passwordFileName?: string;
};

const PREVIEW_JOBS: TreatmentJob[] = Array.from({ length: 24 }, (_, index) => {
  const row = CSV_ROWS[index % CSV_ROWS.length];
  return {
    id: `preview-${index}`,
    type: row[0],
    valeur: row[1],
    dateDebut: row[2],
    status: index === 0 ? ("ready" as const) : ("pending" as const),
    pdfFileName: `apercu-${index + 1}.pdf`,
    passwordFileName: `apercu-${index + 1}.txt`,
  };
});

const TYPE_LABELS: Record<string, string> = {
  msisdn: "MSISDN",
  imei: "IMEI",
  imsi: "IMSI",
};

function typeLabel(type: string) {
  return TYPE_LABELS[type.toLowerCase()] ?? type.toUpperCase();
}

function rowsFromCsv(text: string): TreatmentJob[] {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  if (lines.length < 2) return [];
  const header = lines[0].split(/[;,]/).map((cell) => cell.trim().toLowerCase().replace(/^\uFEFF/, ""));
  const typeIndex = header.indexOf("type");
  const valueIndex = header.findIndex((cell) => cell === "valeur" || cell === "value");
  const startIndex = header.findIndex((cell) => cell === "date_debut" || cell === "datedebut");
  if (typeIndex < 0) return [];
  return lines.slice(1).flatMap((line, index) => {
    const cells = line.split(/[;,]/).map((cell) => cell.trim());
    const type = cells[typeIndex]?.toLowerCase();
    if (!type) return [];
    return [
      {
        id: `${type}-${index}`,
        type,
        valeur: valueIndex >= 0 ? cells[valueIndex] ?? "" : "",
        dateDebut: startIndex >= 0 ? cells[startIndex] ?? "" : "",
        status: "pending" as const,
      },
    ];
  });
}

function textValue(record: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const found = Object.entries(record).find(([name]) => name.toLowerCase() === key.toLowerCase());
    if (!found || found[1] == null || typeof found[1] === "object") continue;
    const text = String(found[1]).trim();
    if (text) return text;
  }
  return "";
}

function readyFromResponse(data: unknown) {
  const ready = new Map<string, { pdfFileName: string; passwordFileName?: string }>();

  function visit(value: unknown) {
    if (Array.isArray(value)) {
      value.forEach(visit);
      return;
    }
    if (!value || typeof value !== "object") return;
    const record = value as Record<string, unknown>;
    const type = textValue(record, ["type", "searchType", "keywordSearchBy"]).toLowerCase();
    const valeur = textValue(record, ["valeur", "value", "searchValue"]);
    const pdfFileName = textValue(record, ["pdfFileName", "pdfName", "fileName", "filename"]);
    const passwordFileName = textValue(record, ["passwordFileName", "passwordFile", "txtFileName"]);
    if (type && pdfFileName.toLowerCase().endsWith(".pdf")) {
      ready.set(valeur ? `${type}|${valeur}` : type, {
        pdfFileName,
        passwordFileName: passwordFileName || undefined,
      });
    }
    Object.values(record).forEach(visit);
  }

  visit(data);
  return ready;
}

export default function TraitementPage() {
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState(false);
  const [loading, setLoading] = useState(false);
  const [jobs, setJobs] = useState<TreatmentJob[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [started, setStarted] = useState(false);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [listScrollDir, setListScrollDir] = useState<"down" | "up" | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const tableScrollRef = useRef<HTMLDivElement>(null);
  const isClient = useIsClient();

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(false), 10000);
    return () => window.clearTimeout(timer);
  }, [notice]);

  useEffect(() => {
    if (!previewOpen) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setPreviewOpen(false);
    }

    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [previewOpen]);

  function takeFile(next?: File) {
    setNotice(false);
    if (!next) return;
    if (!isCsv(next)) {
      setError("Seuls les fichiers .csv sont acceptés.");
      return;
    }
    setError(null);
    setJobs([]);
    setStarted(false);
    setPreviewOpen(false);
    setFile(next);
  }

  async function handleProceed() {
    if (!file || loading) return;
    setLoading(true);
    setNotice(false);
    setError(null);
    try {
      const rows = rowsFromCsv(await file.text());
      setJobs(rows);
      setStarted(true);
      const result = await bulkSearch(file);
      const ready = readyFromResponse(result);
      setJobs(
        rows.map((row) => {
          const done = ready.get(`${row.type}|${row.valeur}`) ?? ready.get(row.type);
          return done
            ? { ...row, status: "ready" as const, pdfFileName: done.pdfFileName, passwordFileName: done.passwordFileName }
            : row;
        }),
      );
      setNotice(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Le traitement n'a pas abouti.");
    } finally {
      setLoading(false);
    }
  }

  async function downloadTreatment(job: TreatmentJob) {
    if (!job.pdfFileName || downloading) return;
    setDownloading(job.id);
    setError(null);
    try {
      const body = { type: job.type, secureFile: true };
      const pdf = await downloadFile(job.pdfFileName, body);
      const passwordName = job.passwordFileName;
      const passwordFile = passwordName ? await downloadFile(passwordName, body) : null;
      saveBlob(job.pdfFileName, pdf);
      if (passwordName && passwordFile) {
        window.setTimeout(() => saveBlob(passwordName, passwordFile), 400);
      } else {
        setError("Le PDF est téléchargé, mais le serveur n'a pas renvoyé le fichier mot de passe.");
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Le téléchargement a échoué.");
    } finally {
      setDownloading(null);
    }
  }

  async function downloadAll(list: TreatmentJob[]) {
    const ready = list.filter((job) => job.status === "ready" && job.pdfFileName);
    if (ready.length === 0 || downloading) return;
    setDownloading("all");
    setError(null);
    try {
      for (let index = 0; index < ready.length; index += 1) {
        const job = ready[index];
        const body = { type: job.type, secureFile: true };
        const pdfName = job.pdfFileName;
        if (!pdfName) continue;
        const pdf = await downloadFile(pdfName, body);
        const passwordName = job.passwordFileName;
        const passwordFile = passwordName ? await downloadFile(passwordName, body) : null;
        window.setTimeout(() => saveBlob(pdfName, pdf), index * 800);
        if (passwordName && passwordFile) {
          window.setTimeout(() => saveBlob(passwordName, passwordFile), index * 800 + 400);
        }
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Le téléchargement a échoué.");
    } finally {
      setDownloading(null);
    }
  }

  const hasReadyFile = jobs.some((job) => job.status === "ready");
  const preview = SHOW_TREATMENT_PREVIEW && !hasReadyFile;
  const shown = preview ? (started ? PREVIEW_JOBS : []) : jobs;
  const allReady = shown.length > 0 && shown.every((job) => job.status === "ready");

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

  function scrollTreatmentList() {
    const node = tableScrollRef.current;
    if (!node || !listScrollDir) return;
    const step = Math.max(160, node.clientHeight * 0.75);
    node.scrollBy({ top: listScrollDir === "up" ? -step : step, behavior: "smooth" });
  }

  useEffect(() => {
    if (!previewOpen) {
      setListScrollDir(null);
      return;
    }
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
  }, [previewOpen, shown.length]);

  return (
    <section className="flex min-h-0 flex-1 items-center justify-center overflow-x-hidden overflow-y-auto py-2">
      <YasLoadingOverlay open={loading} />
      <div className="flex w-full max-w-5xl flex-col items-center gap-6 lg:flex-row lg:items-center lg:justify-center lg:gap-8">
        <div className="w-full min-w-0 max-w-xs shrink-0">
          <h1 className="text-xl font-bold text-yas-navy sm:text-2xl">Traitements</h1>
          <p className="mt-2 text-sm font-medium leading-relaxed text-neutral-600">
            Lancer un traitement CSV en masse.
          </p>
          <div className="mt-3 h-1.5 w-24 rounded-full bg-yas-yellow" />
          <img
            src="/illustrations/traitements.svg"
            alt=""
            className="mt-4 hidden h-auto max-h-40 w-full object-contain sm:block"
          />
        </div>

        <div className="yas-bubbles w-full min-w-0 max-w-xl rounded-2xl bg-white p-3 shadow-[0_18px_50px_rgba(1,55,125,0.08)] sm:p-5">
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

          <div className="mt-4 overflow-x-auto rounded-xl border border-neutral-100">
            <div className="flex items-center justify-between bg-[#f7f9fc] px-3 py-2">
              <p className="text-xs font-semibold text-yas-navy">Exemple de fichier</p>
              <span className="text-[11px] font-medium text-neutral-400">CSV</span>
            </div>
            <table className="w-full min-w-[28rem] text-left text-xs">
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
                onClick={() => {
                  setFile(null);
                  setJobs([]);
                  setStarted(false);
                  setPreviewOpen(false);
                  setNotice(false);
                  setError(null);
                }}
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

          {error ? <p className="mt-2 text-center text-xs font-semibold text-red-500">{error}</p> : null}

          <div className="mt-4 flex flex-col items-stretch gap-2.5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center sm:gap-3">
            <button
              type="button"
              disabled={!file || loading}
              onClick={handleProceed}
              className="btn h-10 min-h-10 w-full rounded-xl border-none bg-yas-navy px-5 text-sm font-semibold text-white hover:bg-[#012d66] disabled:bg-neutral-200 disabled:text-neutral-400 sm:w-auto"
            >
              Procéder au traitement
            </button>
            <button
              type="button"
              disabled={!started}
              onClick={() => {
                if (!started) return;
                setPreviewOpen(true);
              }}
              className={`btn h-10 min-h-10 w-full rounded-xl border-none px-5 text-sm font-semibold sm:w-auto ${
                started
                  ? "bg-yas-yellow text-yas-navy hover:bg-[#f0ce00]"
                  : "cursor-not-allowed bg-[#f7efb8] text-neutral-400"
              }`}
            >
              Aperçu du traitement
            </button>
          </div>
        </div>
      </div>
      {isClient && previewOpen
        ? createPortal(
            <div
              className="fixed inset-0 z-[95] flex items-end justify-center bg-[#01377d]/40 p-0 sm:items-center sm:p-4"
              onClick={() => setPreviewOpen(false)}
            >
              <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="traitement-preview-title"
                className="relative flex h-[min(92dvh,64rem)] w-full max-w-7xl flex-col overflow-hidden rounded-t-3xl bg-white pb-[env(safe-area-inset-bottom)] shadow-[0_28px_80px_rgba(1,55,125,0.22)] sm:h-[min(96dvh,64rem)] sm:rounded-3xl sm:pb-0"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="shrink-0 px-4 pb-0 pt-4 sm:px-6 sm:pt-6">
                  <button
                    type="button"
                    aria-label="Fermer"
                    onClick={() => setPreviewOpen(false)}
                    className="absolute right-3 top-3 z-10 flex size-10 items-center justify-center rounded-full bg-white text-yas-navy hover:bg-neutral-100 sm:right-4 sm:top-4"
                  >
                    <IconClose className="size-5" />
                  </button>
                  <h2 id="traitement-preview-title" className="pr-10 text-lg font-bold text-yas-navy sm:text-xl">
                    Aperçu du traitement
                  </h2>
                  <div className="mt-3 h-1.5 w-16 rounded-full bg-yas-yellow" />
                  <p className="mt-3 text-sm font-medium text-neutral-500">
                    {shown.length} ligne{shown.length > 1 ? "s" : ""} — faites défiler pour tout consulter.
                  </p>
                </div>

                <div className="relative mt-4 min-h-0 flex-1 px-4 sm:px-6">
                  <div
                    ref={tableScrollRef}
                    className="h-full overflow-auto rounded-xl border border-neutral-100"
                  >
                    <table className="w-full min-w-[30rem] text-left text-xs sm:min-w-[36rem] sm:text-sm">
                      <thead className="sticky top-0 z-[1] bg-yas-navy text-[10px] uppercase tracking-wide text-white sm:text-xs">
                        <tr>
                          <th className="px-2.5 py-2.5 font-semibold sm:px-4 sm:py-3">Type</th>
                          <th className="px-2.5 py-2.5 font-semibold sm:px-4 sm:py-3">Valeur</th>
                          <th className="px-2.5 py-2.5 font-semibold sm:px-4 sm:py-3">Date de début</th>
                          <th className="px-2.5 py-2.5 font-semibold sm:px-4 sm:py-3">PDF</th>
                        </tr>
                      </thead>
                      <tbody>
                        {shown.map((job) => (
                          <tr key={job.id} className="border-t border-neutral-100 bg-white">
                            <td className="px-2.5 py-2.5 font-semibold text-yas-navy sm:px-4 sm:py-3">
                              {typeLabel(job.type)}
                            </td>
                            <td className="px-2.5 py-2.5 text-neutral-700 sm:px-4 sm:py-3">
                              {job.valeur || "—"}
                            </td>
                            <td className="px-2.5 py-2.5 text-neutral-700 sm:px-4 sm:py-3">
                              {job.dateDebut || "—"}
                            </td>
                            <td className="px-2.5 py-2.5 sm:px-4 sm:py-3">
                              {job.status === "ready" ? (
                                <PdfRedButton
                                  disabled={!preview && downloading === job.id}
                                  loading={!preview && downloading === job.id}
                                  onClick={() => {
                                    if (preview) return;
                                    void downloadTreatment(job);
                                  }}
                                />
                              ) : (
                                <span className="text-xs font-semibold text-neutral-400">En cours</span>
                              )}
                            </td>
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
                      onClick={scrollTreatmentList}
                      className="absolute bottom-3 right-7 z-[2] flex size-11 items-center justify-center rounded-full bg-yas-navy text-white shadow-[0_10px_24px_rgba(1,55,125,0.28)] hover:bg-[#012d66] sm:right-9"
                    >
                      {listScrollDir === "up" ? (
                        <IconChevronsUp className="size-5" />
                      ) : (
                        <IconChevronsDown className="size-5" />
                      )}
                    </button>
                  ) : null}
                </div>

                <div className="shrink-0 border-t border-neutral-100 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 sm:px-6 sm:pb-5">
                  {allReady || preview ? (
                    <div className="flex justify-center">
                      <button
                        type="button"
                        disabled={!preview && downloading === "all"}
                        onClick={() => {
                          if (preview) return;
                          void downloadAll(shown);
                        }}
                        className="btn h-10 min-h-10 rounded-xl border-none bg-yas-navy px-5 font-semibold text-white hover:bg-[#012d66] disabled:bg-neutral-200 disabled:text-neutral-400"
                      >
                        Télécharger tout
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
      {isClient && notice
        ? createPortal(
            <aside className="yas-side-toast" role="status" aria-live="polite">
              <div className="relative rounded-2xl border border-[#1f7a46]/20 bg-[#e8f6ee] p-4 text-sm text-[#1f7a46] shadow-[0_18px_40px_rgba(31,122,70,0.18)]">
                <button
                  type="button"
                  aria-label="Fermer"
                  onClick={() => setNotice(false)}
                  className="absolute right-2 top-2 flex size-8 items-center justify-center rounded-full text-[#1f7a46]/70 hover:bg-black/5 hover:text-[#1f7a46]"
                >
                  <IconClose className="size-4" />
                </button>
                <p className="pr-8 font-bold">Fichier bien chargé !</p>
                <p className="mt-1.5 font-medium leading-relaxed">Le traitement est encore en cours.</p>
              </div>
            </aside>,
            document.body,
          )
        : null}
    </section>
  );
}
