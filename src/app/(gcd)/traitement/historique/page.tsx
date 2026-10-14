"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { IconChevronLeft, IconHistory } from "@/components/icons";
import YasLoadingOverlay from "@/components/YasLoadingOverlay";
import { isDownloadReady, statusClassName } from "@/lib/bulk-treatment";
import { saveBlob } from "@/lib/downloads";
import {
  ApiError,
  clearBulkZipCache,
  downloadBulkSearch,
  listRecentBulkSearches,
  parseRecentBulkSearches,
  type RecentBulkSearch,
} from "@/lib/gcd-api";
import { listRememberedBulkJobs } from "@/lib/recent-bulk-jobs";

const OUTPUT_LABELS: Record<RecentBulkSearch["outputType"], string> = {
  pdf: "PDF",
  excel: "Excel",
  word: "Word",
};

function formatCreatedAt(value: string) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function TraitementHistoriquePage() {
  const [items, setItems] = useState<RecentBulkSearch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    function fromLocal(): RecentBulkSearch[] {
      return listRememberedBulkJobs().map((job) => ({
        jobId: job.jobId,
        status: "pending" as const,
        statusLabel: "En cours / récent",
        outputType: job.outputType,
        fileName: job.fileName,
        createdAt: job.createdAt,
        itemCount: null,
      }));
    }

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await listRecentBulkSearches();
        if (cancelled) return;
        const remote = parseRecentBulkSearches(data);
        if (remote.length > 0) {
          setItems(remote);
          return;
        }
        // Endpoint OK mais liste vide : compléter avec les jobs lancés cette session.
        setItems(fromLocal());
      } catch (cause) {
        if (cancelled) return;
        // Endpoint pas encore dispo (Arif) : afficher au moins les traitements lancés localement.
        const local = fromLocal();
        setItems(local);
        if (local.length === 0) {
          const message =
            cause instanceof ApiError
              ? cause.message
              : cause instanceof Error
                ? cause.message
                : "Impossible de charger les traitements récents.";
          setError(message);
        } else {
          setError(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function downloadZip(job: RecentBulkSearch) {
    if (downloading || !isDownloadReady(job.status)) return;
    setDownloading(job.jobId);
    setError(null);
    try {
      clearBulkZipCache(job.jobId);
      const { blob, filename } = await downloadBulkSearch(job.jobId);
      saveBlob(filename || `traitement-${job.jobId}.zip`, blob);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Le téléchargement ZIP a échoué.");
    } finally {
      setDownloading(null);
    }
  }

  return (
    <div className="mx-auto w-full max-w-5xl">
      <YasLoadingOverlay open={loading} />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Link
          href="/traitement"
          className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-3 text-sm font-semibold text-yas-navy hover:bg-[#eef4ff]"
        >
          <IconChevronLeft className="size-4" />
          Retour
        </Link>
        <div className="min-w-0">
          <h1 className="flex items-center gap-2 text-lg font-bold text-yas-navy sm:text-xl">
            <IconHistory className="size-5 shrink-0" />
            Traitements récents
          </h1>
          <p className="mt-0.5 text-xs font-medium text-neutral-500 sm:text-sm">
            Consultez un traitement ou téléchargez l’ensemble des fichiers.
          </p>
        </div>
      </div>

      {error ? (
        <p className="mb-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-600">
          {error}
        </p>
      ) : null}

      {!loading && items.length === 0 && !error ? (
        <div className="rounded-2xl border border-dashed border-yas-navy/15 bg-white px-4 py-10 text-center">
          <p className="text-sm font-semibold text-yas-navy">Aucun traitement récent</p>
          <p className="mt-1 text-xs text-neutral-500">
            Les traitements apparaîtront ici dès que l’API historique sera disponible.
          </p>
          <Link
            href="/traitement"
            className="btn mt-4 inline-flex h-10 min-h-10 rounded-xl border-none bg-yas-navy px-5 text-sm font-semibold text-white hover:bg-[#012d66]"
          >
            Nouveau traitement
          </Link>
        </div>
      ) : null}

      {items.length > 0 ? (
        <div className="overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-[0_12px_32px_rgba(1,55,125,0.06)]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[40rem] text-left text-sm">
              <thead className="bg-yas-navy text-[10px] uppercase tracking-wide text-white sm:text-xs">
                <tr>
                  <th className="px-3 py-3 font-semibold sm:px-4">Fichier / référence</th>
                  <th className="px-3 py-3 font-semibold sm:px-4">Date</th>
                  <th className="px-3 py-3 font-semibold sm:px-4">Format</th>
                  <th className="px-3 py-3 font-semibold sm:px-4">Lignes</th>
                  <th className="px-3 py-3 font-semibold sm:px-4">Statut</th>
                  <th className="px-3 py-3 font-semibold sm:px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((job) => {
                  const canZip = isDownloadReady(job.status);
                  const busy = downloading === job.jobId;
                  return (
                    <tr key={job.jobId} className="border-t border-neutral-100">
                      <td className="px-3 py-3 sm:px-4">
                        <Link
                          href={`/traitement/historique/${encodeURIComponent(job.jobId)}`}
                          className="font-semibold text-yas-navy hover:underline"
                        >
                          {job.fileName}
                        </Link>
                        <p className="mt-0.5 truncate text-[11px] text-neutral-400">{job.jobId}</p>
                      </td>
                      <td className="px-3 py-3 text-neutral-700 sm:px-4">
                        {formatCreatedAt(job.createdAt)}
                      </td>
                      <td className="px-3 py-3 font-medium text-neutral-700 sm:px-4">
                        {OUTPUT_LABELS[job.outputType]}
                      </td>
                      <td className="px-3 py-3 text-neutral-700 sm:px-4">
                        {job.itemCount == null ? "—" : job.itemCount}
                      </td>
                      <td className="px-3 py-3 sm:px-4">
                        <span className={`text-xs font-semibold ${statusClassName(job.status)}`}>
                          {job.statusLabel}
                        </span>
                      </td>
                      <td className="px-3 py-3 sm:px-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <Link
                            href={`/traitement/historique/${encodeURIComponent(job.jobId)}`}
                            className="inline-flex h-8 items-center rounded-lg bg-[#eef4ff] px-2.5 text-xs font-semibold text-yas-navy hover:bg-[#dce8fb]"
                          >
                            Détails
                          </Link>
                          <button
                            type="button"
                            disabled={!canZip || busy || Boolean(downloading)}
                            onClick={() => void downloadZip(job)}
                            className="inline-flex h-8 items-center rounded-lg bg-yas-navy px-2.5 text-xs font-semibold text-white hover:bg-[#012d66] disabled:bg-neutral-200 disabled:text-neutral-400"
                          >
                            {busy ? "…" : "Tout (.zip)"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </div>
  );
}
