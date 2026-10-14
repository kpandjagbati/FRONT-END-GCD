"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ExcelButton, PdfRedButton, WordButton } from "@/components/ActionButtons";
import { IconChevronLeft } from "@/components/icons";
import YasLoadingOverlay from "@/components/YasLoadingOverlay";
import {
  isDownloadReady,
  jobsFromBulk,
  statusClassName,
  statusLabel,
  typeLabel,
  type TreatmentJob,
} from "@/lib/bulk-treatment";
import { saveBlob, saveBlobsInBrowser } from "@/lib/downloads";
import {
  ApiError,
  clearBulkZipCache,
  downloadBulkSearch,
  downloadBulkSearchItem,
  extractBulkOutputType,
  getBulkSearch,
  isBulkSearchComplete,
  readPasswordFromBlob,
  type BulkOutputType,
} from "@/lib/gcd-api";
import { listRememberedBulkJobs } from "@/lib/recent-bulk-jobs";

const PAGE_SIZE = 10;

export default function TraitementHistoriqueDetailPage() {
  const params = useParams<{ jobId: string }>();
  const jobId = decodeURIComponent(String(params.jobId || "").trim());

  const [jobs, setJobs] = useState<TreatmentJob[]>([]);
  const [outputType, setOutputType] = useState<BulkOutputType>("pdf");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [listPage, setListPage] = useState(1);
  const [passwordOffer, setPasswordOffer] = useState<{
    filename: string;
    content: string;
  } | null>(null);

  useEffect(() => {
    if (!jobId) {
      setError("Identifiant de traitement manquant.");
      setLoading(false);
      return;
    }
    let cancelled = false;
    const intervalMs = 3000;
    const maxAttempts = 240;
    const remembered = listRememberedBulkJobs().find((job) => job.jobId === jobId);
    if (remembered?.outputType) setOutputType(remembered.outputType);

    (async () => {
      setLoading(true);
      setError(null);
      try {
        for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
          if (cancelled) return;
          const data = await getBulkSearch(jobId);
          if (cancelled) return;
          setOutputType(extractBulkOutputType(data));
          setJobs((prev) => jobsFromBulk(data, [], prev));
          setLoading(false);
          if (isBulkSearchComplete(data)) return;
          await new Promise((resolve) => window.setTimeout(resolve, intervalMs));
        }
        if (!cancelled) {
          setError("Le traitement prend plus de temps que prévu. Réessayez dans quelques instants.");
        }
      } catch (cause) {
        if (cancelled) return;
        setError(
          cause instanceof ApiError
            ? cause.message
            : cause instanceof Error
              ? cause.message
              : "Impossible de charger le détail du traitement.",
        );
        setJobs([]);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [jobId]);

  async function downloadTreatment(job: TreatmentJob) {
    if (!isDownloadReady(job.status) || !job.itemId || downloading) return;
    setDownloading(job.id);
    setError(null);
    try {
      const document = await downloadBulkSearchItem(jobId, job.itemId, "document");
      const extension = outputType === "excel" ? "xlsx" : outputType === "word" ? "docx" : "pdf";
      const fileName =
        job.fileName || document.filename || `traitement-${job.itemId}.${extension}`;
      saveBlob(fileName, document.blob);

      if (outputType !== "pdf") {
        setPasswordOffer(null);
        return;
      }

      try {
        const password = await downloadBulkSearchItem(jobId, job.itemId, "password");
        if (password.blob.size > 0) {
          const passwordFileName =
            (password.filename && /\.txt$/i.test(password.filename) ? password.filename : "") ||
            job.passwordFileName ||
            `Password-${job.valeur || job.itemId}.txt`;
          saveBlob(passwordFileName, password.blob);
          const content = await readPasswordFromBlob(password.blob);
          if (content) setPasswordOffer({ filename: passwordFileName, content });
        }
      } catch {
        setPasswordOffer(null);
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Le téléchargement a échoué.");
    } finally {
      setDownloading(null);
    }
  }

  async function downloadAllAsZip() {
    if (downloading) return;
    const ready = jobs.filter((job) => isDownloadReady(job.status) && job.itemId);
    if (ready.length === 0) return;
    setDownloading("all-zip");
    setError(null);
    try {
      clearBulkZipCache(jobId);
      const { blob, filename } = await downloadBulkSearch(jobId);
      saveBlob(filename || `traitement-${jobId}.zip`, blob);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Le téléchargement ZIP a échoué.");
    } finally {
      setDownloading(null);
    }
  }

  async function downloadAllAsFiles() {
    if (downloading) return;
    const ready = jobs.filter((job) => isDownloadReady(job.status) && job.itemId);
    if (ready.length === 0) return;
    setDownloading("all-files");
    setError(null);
    try {
      const extension = outputType === "excel" ? "xlsx" : outputType === "word" ? "docx" : "pdf";
      const files: { filename: string; blob: Blob }[] = [];
      for (const job of ready) {
        const document = await downloadBulkSearchItem(jobId, job.itemId, "document");
        files.push({
          filename: job.fileName || document.filename || `traitement-${job.itemId}.${extension}`,
          blob: document.blob,
        });

        if (outputType === "pdf") {
          try {
            const password = await downloadBulkSearchItem(jobId, job.itemId, "password");
            if (password.blob.size > 0) {
              files.push({
                filename:
                  (password.filename && /\.txt$/i.test(password.filename) ? password.filename : "") ||
                  job.passwordFileName ||
                  `Password-${job.valeur || job.itemId}.txt`,
                blob: password.blob,
              });
            }
          } catch {
            // document déjà pris
          }
        }
      }
      await saveBlobsInBrowser(files);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Le téléchargement a échoué.");
    } finally {
      setDownloading(null);
    }
  }

  const pageCount = Math.max(1, Math.ceil(jobs.length / PAGE_SIZE));
  const currentPage = Math.min(listPage, pageCount);
  const pageRows = jobs.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const allReady =
    jobs.length > 0 && jobs.every((job) => isDownloadReady(job.status) || job.status === "error");
  const canDownloadAll = jobs.some((job) => isDownloadReady(job.status) && job.itemId);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
      <YasLoadingOverlay open={loading} />

      <div className="flex flex-wrap items-center gap-3">
        <Link
          href="/traitement/historique"
          className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-3 text-sm font-semibold text-yas-navy hover:bg-[#eef4ff]"
        >
          <IconChevronLeft className="size-4" />
          Historique
        </Link>
        <div className="min-w-0">
          <h1 className="text-lg font-bold text-yas-navy sm:text-xl">Détail du traitement</h1>
        </div>
      </div>

      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-600">
          {error}
        </p>
      ) : null}

      {passwordOffer ? (
        <div className="rounded-xl border border-[#1f7a46]/20 bg-[#e8f6ee] px-3 py-2 text-sm text-[#1f7a46]">
          <p className="font-semibold">Mot de passe PDF</p>
          <p className="mt-1 font-mono text-xs">{passwordOffer.content}</p>
          <p className="mt-1 text-xs opacity-80">{passwordOffer.filename}</p>
        </div>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-[0_12px_32px_rgba(1,55,125,0.06)]">
        <div className="flex flex-col gap-2 border-b border-neutral-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-medium text-neutral-500">
            {jobs.length} ligne{jobs.length > 1 ? "s" : ""}
            {pageCount > 1 ? ` · page ${currentPage}/${pageCount}` : ""}
          </p>
          {jobs.length > PAGE_SIZE ? (
            <div className="flex overflow-hidden rounded-full border border-neutral-200 bg-white text-xs text-neutral-500">
              <button
                type="button"
                aria-label="Page précédente"
                onClick={() =>
                  setListPage((value) => {
                    const current = Math.min(value, pageCount);
                    return current <= 1 ? pageCount : current - 1;
                  })
                }
                className="px-3 py-1.5 hover:bg-neutral-100 hover:text-yas-navy"
              >
                ‹
              </button>
              <span className="border-x border-neutral-200 px-3 py-1.5 font-medium text-neutral-600">
                {(currentPage - 1) * PAGE_SIZE + 1} - {Math.min(currentPage * PAGE_SIZE, jobs.length)}{" "}
                sur {jobs.length}
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
                className="px-3 py-1.5 hover:bg-neutral-100 hover:text-yas-navy"
              >
                ›
              </button>
            </div>
          ) : null}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[40rem] text-left text-xs sm:text-sm">
            <thead className="bg-yas-navy text-[10px] uppercase tracking-wide text-white sm:text-xs">
              <tr>
                <th className="px-3 py-3 font-semibold sm:px-4">Type</th>
                <th className="px-3 py-3 font-semibold sm:px-4">Valeur</th>
                <th className="px-3 py-3 font-semibold sm:px-4">Date de début</th>
                <th className="px-3 py-3 font-semibold sm:px-4">Date de fin</th>
                <th className="px-3 py-3 font-semibold sm:px-4">Statut</th>
                <th className="px-3 py-3 font-semibold sm:px-4">Téléchargement</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map((job) => {
                const canDownload = isDownloadReady(job.status) && Boolean(job.itemId);
                const downloadBusy = canDownload && downloading === job.id;
                const downloadDisabled = !canDownload || Boolean(downloading);
                return (
                  <tr key={job.id} className="border-t border-neutral-100">
                    <td className="px-3 py-3 font-semibold text-yas-navy sm:px-4">
                      {typeLabel(job.type)}
                    </td>
                    <td className="px-3 py-3 text-neutral-700 sm:px-4">{job.valeur || "—"}</td>
                    <td className="px-3 py-3 text-neutral-700 sm:px-4">{job.dateDebut || "—"}</td>
                    <td className="px-3 py-3 text-neutral-700 sm:px-4">{job.dateFin || "—"}</td>
                    <td className="px-3 py-3 sm:px-4">
                      <span className={`text-xs font-semibold ${statusClassName(job.status)}`}>
                        {statusLabel(job.status)}
                      </span>
                    </td>
                    <td className="px-3 py-3 sm:px-4">
                      {outputType === "excel" ? (
                        <ExcelButton
                          iconOnly
                          disabled={downloadDisabled}
                          loading={downloadBusy}
                          onClick={() => void downloadTreatment(job)}
                        />
                      ) : outputType === "word" ? (
                        <WordButton
                          iconOnly
                          disabled={downloadDisabled}
                          loading={downloadBusy}
                          onClick={() => void downloadTreatment(job)}
                        />
                      ) : (
                        <PdfRedButton
                          iconOnly
                          disabled={downloadDisabled}
                          loading={downloadBusy}
                          onClick={() => void downloadTreatment(job)}
                        />
                      )}
                    </td>
                  </tr>
                );
              })}
              {!loading && jobs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-neutral-500">
                    Aucune ligne pour ce traitement.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        {jobs.length > 0 ? (
          <div className="flex flex-col gap-2 border-t border-neutral-100 px-4 py-3 sm:flex-row sm:flex-wrap sm:justify-center">
            <button
              type="button"
              disabled={!canDownloadAll || !allReady || Boolean(downloading)}
              onClick={() => void downloadAllAsZip()}
              className="btn h-10 min-h-10 rounded-xl border-none bg-yas-navy px-5 font-semibold text-white hover:bg-[#012d66] disabled:bg-neutral-200 disabled:text-neutral-400"
            >
              {downloading === "all-zip" ? "Téléchargement…" : "Télécharger tout (.zip)"}
            </button>
            <button
              type="button"
              disabled={!canDownloadAll || !allReady || Boolean(downloading)}
              onClick={() => void downloadAllAsFiles()}
              className="btn h-10 min-h-10 rounded-xl border-none bg-yas-yellow px-5 font-semibold text-yas-navy hover:bg-[#f0ce00] disabled:bg-neutral-200 disabled:text-neutral-400"
            >
              {downloading === "all-files" ? "Téléchargement…" : "Télécharger tout"}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
