import { frenchDateToIso } from "@/lib/format-date";
import { calledNumberDigits } from "@/lib/search-guards";
import {
  getSessionPassword,
  getSessionToken,
  getSessionUsername,
  saveSessionToken,
  saveSessionUser,
  type SessionUser,
} from "@/lib/session";

const ROOT = "/api/gcd";

type Envelope<T> = {
  status?: { code?: number; message?: string; description?: string };
  data?: T;
};

let refreshInFlight: Promise<boolean> | null = null;

function frenchMessage(message: string) {
  const text = message.trim();
  if (/keywordSearchValue or keywordSearchBy is not correct/i.test(text)) {
    return "Le serveur ne reconnaît pas ce critère de recherche.";
  }
  if (/error occurred during the request processing/i.test(text)) {
    return "Le serveur n'a pas pu traiter cette recherche.";
  }
  if (/not authorized to use this service/i.test(text)) {
    return "Vous n'êtes pas autorisé à utiliser ce service.";
  }
  if (/access denied|forbidden/i.test(text)) {
    return "Session expirée ou jeton invalide. Reconnectez-vous, puis réessayez.";
  }
  if (/bad username or password/i.test(text)) {
    return "Nom d'utilisateur ou mot de passe incorrect.";
  }
  if (/Impossible de joindre l'API GCD/i.test(text)) {
    return text;
  }
  if (/n'a pas répondu correctement|socket hang up|ENOTFOUND|ECONNREFUSED|fetch failed/i.test(text)) {
    return "Impossible de joindre l'API GCD (réseau/VPN/DNS). Vérifiez la connexion VPN puis réessayez.";
  }
  if (/^not found$/i.test(text)) {
    return "Aucun login trouvé pour ce DN.";
  }
  return text;
}

export class ApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ApiError";
  }
}

function toApiDate(value: string) {
  return frenchDateToIso(value) || value.trim();
}

function requestId() {
  return `GCD-${Date.now()}`;
}

