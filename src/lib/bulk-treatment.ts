import {
  parseBulkSearchItems,
  type BulkSearchItemStatus,
} from "@/lib/gcd-api";

export type TreatmentJob = {
  id: string;
  itemId: string;
  type: string;
  valeur: string;
  dateDebut: string;
  dateFin: string;
  status: BulkSearchItemStatus;
  fileName?: string;
  passwordFileName?: string;
};

const TYPE_LABELS: Record<string, string> = {
  msisdn: "MSISDN",
  imei: "IMEI",
  imsi: "IMSI",
};

export function typeLabel(type: string) {
  return TYPE_LABELS[type.toLowerCase()] ?? type.toUpperCase();
}

export function statusLabel(status: BulkSearchItemStatus) {
  if (status === "waiting") return "En attente";
  if (status === "pending") return "En cours";
  if (status === "ready") return "Terminé";
  if (status === "partial") return "Terminé avec erreurs";
  return "Échoué";
}

export function statusClassName(status: BulkSearchItemStatus) {
  if (status === "ready") return "text-[#1f7a46]";
  if (status === "partial") return "text-amber-700";
  if (status === "error") return "text-red-500";
  if (status === "waiting") return "text-neutral-500";
  return "text-amber-600";
}

export function isDownloadReady(status: BulkSearchItemStatus) {
  return status === "ready" || status === "partial";
}

const STATUS_RANK: Record<BulkSearchItemStatus, number> = {
  waiting: 0,
  pending: 1,
  ready: 2,
  partial: 2,
  error: 2,
};

function mergeStatus(previous: BulkSearchItemStatus | undefined, next: BulkSearchItemStatus) {
  if (!previous) return next;
  if (next === "ready" || next === "partial" || next === "error") return next;
  if (previous === "ready" || previous === "partial" || previous === "error") return previous;
  if (STATUS_RANK[next] < STATUS_RANK[previous]) return previous;
  return next;
}

export function jobsFromBulk(
  data: unknown,
  fallback: TreatmentJob[] = [],
  previous: TreatmentJob[] = [],
): TreatmentJob[] {
  const items = parseBulkSearchItems(data);
  if (items.length === 0) return previous.length > 0 ? previous : fallback;
  return items.map((item, index) => {
    const base = fallback[index] || previous[index];
    const prev =
      previous.find((job) => job.itemId && job.itemId === item.itemId) || previous[index] || base;
    const fileName = item.fileName || prev?.fileName || base?.fileName;
    return {
      id: `item-${item.itemId}`,
      itemId: item.itemId,
      type: item.type || prev?.type || base?.type || "",
      valeur: item.valeur || prev?.valeur || base?.valeur || "",
      dateDebut: item.dateDebut || prev?.dateDebut || base?.dateDebut || "",
      dateFin: item.dateFin || prev?.dateFin || base?.dateFin || "",
      status: mergeStatus(prev?.status, item.status),
      fileName,
      passwordFileName: item.passwordFileName || prev?.passwordFileName || base?.passwordFileName,
    };
  });
}
