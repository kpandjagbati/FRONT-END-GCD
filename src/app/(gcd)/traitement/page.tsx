/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { IconChevronsDown, IconChevronsUp, IconClose, IconFile, IconWarning } from "@/components/icons";
import { PdfRedButton } from "@/components/ActionButtons";
import YasLoadingOverlay from "@/components/YasLoadingOverlay";
import { saveBlob } from "@/lib/downloads";
import {
  bulkSearch,
  clearBulkZipCache,
  downloadBulkSearch,
  downloadBulkSearchItem,
  extractBulkJobId,
  getBulkSearch,
  isBulkSearchComplete,
  parseBulkSearchItems,
  readPasswordFromBlob,
} from "@/lib/gcd-api";
import { frenchDateToIso } from "@/lib/format-date";
import { useIsClient } from "@/lib/use-client";

const CSV_COLUMNS = ["type", "valeur", "date_debut", "date_fin"] as const;
const TREATMENT_PAGE_SIZE = 10;

/** Aperçu mock désactivé : API bulk-search/v2 branchée. */
const SHOW_TREATMENT_PREVIEW = false;

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
  itemId: string;
  type: string;
  valeur: string;
  dateDebut: string;
  status: "pending" | "ready" | "error";
  fileName?: string;
  passwordFileName?: string;
};

