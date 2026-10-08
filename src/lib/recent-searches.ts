export type RecentSearch = {
  id: string;
  module: string;
  href: string;
  summary: string;
  payload: Record<string, string>;
};

const LIST_KEY = "gcd-recent-searches";
const PREFILL_KEY = "gcd-search-prefill";
const EVENT = "gcd-recent-searches";
const PREFILL_EVENT = "gcd-prefill";
const LIMIT = 30;

const EMPTY: RecentSearch[] = [];
let cachedRaw = "";
let cachedList: RecentSearch[] = EMPTY;

const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
  window.dispatchEvent(new Event(EVENT));
}

export function subscribeRecentSearches(onStoreChange: () => void) {
  listeners.add(onStoreChange);
  window.addEventListener(EVENT, onStoreChange);
  window.addEventListener("storage", onStoreChange);
  queueMicrotask(onStoreChange);
  return () => {
    listeners.delete(onStoreChange);
    window.removeEventListener(EVENT, onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

export function getRecentSearches(): RecentSearch[] {
  if (typeof window === "undefined") return EMPTY;
  const raw = sessionStorage.getItem(LIST_KEY) || "[]";
  if (raw === cachedRaw) return cachedList;
  cachedRaw = raw;
  try {
    const parsed = JSON.parse(raw) as RecentSearch[];
    cachedList = Array.isArray(parsed) ? parsed : EMPTY;
  } catch {
    cachedList = EMPTY;
  }
  return cachedList;
}

export function getRecentSearchesSnapshot() {
  return EMPTY;
}

export function rememberSearch(entry: Omit<RecentSearch, "id">) {
  const next: RecentSearch = { ...entry, id: `${Date.now()}` };
  const previous = getRecentSearches().filter(
    (item) => !(item.module === next.module && item.summary === next.summary),
  );
  sessionStorage.setItem(LIST_KEY, JSON.stringify([next, ...previous].slice(0, LIMIT)));
  emit();
}

export function stagePrefill(entry: RecentSearch) {
  sessionStorage.setItem(PREFILL_KEY, JSON.stringify(entry));
  window.dispatchEvent(new CustomEvent(PREFILL_EVENT, { detail: entry.module }));
}

export function subscribePrefill(module: string, onPrefill: () => void) {
  function handler(event: Event) {
    if ((event as CustomEvent<string>).detail !== module) return;
    onPrefill();
  }
  window.addEventListener(PREFILL_EVENT, handler);
  return () => window.removeEventListener(PREFILL_EVENT, handler);
}

export function consumePrefill(module: string) {
  const raw = sessionStorage.getItem(PREFILL_KEY);
  if (!raw) return null;
  try {
    const entry = JSON.parse(raw) as RecentSearch;
    if (entry.module !== module) return null;
    sessionStorage.removeItem(PREFILL_KEY);
    return entry.payload;
  } catch {
    sessionStorage.removeItem(PREFILL_KEY);
    return null;
  }
}