function readToken(data: unknown) {
  if (typeof data === "string" && data.trim()) return data.trim();
  if (!data || typeof data !== "object") return "";
  const record = data as Record<string, unknown>;
  for (const key of ["token", "accessToken", "access_token", "jwt"]) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

function asObject(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function readLoginUser(data: unknown): SessionUser | null {
  const root = asObject(data);
  if (!root) return null;
  const nestedData = asObject(root.data);
  const raw =
    asObject(root.user) ||
    asObject(nestedData?.user) ||
    (typeof root.username === "string" || typeof root.email === "string" ? root : null) ||
    (nestedData && (typeof nestedData.username === "string" || typeof nestedData.email === "string")
      ? nestedData
      : null);
  if (!raw) return null;
  const username = typeof raw.username === "string" ? raw.username.trim() : "";
  if (!username) return null;
  const firstname =
    (typeof raw.firstname === "string" && raw.firstname.trim()) ||
    (typeof raw.firstName === "string" && raw.firstName.trim()) ||
    "";
  const lastname =
    (typeof raw.lastname === "string" && raw.lastname.trim()) ||
    (typeof raw.lastName === "string" && raw.lastName.trim()) ||
    "";
  const lastConnection =
    (typeof raw.lastConnection === "string" && raw.lastConnection.trim()) ||
    (typeof raw.last_connection === "string" && raw.last_connection.trim()) ||
    "";
  return {
    id: typeof raw.id === "number" ? raw.id : undefined,
    username,
    email: typeof raw.email === "string" ? raw.email.trim() : "",
    firstname,
    lastname,
    lastConnection,
  };
}

function errorFromPayload(response: Response, payload: Envelope<unknown> | null, raw: unknown) {
  const envelope = payload?.status?.description || payload?.status?.message;
  if (envelope) return frenchMessage(envelope);

  if (raw && typeof raw === "object") {
    const record = raw as Record<string, unknown>;
    const springMessage = typeof record.message === "string" ? record.message.trim() : "";
    const springError = typeof record.error === "string" ? record.error.trim() : "";
    if (springMessage) return frenchMessage(springMessage);
    if (response.status === 403 || /forbidden/i.test(springError)) {
      return "Session expirée ou jeton invalide. Reconnectez-vous, puis réessayez.";
    }
    if (response.status === 401 || /unauthorized/i.test(springError)) {
      return "Session expirée ou non autorisée. Reconnectez-vous.";
    }
    if (springError) return frenchMessage(springError);
  }

  if (response.status === 403 || response.status === 401) {
    return "Session expirée ou jeton invalide. Reconnectez-vous, puis réessayez.";
  }
  return "La requête a échoué.";
}

function isAuthRejected(response: Response, payload: Envelope<unknown> | null, raw: unknown) {
  if (response.status !== 401 && response.status !== 403) return false;
  const envelopeCode = payload?.status?.code;
  const envelopeMessage = `${payload?.status?.message ?? ""} ${payload?.status?.description ?? ""}`;
  // 401/403 métier "Access Denied" / FORBIDDEN → tenter un refresh de session.
  if (typeof envelopeCode === "number") {
    return (
      envelopeCode === 401 ||
      envelopeCode === 403 ||
      /access denied|forbidden|unauthorized/i.test(envelopeMessage)
    );
  }
  if (!raw) return true;
  if (typeof raw === "object") {
    const record = raw as Record<string, unknown>;
    return record.error === "Forbidden" || record.error === "Unauthorized" || !record.status;
  }
  return true;
}

async function refreshSessionToken() {
  if (refreshInFlight) return refreshInFlight;
  refreshInFlight = (async () => {
    const username = getSessionUsername();
    const password = getSessionPassword();
    if (!username || !password) return false;
    try {
      const { token, user } = await loginUser(username, password);
      saveSessionToken(token);
      if (user) saveSessionUser(user);
      return true;
    } catch {
      return false;
    } finally {
      refreshInFlight = null;
    }
  })();
  return refreshInFlight;
}

async function gcdFetch<T>(path: string, init: RequestInit = {}, auth = true, didRefresh = false): Promise<T> {
  const headers = new Headers(init.headers);
  if (auth) {
    const token = getSessionToken();
    if (!token) throw new ApiError("Connectez-vous pour utiliser le service.");
    headers.set("Authorization", `Bearer ${token}`);
    headers.set("x-gcd-token", token);
  }
  if (init.body && !(init.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${ROOT}${path}`, { ...init, headers });
  const text = await response.text();
  let raw: unknown = null;
  let payload: Envelope<T> | null = null;
  if (text) {
    try {
      raw = JSON.parse(text) as unknown;
      payload = raw as Envelope<T>;
    } catch {
      if (!response.ok) throw new ApiError(frenchMessage("Le serveur n'a pas répondu correctement."));
      return text as T;
    }
  }

  if (auth && !didRefresh && isAuthRejected(response, payload as Envelope<unknown> | null, raw)) {
    const refreshed = await refreshSessionToken();
    if (refreshed) return gcdFetch<T>(path, init, auth, true);
  }

  const code = payload?.status?.code;
  const failed = !response.ok || (typeof code === "number" && code >= 400);
  if (failed) {
    throw new ApiError(errorFromPayload(response, payload as Envelope<unknown> | null, raw));
  }
  return (payload?.data ?? payload) as T;
}

export async function loginUser(username: string, password: string) {
  const data = await gcdFetch<unknown>(
    "/loginUser",
    {
      method: "POST",
      body: JSON.stringify({ username, password }),
    },
    false,
  );
  const token = readToken(data);
  if (!token) throw new ApiError("Le serveur n'a pas renvoyé de jeton de connexion.");
  return { token, user: readLoginUser(data) };
}

const SEARCH_BY: Record<string, string> = {
  numero: "msisdn",
  imei: "imei",
  imsi: "imsi",
  appele: "msisdn",
};

export type CallSearch = {
  criteria: string;
  searchValue: string;
  startDate: string;
  endDate: string;
  secureFile?: boolean;
  addAttachment?: boolean;
  email?: string;
  outputType?: string;
};

function keywordFor(criteria: string) {
  return SEARCH_BY[criteria] ?? "msisdn";
}

function callBody(input: CallSearch, withRequestId = true) {
  return {
    ...(withRequestId ? { requestId: requestId() } : {}),
    startDate: toApiDate(input.startDate),
    endDate: toApiDate(input.endDate),
    searchValue:
      input.criteria === "appele" || input.criteria === "numero"
        ? calledNumberDigits(input.searchValue)
        : input.searchValue.trim(),
    ...(input.criteria === "appele" ? { requestType: "calledNumber" } : {}),
    keywordSearchValue: "calls",
    keywordSearchBy: keywordFor(input.criteria),
  };
}

export function searchCalls(input: CallSearch) {
  return gcdFetch<unknown>("/get-calls-details/search", {
    method: "POST",
    body: JSON.stringify(callBody(input)),
  });
}

export type GeneratedFile = {
  pdfFileName?: string;
  excelFileName?: string;
  wordFileName?: string;
  fileName?: string;
  filename?: string;
  passwordFileName?: string;
};

export function generatedFileName(data: unknown): string {
  if (!data) return "";
  if (typeof data === "string") {
    const match = data.match(/[^\s\\/"]+\.(pdf|xls|xlsx|doc|docx|txt)\b/i);
    return match?.[0] ?? "";
  }
  if (typeof data !== "object") return "";
  const record = data as Record<string, unknown>;
  for (const key of ["pdfFileName", "excelFileName", "wordFileName", "fileName", "filename", "pdfName"]) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  for (const value of Object.values(record)) {
    if (!value || typeof value !== "object") continue;
    const found = generatedFileName(value);
    if (found) return found;
  }
  return "";
}

function downloadFolder(filename: string) {
  const extension = filename.split(".").pop()?.toLowerCase() ?? "pdf";
  if (extension === "txt") return "txt";
  if (extension === "xls" || extension === "xlsx") return "excel";
  if (extension === "doc" || extension === "docx") return "word";
  return "pdf";
}

export function generateCallsFile(input: CallSearch) {
  return gcdFetch<GeneratedFile>("/get-calls-details/search/generate", {
    method: "POST",
    body: JSON.stringify({
      ...callBody(input),
      outputType: input.outputType ?? "pdf",
      ...(input.secureFile ? { secureFile: true } : {}),
      ...(input.addAttachment
        ? { addAttachment: "true", sendTo: input.email?.trim() ?? "" }
        : {}),
    }),
  });
}

async function readDownloadError(response: Response) {
  const detail = await response.text();
  try {
    return (JSON.parse(detail) as Envelope<unknown>).status?.description ?? "";
  } catch {
    return "";
  }
}

export async function downloadFile(filename: string, body: unknown, folder = downloadFolder(filename)) {
  const token = getSessionToken();
  if (!token) throw new ApiError("Connectez-vous pour utiliser le service.");
  const safeName = filename.split("/").pop() || filename;
  const url = `${ROOT}/get-calls-details/download/${folder}/${encodeURIComponent(safeName)}`;
  const headers = { Authorization: `Bearer ${token}`, "x-gcd-token": token };

  let response = await fetch(url, { method: "GET", headers });
  if (response.status === 405 || response.status === 400 || response.status === 415) {
    response = await fetch(url, {
      method: "POST",
      headers: { ...headers, "Content-Type": "text/plain" },
      body: JSON.stringify(body),
    });
  }
  if (!response.ok) {
    const description = await readDownloadError(response);
    throw new ApiError(description || `Le téléchargement du fichier a échoué (${response.status}).`);
  }
  return response.blob();
}

/**
 * Comme Appels (downloadNamedFile) : le .txt Password est souvent sous /pdf, parfois /txt.
 * Ignore les réponses vides.
 */
export async function downloadPasswordFile(filename: string) {
  const safeName = filename.split("/").pop() || filename;
  if (!safeName) throw new ApiError("Nom de fichier mot de passe manquant.");
  // Ordre Appels : dossier pdf d'abord.
  for (const folder of ["pdf", "txt"] as const) {
    try {
      const blob = await downloadFile(safeName, {}, folder);
      if (blob.size > 0) return { filename: safeName, blob };
    } catch {
      // essayer le dossier suivant
    }
  }
  throw new ApiError("Le fichier mot de passe est introuvable ou vide.");
}

export function downloadNamedFile(filename: string, input: CallSearch) {
  const folder = input.outputType === "excel" || input.outputType === "word" ? input.outputType : "pdf";
  return downloadFile(
    filename,
    {
      ...callBody(input),
      keywordSearchBy: keywordFor(input.criteria),
    },
    folder,
  );
}

export function searchIdentities(lastName: string, firstName: string) {
  return gcdFetch<unknown>("/get-calls-details/mobiles-identities", {
    method: "POST",
    body: JSON.stringify({ lastName: lastName.trim(), firstName: firstName.trim() }),
  });
}

export function generateIdentitiesFile(lastName: string, firstName: string, secureFile: boolean) {
  return gcdFetch<GeneratedFile>("/get-calls-details/mobiles-identities/generate", {
    method: "POST",
    body: JSON.stringify({
      lastName: lastName.trim(),
      firstName: firstName.trim(),
      ...(secureFile ? { secureFile: true } : {}),
    }),
  });
}

export function generateTmoneyFile(
  searchValue: string,
  startDate: string,
  endDate: string,
  secureFile = false,
) {
  return gcdFetch<GeneratedFile>("/get-calls-details/search/tmoney-transactions/generate", {
    method: "POST",
    body: JSON.stringify({
      requestId: requestId(),
      startDate: toApiDate(startDate),
      endDate: toApiDate(endDate),
      searchValue: searchValue.trim(),
      ...(secureFile ? { secureFile: true } : {}),
    }),
  });
}

export function searchTmoney(searchValue: string, startDate: string, endDate: string) {
  return gcdFetch<unknown>("/get-calls-details/search/tmoney-transactions", {
    method: "POST",
    body: JSON.stringify({
      startDate: toApiDate(startDate),
      endDate: toApiDate(endDate),
      searchValue: searchValue.trim(),
    }),
  });
}

export function getFtthLogin(dn: string) {
  return gcdFetch<unknown>(`/get-calls-details/ftth/get-login?dn=${encodeURIComponent(dn.trim())}`);
}

export function querySubscriber(msisdn: string) {
  const digits = msisdn.replace(/\D/g, "");
  const full = digits.startsWith("228") ? digits : `228${digits}`;
  return gcdFetch<unknown>(`/subscriber/query?msisdn=${encodeURIComponent(full)}`);
}

export type BulkOutputType = "pdf" | "excel" | "word";

export function bulkSearch(file: File, outputType: BulkOutputType = "pdf") {
  const body = new FormData();
  body.append("file", file);
  body.append("outputType", outputType);
  return gcdFetch<unknown>("/get-calls-details/bulk-search/v2", { method: "POST", body });
}

export function getBulkSearch(jobId: string) {
  const id = encodeURIComponent(jobId.trim());
  return gcdFetch<unknown>(`/get-calls-details/bulk-search/v2/${id}`);
}

/**
 * Liste des traitements récents de l'utilisateur connecté.
 * Endpoint provisoire — Arif confirmera le path exact.
 * Attendu : GET → tableau { id|jobId|reference, status, outputType?, fileName?, createdAt?, itemCount? }
 */
export function listRecentBulkSearches() {
  return gcdFetch<unknown>("/get-calls-details/bulk-search/v2/history");
}

export type RecentBulkSearch = {
  jobId: string;
  status: BulkSearchItemStatus;
  statusLabel: string;
  outputType: BulkOutputType;
  fileName: string;
  createdAt: string;
  itemCount: number | null;
};

function asBulkOutputType(raw: string): BulkOutputType {
  const value = raw.trim().toLowerCase();
  if (value === "excel" || value === "xlsx" || value === "xls") return "excel";
  if (value === "word" || value === "docx" || value === "doc") return "word";
  return "pdf";
}

/** Parse la réponse liste historique (forme flexible tant que l'API n'est pas figée). */
export function parseRecentBulkSearches(data: unknown): RecentBulkSearch[] {
  const rows = (() => {
    if (Array.isArray(data)) return objectRows(data);
    if (!data || typeof data !== "object") return [];
    const record = data as Record<string, unknown>;
    for (const key of ["items", "results", "jobs", "history", "data", "content"]) {
      const value = record[key];
      if (Array.isArray(value) && value.length > 0) {
        const nested = objectRows(value);
        if (nested.length > 0) return nested;
      }
    }
    return asRecords(data);
  })();

  return rows.flatMap((row) => {
    const jobId =
      field(row, ["jobId", "id", "reference", "bulkSearchId", "bulkId", "uuid", "requestId"]) ||
      extractBulkJobId(row);
    if (!jobId) return [];
    const statusRaw = field(row, ["status", "state", "jobStatus", "processingStatus"]);
    const status = bulkItemStatus(statusRaw || "COMPLETED");
    const createdAt = field(row, [
      "createdAt",
      "created_at",
      "date",
      "submittedAt",
      "startedAt",
      "updatedAt",
    ]);
    const fileName = field(row, ["fileName", "filename", "originalFileName", "csvFileName", "name"]);
    const countRaw = field(row, ["itemCount", "itemsCount", "totalItems", "count", "size"]);
    const itemCount = countRaw && Number.isFinite(Number(countRaw)) ? Number(countRaw) : null;
    const outputType = asBulkOutputType(field(row, ["outputType", "output_type", "format", "type"]));
    return [
      {
        jobId,
        status,
        statusLabel:
          status === "waiting"
            ? "En attente"
            : status === "pending"
              ? "En cours"
              : status === "ready"
                ? "Terminé"
                : status === "partial"
                  ? "Terminé avec erreurs"
                  : "Échoué",
        outputType,
        fileName: fileName || `Traitement ${jobId.slice(0, 8)}`,
        createdAt,
        itemCount,
      },
    ];
  });
}

/** Déduit outputType depuis le détail d'un job (fallback pdf). */
export function extractBulkOutputType(data: unknown): BulkOutputType {
  if (!data || typeof data !== "object") return "pdf";
  const record = data as Record<string, unknown>;
  const direct = field(record, ["outputType", "output_type", "format"]);
  if (direct) return asBulkOutputType(direct);
  if ("data" in record && record.data && typeof record.data === "object") {
    return extractBulkOutputType(record.data);
  }
  return "pdf";
}

function bulkStatusLabel(status: BulkSearchItemStatus) {
  if (status === "waiting") return "En attente";
  if (status === "pending") return "En cours";
  if (status === "ready") return "Terminé";
  if (status === "partial") return "Terminé avec erreurs";
  return "Échoué";
}

/** Met à jour statut / lignes d'une entrée historique via le GET détail du job. */
export function enrichRecentBulkFromDetail(
  entry: RecentBulkSearch,
  data: unknown,
): RecentBulkSearch {
  const items = parseBulkSearchItems(data);
  const record = data && typeof data === "object" ? (data as Record<string, unknown>) : {};
  const nested =
    "data" in record && record.data && typeof record.data === "object"
      ? (record.data as Record<string, unknown>)
      : record;
  const statusRaw = field(nested, ["status", "state", "jobStatus", "processingStatus"]);
  let status = statusRaw ? bulkItemStatus(statusRaw) : entry.status;

  if (!statusRaw) {
    if (isBulkSearchComplete(data)) {
      if (items.length > 0 && items.every((item) => item.status === "error")) status = "error";
      else if (items.some((item) => item.status === "partial" || item.status === "error"))
        status = "partial";
      else status = "ready";
    } else if (items.some((item) => item.status === "pending" || item.status === "waiting")) {
      status = items.some((item) => item.status === "pending") ? "pending" : "waiting";
    }
  }

  // Job terminé côté API mais mapping item encore flou → ZIP téléchargeable.
  if (isBulkSearchComplete(data) && status !== "error" && status !== "partial") {
    status = "ready";
  }

  return {
    ...entry,
    status,
    statusLabel: bulkStatusLabel(status),
    itemCount: items.length > 0 ? items.length : entry.itemCount,
    outputType: extractBulkOutputType(data) || entry.outputType,
  };
}

async function bulkDownloadBlob(path: string) {
  const token = getSessionToken();
  if (!token) throw new ApiError("Connectez-vous pour utiliser le service.");
  const response = await fetch(`${ROOT}${path}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}`, "x-gcd-token": token },
  });
  if (!response.ok) {
    const description = await readDownloadError(response);
    throw new ApiError(description || `Le téléchargement a échoué (${response.status}).`);
  }
  const disposition = response.headers.get("content-disposition") ?? "";
  const matched =
    disposition.match(/filename\*=UTF-8''([^;]+)/i)?.[1] ||
    disposition.match(/filename="?([^";]+)"?/i)?.[1];
  const filename = matched ? decodeURIComponent(matched.trim()) : "traitement.zip";
  return { blob: await response.blob(), filename };
}

export function downloadBulkSearch(jobId: string) {
  const id = encodeURIComponent(jobId.trim());
  return bulkDownloadBlob(`/get-calls-details/bulk-search/v2/${id}/download`);
}

export type BulkItemFileKind = "document" | "password";

/** Arif : GET .../items/{itemId}/download?file=document|password */
export function downloadBulkSearchItem(
  jobId: string,
  itemId: string | number,
  file: BulkItemFileKind = "document",
) {
  const id = encodeURIComponent(jobId.trim());
  const item = encodeURIComponent(String(itemId).trim());
  if (!item) throw new ApiError("Identifiant d'item invalide pour le téléchargement.");
  const kind = file === "password" ? "password" : "document";
  return bulkDownloadBlob(`/get-calls-details/bulk-search/v2/${id}/items/${item}/download?file=${kind}`);
}

const bulkZipCache = new Map<string, Promise<{ name: string; data: Uint8Array }[]>>();

export function clearBulkZipCache(jobId?: string) {
  if (jobId) bulkZipCache.delete(jobId.trim());
  else bulkZipCache.clear();
}

async function loadBulkZipEntries(jobId: string) {
  const key = jobId.trim();
  const cached = bulkZipCache.get(key);
  if (cached) return cached;
  const pending = (async () => {
    const { unzipSync } = await import("fflate");
    const { blob } = await downloadBulkSearch(key);
    const files = unzipSync(new Uint8Array(await blob.arrayBuffer()));
    return Object.entries(files).map(([path, data]) => ({
      name: path.split("/").pop() || path,
      data,
    }));
  })();
  bulkZipCache.set(key, pending);
  try {
    return await pending;
  } catch (error) {
    bulkZipCache.delete(key);
    throw error;
  }
}

function zipEntryBlob(data: Uint8Array) {
  // Copie pour éviter un ArrayBuffer détaché / Blob vide selon le navigateur.
  return new Blob([new Uint8Array(data)], { type: "application/octet-stream" });
}

/** Lit « Mot de passe d'ouverture : xxx » dans le .txt Yas. */
export async function readPasswordFromBlob(blob: Blob) {
  const text = await blob.text();
  const match = text.match(/Mot de passe d['’]ouverture\s*:\s*(\S+)/i);
  return match?.[1]?.trim() || "";
}

/** PDF + .txt Password du même ZIP (équivalent Appels : couple toujours assorti). */
export async function extractBulkItemPair(
  jobId: string,
  hints: { fileName?: string; passwordFileName?: string; valeur?: string; type?: string },
) {
  const entries = await loadBulkZipEntries(jobId);
  const pdfHint = hints.fileName?.split("/").pop()?.toLowerCase() || "";
  const pwdHint =
    (hints.passwordFileName || (hints.fileName ? passwordFileNameFromPdf(hints.fileName) : ""))
      .split("/")
      .pop()
      ?.toLowerCase() || "";
  const valeur = (hints.valeur || "").trim().toLowerCase();
  const type = (hints.type || "").trim().toLowerCase();

  let pdf = pdfHint ? entries.find((entry) => entry.name.toLowerCase() === pdfHint) : undefined;
  if (!pdf && valeur) {
    pdf = entries.find(
      (entry) =>
        /\.pdf$/i.test(entry.name) &&
        entry.name.toLowerCase().includes(valeur) &&
        (!type || entry.name.toLowerCase().includes(type)),
    );
  }

  let password = pwdHint ? entries.find((entry) => entry.name.toLowerCase() === pwdHint) : undefined;
  if (!password && pdf) {
    const derived = passwordFileNameFromPdf(pdf.name).toLowerCase();
    if (derived) password = entries.find((entry) => entry.name.toLowerCase() === derived);
  }
  if (!password && valeur) {
    password = entries.find(
      (entry) =>
        /\.txt$/i.test(entry.name) &&
        /password/i.test(entry.name) &&
        entry.name.toLowerCase().includes(valeur),
    );
  }

  if (!pdf?.data?.length) return null;
  if (!password?.data?.length) {
    return { pdf: { filename: pdf.name, blob: zipEntryBlob(pdf.data) }, password: null };
  }
  return {
    pdf: { filename: pdf.name, blob: zipEntryBlob(pdf.data) },
    password: { filename: password.name, blob: zipEntryBlob(password.data) },
  };
}

export function extractBulkJobId(data: unknown): string {
  if (typeof data === "string" && data.trim()) return data.trim().replace(/^'+|'+$/g, "");
  if (!data || typeof data !== "object") return "";
  const record = data as Record<string, unknown>;
  for (const key of ["reference", "id", "jobId", "bulkSearchId", "bulkId", "uuid", "requestId"]) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) return value.trim().replace(/^'+|'+$/g, "");
  }
  if ("data" in record) return extractBulkJobId(record.data);
  return "";
}

/** Statuts UI alignés Arif (bulk + item). */
export type BulkSearchItemStatus = "waiting" | "pending" | "ready" | "partial" | "error";

export type BulkSearchItem = {
  itemId: string;
  type: string;
  valeur: string;
  dateDebut: string;
  dateFin: string;
  status: BulkSearchItemStatus;
  fileName?: string;
  passwordFileName?: string;
};

/** Ex. L2-msisdn-228…pdf → L2-Password-228….txt (convention API Yas). */
export function passwordFileNameFromPdf(pdfName: string) {
  const base = pdfName.split("/").pop()?.trim() || "";
  if (!base || !/\.pdf$/i.test(base)) return "";
  const swapped = base.replace(/-(msisdn|imei|imsi)-/i, "-Password-").replace(/\.pdf$/i, ".txt");
  return swapped !== base.replace(/\.pdf$/i, ".txt") ? swapped : "";
}

/**
 * Item : PENDING → En Attente, IN_PROGRESS → En Cours, SUCCESS → Terminé, FAILED → Echoué
 * Bulk : COMPLETED_WITH_ERRORS → Terminé avec erreurs (si renvoyé au niveau item)
 */
function bulkItemStatus(raw: string): BulkSearchItemStatus {
  const value = raw.trim().toLowerCase().replace(/[\s-]+/g, "_");
  if (!value) return "waiting";
  if (value === "pending") return "waiting";
  if (value === "in_progress" || /progress|run|process|queue|start/.test(value)) return "pending";
  if (value === "completed_with_errors" || /with_errors|partial/.test(value)) return "partial";
  if (value === "failed" || /fail|error|ko|reject/.test(value)) return "error";
  if (
    value === "success" ||
    value === "completed" ||
    /ready|done|success|complete|ok|finish|generated|available/.test(value)
  ) {
    return "ready";
  }
  if (/pend|wait/.test(value)) return "waiting";
  return "waiting";
}

function bulkItemsArray(data: unknown): Record<string, unknown>[] {
  if (Array.isArray(data)) return objectRows(data);
  if (!data || typeof data !== "object") return [];
  const record = data as Record<string, unknown>;
  for (const key of ["items", "results", "details", "rows", "bulkSearchItems", "data"]) {
    const value = record[key];
    if (Array.isArray(value) && value.length > 0) {
      const rows = objectRows(value);
      if (rows.length > 0) return rows;
    }
  }
  return asRecords(data);
}

export function parseBulkSearchItems(data: unknown): BulkSearchItem[] {
  const rows = bulkItemsArray(data);
  if (rows.length === 0) return [];

  return rows.map((row, index) => {
    const flat = flattenRow(row);
    const statusRaw =
      field(flat, ["status", "state", "itemStatus", "processingStatus"]) ||
      (field(flat, ["pdfFileName", "fileName", "filename"]) ? "SUCCESS" : "IN_PROGRESS");
    // itemId = id API (nombre ou chaîne, ex. 12dcsampt…-526db)
    const itemIdRaw = field(flat, ["id", "itemId", "item_id"]).trim();
    const fileName = field(flat, ["pdfFileName", "fileName", "filename", "fichier", "name"]) || undefined;
    const passwordFileName =
      field(flat, [
        "passwordFileName",
        "passwordFilename",
        "passwordFile",
        "fichier_mot_de_passe",
        "passwordTxt",
      ]) ||
      (fileName ? passwordFileNameFromPdf(fileName) : "") ||
      undefined;
    return {
      itemId: itemIdRaw || String(index + 1),
      type: field(flat, ["type", "searchType", "keywordSearchBy"]).toLowerCase(),
      valeur: field(flat, ["valeur", "value", "searchValue", "msisdn", "imei", "imsi"]),
      dateDebut: field(flat, ["dateDebut", "date_debut", "startDate", "start"]),
      dateFin: field(flat, ["dateFin", "date_fin", "endDate", "end"]),
      status: bulkItemStatus(statusRaw),
      fileName,
      passwordFileName: passwordFileName || undefined,
    };
  });
}

export function isBulkSearchComplete(data: unknown) {
  if (!data || typeof data !== "object") return false;
  const record = data as Record<string, unknown>;
  const statusValue = record.status ?? record.state ?? record.jobStatus ?? record.processingStatus ?? "";
  const status =
    typeof statusValue === "string"
      ? statusValue.toLowerCase().replace(/[\s-]+/g, "_")
      : typeof statusValue === "object" && statusValue
        ? String((statusValue as Record<string, unknown>).message ?? (statusValue as Record<string, unknown>).code ?? "")
            .toLowerCase()
            .replace(/[\s-]+/g, "_")
        : "";
  // Bulk : PENDING / IN_PROGRESS → continuer ; COMPLETED / COMPLETED_WITH_ERRORS / FAILED → stop
  if (status === "pending" || status === "in_progress") return false;
  if (status === "failed" || (/fail|error/.test(status) && !/success|completed/.test(status))) return true;
  if (
    status === "completed" ||
    status === "completed_with_errors" ||
    /ready|done|success|complete|finish/.test(status)
  ) {
    return true;
  }
  if (record.filesAvailable === true) return true;
  const progress = Number(record.progress);
  if (Number.isFinite(progress) && progress >= 100) return true;
  const items = parseBulkSearchItems(data);
  return (
    items.length > 0 &&
    items.every((item) => item.status === "ready" || item.status === "error" || item.status === "partial")
  );
}

function objectRows(value: unknown): Record<string, unknown>[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item) => item && typeof item === "object" && !Array.isArray(item)) as Record<string, unknown>[];
}

export function asRecords(data: unknown) {
  const direct = objectRows(data);
  if (direct.length > 0) return direct;
  let best: Record<string, unknown>[] = [];

  function walk(value: unknown) {
    const rows = objectRows(value);
    if (rows.length > best.length) best = rows;
    if (!value || typeof value !== "object") return;
    for (const child of Object.values(value as Record<string, unknown>)) walk(child);
  }

  walk(data);
  return best;
}

function normKey(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function isEmptyValue(value: unknown) {
  if (value == null) return true;
  if (typeof value === "object") return false;
  const text = String(value).trim();
  return !text || text.toUpperCase() === "N/A";
}

export function flattenRow(row: Record<string, unknown>) {
  const flat: Record<string, unknown> = {};

  function put(key: string, value: unknown) {
    if (isEmptyValue(value) && !isEmptyValue(flat[key])) return;
    flat[key] = value;
  }

  function merge(source: Record<string, unknown>) {
    for (const [key, value] of Object.entries(source)) put(key, value);
  }

  for (const [key, value] of Object.entries(row)) {
    if (Array.isArray(value)) {
      const objectItem = value.find((item) => item && typeof item === "object" && !Array.isArray(item));
      if (objectItem) merge(flattenRow(objectItem as Record<string, unknown>));
      else if (value.length > 0 && typeof value[0] !== "object") {
        put(key, value.map((item) => String(item).trim()).filter(Boolean).join(", "));
      }
    } else if (value && typeof value === "object") {
      merge(flattenRow(value as Record<string, unknown>));
    } else {
      put(key, value);
    }
  }
  return flat;
}

export function field(row: Record<string, unknown>, keys: string[]) {
  const entries = Object.entries(row);
  for (const key of keys) {
    const wanted = normKey(key);
    const found = entries.find(([name]) => normKey(name) === wanted);
    if (!found || found[1] == null || typeof found[1] === "object") continue;
    const value = String(found[1]).trim();
    if (value) return value;
  }
  return "";
}
