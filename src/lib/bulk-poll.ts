/**
 * Fréquence de polling bulk-search (Arif) :
 * uniquement tant que l'utilisateur est sur Traitement / historique.
 */
export const BULK_POLL_INTERVAL_MS = 15_000;

/** ~2 h max à 1 appel / 15 s. */
export const BULK_POLL_MAX_ATTEMPTS = 480;

export function sleep(ms: number, signal?: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException("Aborted", "AbortError"));
      return;
    }
    const timer = window.setTimeout(() => resolve(), ms);
    const onAbort = () => {
      window.clearTimeout(timer);
      reject(new DOMException("Aborted", "AbortError"));
    };
    signal?.addEventListener("abort", onAbort, { once: true });
  });
}

export function isAbortError(cause: unknown) {
  return (
    (cause instanceof DOMException && cause.name === "AbortError") ||
    (cause instanceof Error && cause.name === "AbortError")
  );
}
