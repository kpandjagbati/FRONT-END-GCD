import { frenchDateToIso } from "@/lib/format-date";
import { calledNumberDigits } from "@/lib/search-guards";
import {
  getSessionPassword,
  getSessionToken,
  getSessionUsername,
  saveSessionToken,
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
  if (/bad username or password/i.test(text)) {
    return "Nom d'utilisateur ou mot de passe incorrect.";
  }
  if (/n'a pas répondu correctement|socket hang up/i.test(text)) {
    return "Le serveur a coupé la connexion avant de répondre.";
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
  // Business envelope (ex. Not found) arrives as HTTP 200 — leave those alone.
  if (typeof envelopeCode === "number") return false;
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
      const token = await loginUser(username, password);
      saveSessionToken(token);
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
  return token;
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

export function bulkSearch(file: File) {
  const body = new FormData();
  body.append("file", file);
  return gcdFetch<unknown>("/get-calls-details/bulk-search", { method: "POST", body });
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
