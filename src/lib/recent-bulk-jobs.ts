import type { BulkOutputType } from "@/lib/gcd-api";

export type RememberedBulkJob = {
  jobId: string;
  fileName: string;
  outputType: BulkOutputType;
  createdAt: string;
};

const LIST_KEY = "gcd-recent-bulk-jobs";
const LIMIT = 40;

export function listRememberedBulkJobs(): RememberedBulkJob[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(sessionStorage.getItem(LIST_KEY) || "[]") as RememberedBulkJob[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** Mémorise un traitement lancé (plusieurs jobs possibles en parallèle). */
export function rememberBulkJob(entry: RememberedBulkJob) {
  if (typeof window === "undefined") return;
  const previous = listRememberedBulkJobs().filter((item) => item.jobId !== entry.jobId);
  sessionStorage.setItem(LIST_KEY, JSON.stringify([entry, ...previous].slice(0, LIMIT)));
}
