import type { BulkOutputType } from "@/lib/gcd-api";

export type RememberedBulkJob = {
  jobId: string;
  fileName: string;
  outputType: BulkOutputType;
  createdAt: string;
};

/** Job dont le statut est suivi sur la page Traitement (repris au retour). */
export type ActiveBulkPoll = {
  jobId: string;
  fileName: string;
  outputType: BulkOutputType;
};

const LIST_KEY = "gcd-recent-bulk-jobs";
const ACTIVE_KEY = "gcd-active-bulk-poll";
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

export function getActiveBulkPoll(): ActiveBulkPoll | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(ACTIVE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ActiveBulkPoll;
    return parsed?.jobId ? parsed : null;
  } catch {
    return null;
  }
}

export function setActiveBulkPoll(entry: ActiveBulkPoll | null) {
  if (typeof window === "undefined") return;
  if (!entry) {
    sessionStorage.removeItem(ACTIVE_KEY);
    return;
  }
  sessionStorage.setItem(ACTIVE_KEY, JSON.stringify(entry));
}