const PREVIEW_JOBS: TreatmentJob[] = Array.from({ length: 24 }, (_, index) => {
  const row = CSV_ROWS[index % CSV_ROWS.length];
  return {
    id: `preview-${index}`,
    itemId: `preview-${index}`,
    type: row[0],
    valeur: row[1],
    dateDebut: row[2],
    status: index === 0 ? ("ready" as const) : ("pending" as const),
    fileName: `apercu-${index + 1}.pdf`,
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

function statusLabel(status: TreatmentJob["status"]) {
  if (status === "ready") return "Terminé";
  if (status === "error") return "Erreur";
  return "En cours";
}

function statusClassName(status: TreatmentJob["status"]) {
  if (status === "ready") return "text-[#1f7a46]";
  if (status === "error") return "text-red-500";
  return "text-amber-600";
}

function csvDelimiter(headerLine: string) {
  return headerLine.includes(";") && headerLine.split(";").length >= headerLine.split(",").length ? ";" : ",";
}

/** Normalise date_debut / date_fin en YYYY-MM-DD (format API). */
function normalizeCsvForUpload(text: string) {
  const lines = text
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  if (lines.length < 2) return text;
  const delimiter = csvDelimiter(lines[0]);
  const header = lines[0].split(delimiter).map((cell) => cell.trim().toLowerCase());
  const startIndex = header.findIndex((cell) => cell === "date_debut" || cell === "datedebut");
  const endIndex = header.findIndex((cell) => cell === "date_fin" || cell === "datefin");
  if (startIndex < 0 && endIndex < 0) return text;

  const normalized = [lines[0]];
  for (const line of lines.slice(1)) {
    const cells = line.split(delimiter).map((cell) => cell.trim());
    for (const index of [startIndex, endIndex]) {
      if (index < 0 || !cells[index]) continue;
      const iso = frenchDateToIso(cells[index]) || cells[index];
      cells[index] = iso;
    }
    normalized.push(cells.join(delimiter));
  }
  return `${normalized.join("\n")}\n`;
}

function rowsFromCsv(text: string): TreatmentJob[] {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  if (lines.length < 2) return [];
  const delimiter = csvDelimiter(lines[0]);
  const header = lines[0].split(delimiter).map((cell) => cell.trim().toLowerCase().replace(/^\uFEFF/, ""));
  const typeIndex = header.indexOf("type");
  const valueIndex = header.findIndex((cell) => cell === "valeur" || cell === "value");
  const startIndex = header.findIndex((cell) => cell === "date_debut" || cell === "datedebut");
  if (typeIndex < 0) return [];
  return lines.slice(1).flatMap((line, index) => {
    const cells = line.split(delimiter).map((cell) => cell.trim());
    const type = cells[typeIndex]?.toLowerCase();
    if (!type) return [];
    const rawDate = startIndex >= 0 ? cells[startIndex] ?? "" : "";
    return [
      {
        id: `${type}-${index}`,
        itemId: "",
        type,
        valeur: valueIndex >= 0 ? cells[valueIndex] ?? "" : "",
        dateDebut: frenchDateToIso(rawDate) || rawDate,
        status: "pending" as const,
      },
    ];
  });
}

function jobsFromBulk(data: unknown, fallback: TreatmentJob[]): TreatmentJob[] {
  const items = parseBulkSearchItems(data);
  if (items.length === 0) return fallback;
  return items.map((item, index) => {
    const base = fallback[index];
    const fileName = item.fileName || base?.fileName;
    return {
      id: `item-${item.itemId}`,
      itemId: item.itemId,
      type: item.type || base?.type || "",
      valeur: item.valeur || base?.valeur || "",
      dateDebut: item.dateDebut || base?.dateDebut || "",
      status: item.status,
      fileName,
      passwordFileName: item.passwordFileName || base?.passwordFileName,
    };
  });
}

async function waitForBulkSearch(jobId: string, onUpdate: (data: unknown) => void) {
  // ~12 min : une recherche masse (3 lignes) peut prendre 4–5 min côté API Yas.
  const maxAttempts = 240;
  const intervalMs = 3000;
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const data = await getBulkSearch(jobId);
    onUpdate(data);
    if (isBulkSearchComplete(data)) return data;
    await new Promise((resolve) => window.setTimeout(resolve, intervalMs));
  }
  throw new Error(
    "Le traitement prend plus de temps que prévu. Réessayez dans quelques instants, ou vérifiez le statut dans Postman.",
  );
}

export default function TraitementPage() {
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState(false);
  const [loading, setLoading] = useState(false);
  const [jobs, setJobs] = useState<TreatmentJob[]>([]);
  const [bulkJobId, setBulkJobId] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [started, setStarted] = useState(false);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [passwordOffer, setPasswordOffer] = useState<{
    filename: string;
    blob: Blob;
    password?: string;
  } | null>(null);
  const [listScrollDir, setListScrollDir] = useState<"down" | "up" | null>(null);
  const [listPage, setListPage] = useState(1);
  const inputRef = useRef<HTMLInputElement>(null);
  const tableScrollRef = useRef<HTMLDivElement>(null);
  const isClient = useIsClient();

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(false), 10000);
    return () => window.clearTimeout(timer);
  }, [notice]);

  useEffect(() => {
    if (!passwordOffer) return;
    const timer = window.setTimeout(() => setPasswordOffer(null), 30000);
    return () => window.clearTimeout(timer);
  }, [passwordOffer]);

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
    setBulkJobId(null);
    setStarted(false);
    setPreviewOpen(false);
    setListPage(1);
    setFile(next);
  }

  async function handleProceed() {
    if (!file || loading) return;
    setLoading(true);
    setNotice(false);
    setError(null);
    try {
      const originalText = await file.text();
      const uploadText = normalizeCsvForUpload(originalText);
      const rows = rowsFromCsv(uploadText);
      if (rows.length === 0) {
        throw new Error("Le CSV ne contient aucune ligne valide (colonnes type, valeur, dates).");
      }
      setJobs(rows);
      setStarted(true);
      setListPage(1);
      setBulkJobId(null);
      const uploadFile = new File([uploadText], file.name, { type: "text/csv" });
      const created = await bulkSearch(uploadFile);
      const jobId = extractBulkJobId(created);
      if (!jobId) {
        // Certains backends renvoient déjà le détail dans la création.
        const immediate = jobsFromBulk(created, rows);
        if (immediate.some((job) => job.status === "ready")) {
          setJobs(immediate);
          setNotice(true);
          return;
        }
        throw new Error("Le serveur n'a pas renvoyé l'identifiant du traitement.");
      }
      clearBulkZipCache();
      setBulkJobId(jobId);
      setNotice(true);
      setPreviewOpen(true);
      // L'upload est accepté : on laisse voir la progression pendant le polling.
      setLoading(false);
      const finalData = await waitForBulkSearch(jobId, (data) => {
        setJobs(jobsFromBulk(data, rows));
      });
      setJobs(jobsFromBulk(finalData, rows));
      setPreviewOpen(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Le traitement n'a pas abouti.");
    } finally {
      setLoading(false);
    }
  }

  async function downloadTreatment(job: TreatmentJob) {
    if (!bulkJobId || job.status !== "ready" || !job.itemId || downloading) return;
    setDownloading(job.id);
    setError(null);
    try {
      // Arif : ?file=document puis ?file=password
      const document = await downloadBulkSearchItem(bulkJobId, job.itemId, "document");
      const pdfName =
        (job.fileName && /\.pdf$/i.test(job.fileName) ? job.fileName : "") ||
        (document.filename && /\.pdf$/i.test(document.filename) ? document.filename : "") ||
        `traitement-${job.itemId}.pdf`;

      let passwordFile: Blob | null = null;
      let passwordFileName = job.passwordFileName || "";
      try {
        const password = await downloadBulkSearchItem(bulkJobId, job.itemId, "password");
        if (password.blob.size > 0) {
          passwordFile = password.blob;
          passwordFileName =
            (password.filename && /\.txt$/i.test(password.filename) ? password.filename : "") ||
            passwordFileName ||
            `Password-${job.valeur || job.itemId}.txt`;
        }
      } catch {
        passwordFile = null;
      }

      saveBlob(pdfName, document.blob);
      if (passwordFile && passwordFile.size > 0) {
        const pwdName = passwordFileName || "password.txt";
        saveBlob(pwdName, passwordFile);
        const secret = await readPasswordFromBlob(passwordFile);
        setPasswordOffer({ filename: pwdName, blob: passwordFile, password: secret || undefined });
      } else {
        setPasswordOffer(null);
        setError("Le PDF est téléchargé, mais le serveur n'a pas renvoyé le fichier mot de passe.");
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Le téléchargement a échoué.");
    } finally {
      setDownloading(null);
    }
  }

  async function downloadAllAsZip(list: TreatmentJob[]) {
    if (!bulkJobId || downloading) return;
    const ready = list.filter((job) => job.status === "ready" && job.itemId);
    if (ready.length === 0) return;
    setDownloading("all-zip");
    setError(null);
    try {
      clearBulkZipCache(bulkJobId);
      const { blob, filename } = await downloadBulkSearch(bulkJobId);
      saveBlob(filename || "traitements-bulk.zip", blob);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Le téléchargement ZIP a échoué.");
    } finally {
      setDownloading(null);
    }
  }

  /** PDF + .txt un par un (pas de ZIP), via ?file=document|password. */
  async function downloadAllAsFiles(list: TreatmentJob[]) {
    if (!bulkJobId || downloading) return;
    const ready = list.filter((job) => job.status === "ready" && job.itemId);
    if (ready.length === 0) return;
    setDownloading("all-files");
    setError(null);
    try {
      for (let index = 0; index < ready.length; index += 1) {
        const job = ready[index];
        const document = await downloadBulkSearchItem(bulkJobId, job.itemId, "document");
        const pdfName =
          (job.fileName && /\.pdf$/i.test(job.fileName) ? job.fileName : "") ||
          (document.filename && /\.pdf$/i.test(document.filename) ? document.filename : "") ||
          `traitement-${job.itemId}.pdf`;

        saveBlob(pdfName, document.blob);

        try {
          const password = await downloadBulkSearchItem(bulkJobId, job.itemId, "password");
          if (password.blob.size > 0) {
            const pwdName =
              (password.filename && /\.txt$/i.test(password.filename) ? password.filename : "") ||
              job.passwordFileName ||
              `Password-${job.valeur || job.itemId}.txt`;
            await new Promise((resolve) => window.setTimeout(resolve, 350));
            saveBlob(pwdName, password.blob);
          }
        } catch {
          // PDF déjà sauvé
        }

        if (index < ready.length - 1) {
          await new Promise((resolve) => window.setTimeout(resolve, 500));
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
  const pageCount = Math.max(1, Math.ceil(shown.length / TREATMENT_PAGE_SIZE));
  const currentPage = Math.min(listPage, pageCount);
  const pageStart = shown.length === 0 ? 0 : (currentPage - 1) * TREATMENT_PAGE_SIZE + 1;
  const pageEnd = Math.min(currentPage * TREATMENT_PAGE_SIZE, shown.length);
  const pageRows = shown.slice((currentPage - 1) * TREATMENT_PAGE_SIZE, currentPage * TREATMENT_PAGE_SIZE);
  // Afficher dès que chaque ligne est terminée (plus besoin d'attendre un flag ZIP séparé).
  const allReady =
    shown.length > 0 &&
    shown.every((job) => job.status === "ready" || job.status === "error") &&
    hasReadyFile;

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
  }, [previewOpen, shown.length, currentPage]);

  useEffect(() => {
    if (listPage > pageCount) setListPage(pageCount);
  }, [listPage, pageCount]);

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
                    Résultat du traitement
                  </h2>
                  <div className="mt-3 h-1.5 w-16 rounded-full bg-yas-yellow" />
                  <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm font-medium text-neutral-500">
                      {shown.length} ligne{shown.length > 1 ? "s" : ""}
                      {pageCount > 1 ? ` · page ${currentPage}/${pageCount}` : ""}
                    </p>
                    {shown.length > TREATMENT_PAGE_SIZE ? (
                      <div className="relative z-10 flex max-w-full items-center self-start overflow-hidden rounded-full border border-neutral-200 bg-white text-xs text-neutral-500 sm:text-sm">
                        <button
                          type="button"
                          aria-label="Page précédente"
                          onClick={() =>
                            setListPage((value) => {
                              const current = Math.min(value, pageCount);
                              return current <= 1 ? pageCount : current - 1;
                            })
                          }
                          className="relative z-10 cursor-pointer select-none px-3 py-1.5 text-neutral-500 transition hover:bg-neutral-100 hover:text-yas-navy"
                        >
                          ‹
                        </button>
                        <span className="border-x border-neutral-200 px-3 py-1.5 whitespace-nowrap font-medium text-neutral-600">
                          {pageStart} - {pageEnd} sur {shown.length}
                        </span>
                        <button
                          type="button"
                          aria-label="Page suivante"
                          onClick={() =>
                            setListPage((value) => {
                              const current = Math.min(value, pageCount);
                              return current >= pageCount ? 1 : current + 1;
                            })
                          }
                          className="relative z-10 cursor-pointer select-none px-3 py-1.5 text-neutral-500 transition hover:bg-neutral-100 hover:text-yas-navy"
                        >
                          ›
                        </button>
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="relative mt-4 min-h-0 flex-1 px-4 sm:px-6">
                  <div
                    ref={tableScrollRef}
                    className="h-full overflow-auto rounded-xl border border-neutral-100"
                  >
                    <table className="w-full min-w-[34rem] text-left text-xs sm:min-w-[42rem] sm:text-sm">
                      <thead className="sticky top-0 z-[1] bg-yas-navy text-[10px] uppercase tracking-wide text-white sm:text-xs">
                        <tr>
                          <th className="px-2.5 py-2.5 font-semibold sm:px-4 sm:py-3">Type</th>
                          <th className="px-2.5 py-2.5 font-semibold sm:px-4 sm:py-3">Valeur</th>
                          <th className="px-2.5 py-2.5 font-semibold sm:px-4 sm:py-3">Date de début</th>
                          <th className="px-2.5 py-2.5 font-semibold sm:px-4 sm:py-3">Statut</th>
                          <th className="px-2.5 py-2.5 font-semibold sm:px-4 sm:py-3">PDF</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pageRows.map((job) => {
                          const pdfEnabled = job.status === "ready" && Boolean(job.itemId);
                          return (
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
                              <span className={`text-xs font-semibold ${statusClassName(job.status)}`}>
                                {statusLabel(job.status)}
                              </span>
                            </td>
                            <td className="px-2.5 py-2.5 sm:px-4 sm:py-3">
                              <PdfRedButton
                                disabled={preview || !pdfEnabled || downloading === job.id}
                                loading={!preview && pdfEnabled && downloading === job.id}
                                onClick={() => {
                                  if (preview || !pdfEnabled) return;
                                  void downloadTreatment(job);
                                }}
                              />
                            </td>
                          </tr>
                          );
                        })}
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
                  {shown.length > 0 ? (
                    <div className="flex flex-col items-stretch justify-center gap-2 sm:flex-row sm:flex-wrap sm:items-center">
                      <button
                        type="button"
                        disabled={
                          preview
                            ? false
                            : !allReady || downloading === "all-zip" || downloading === "all-files"
                        }
                        onClick={() => {
                          if (preview || !allReady) return;
                          void downloadAllAsZip(shown);
                        }}
                        className="btn h-10 min-h-10 rounded-xl border-none bg-yas-navy px-5 font-semibold text-white hover:bg-[#012d66] disabled:bg-neutral-200 disabled:text-neutral-400 disabled:hover:bg-neutral-200"
                      >
                        {downloading === "all-zip" ? "Téléchargement…" : "Télécharger tout (.zip)"}
                      </button>
                      <button
                        type="button"
                        disabled={
                          preview
                            ? false
                            : !allReady || downloading === "all-zip" || downloading === "all-files"
                        }
                        onClick={() => {
                          if (preview || !allReady) return;
                          void downloadAllAsFiles(shown);
                        }}
                        className="btn h-10 min-h-10 rounded-xl border-none bg-yas-yellow px-5 font-semibold text-yas-navy hover:bg-[#f0ce00] disabled:bg-neutral-200 disabled:text-neutral-400 disabled:hover:bg-neutral-200"
                      >
                        {downloading === "all-files" ? "Téléchargement…" : "Télécharger tout"}
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
      {isClient && passwordOffer
        ? createPortal(
            <aside className="yas-side-toast" role="status" aria-live="polite" style={{ top: notice ? "7.5rem" : undefined }}>
              <div className="relative rounded-2xl border border-[#01377d]/15 bg-white p-4 text-sm text-yas-navy shadow-[0_18px_40px_rgba(1,55,125,0.14)]">
                <button
                  type="button"
                  aria-label="Fermer"
                  onClick={() => setPasswordOffer(null)}
                  className="absolute right-2 top-2 flex size-8 items-center justify-center rounded-full text-yas-navy/50 hover:bg-black/5 hover:text-yas-navy"
                >
                  <IconClose className="size-4" />
                </button>
                <p className="pr-8 font-bold">Mot de passe PDF</p>
                {passwordOffer.password ? (
                  <>
                    <p className="mt-1.5 font-medium leading-relaxed text-neutral-600">
                      Mot de passe :{" "}
                      <span className="font-mono font-bold text-yas-navy">{passwordOffer.password}</span>
                    </p>
                    <p className="mt-1 text-xs font-medium text-neutral-500">
                      Le fichier .txt a déjà été téléchargé avec le PDF.
                    </p>
                    <div className="mt-3">
                      <button
                        type="button"
                        className="btn h-9 min-h-9 rounded-xl border-none bg-yas-navy px-4 text-xs font-semibold text-white hover:bg-[#012d66]"
                        onClick={() => {
                          void navigator.clipboard?.writeText(passwordOffer.password || "");
                        }}
                      >
                        Copier le mot de passe
                      </button>
                    </div>
                  </>
                ) : (
                  <p className="mt-1.5 font-medium leading-relaxed text-neutral-600">
                    Le fichier .txt a été téléchargé avec le PDF — ouvre-le pour lire le mot de passe.
                  </p>
                )}
              </div>
            </aside>,
            document.body,
          )
        : null}
    </section>
  );
}
