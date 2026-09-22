export type ExportKind = "pdf" | "pdf-locked" | "excel" | "word";

export type ExportSource = {
  url: string;
  filename?: string;
};

export const EXPORT_FILES: Record<ExportKind, { filename: string; label: string }> = {
  pdf: { filename: "document.pdf", label: "PDF" },
  "pdf-locked": { filename: "document.pdf", label: "PDF verrouillé" },
  excel: { filename: "document.xls", label: "Excel" },
  word: { filename: "document.doc", label: "Word" },
};

export function saveBlob(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function filenameFromResponse(response: Response, fallback: string) {
  const header = response.headers.get("content-disposition");
  const match = header?.match(/filename\*?=(?:UTF-8'')?"?([^\";]+)"?/i);
  if (!match?.[1]) return fallback;
  try {
    return decodeURIComponent(match[1]);
  } catch {
    return match[1];
  }
}

export async function readResponseWithProgress(
  response: Response,
  onProgress: (ratio: number) => void,
) {
  const total = Number(response.headers.get("content-length") || 0);
  if (!response.body) {
    const blob = await response.blob();
    onProgress(1);
    return blob;
  }

  const reader = response.body.getReader();
  const chunks: BlobPart[] = [];
  let received = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (!value) continue;
    chunks.push(value);
    received += value.byteLength;
    if (total > 0) onProgress(Math.min(1, received / total));
  }

  onProgress(1);
  return new Blob(chunks);
}

/**
 * Point unique à brancher sur l'API.
 * Exemple : return fetch(`/api/exports/${kind}`, { credentials: "include" });
 */
export async function fetchExport(_kind: ExportKind): Promise<Response | null> {
  return null;
}
