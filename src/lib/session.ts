/* eslint-disable @next/next/no-location-assign-relative-destination */
const USERNAME_KEY = "gcd-username";
const PASSWORD_KEY = "gcd-password";
const TOKEN_KEY = "gcd-token";
const USER_KEY = "gcd-user";
const SESSION_EVENT = "gcd-session";

export type SessionUser = {
  id?: number;
  username: string;
  email: string;
  firstname: string;
  lastname: string;
  lastConnection: string;
};

const listeners = new Set<() => void>();

function emitSession() {
  listeners.forEach((listener) => listener());
  window.dispatchEvent(new Event(SESSION_EVENT));
}

export function subscribeSession(onStoreChange: () => void) {
  listeners.add(onStoreChange);
  window.addEventListener(SESSION_EVENT, onStoreChange);
  window.addEventListener("storage", onStoreChange);
  return () => {
    listeners.delete(onStoreChange);
    window.removeEventListener(SESSION_EVENT, onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

export function saveSession(username: string, password: string) {
  sessionStorage.setItem(USERNAME_KEY, username.trim());
  sessionStorage.setItem(PASSWORD_KEY, password);
  emitSession();
}

export function getSessionUsername() {
  if (typeof window === "undefined") return "";
  return getSessionUser()?.username || sessionStorage.getItem(USERNAME_KEY) || "";
}

function titleCaseName(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

export function getSessionDisplayName() {
  const user = getSessionUser();
  const fullName = `${user?.firstname ?? ""} ${user?.lastname ?? ""}`.trim();
  if (fullName) return titleCaseName(fullName);

  const username = (user?.username || getSessionUsername()).trim();
  const base = username.includes("@") ? username.slice(0, username.indexOf("@")) : username;
  const cleaned = base.replace(/[._-]+/g, " ").trim();
  if (!cleaned) return "";
  return titleCaseName(cleaned);
}

export function getSessionEmail() {
  const email = getSessionUser()?.email?.trim();
  if (email) return email;
  // Pas d'email inventé : uniquement celui renvoyé par /loginUser.
  return "";
}

export function getSessionPassword() {
  if (typeof window === "undefined") return "";
  return sessionStorage.getItem(PASSWORD_KEY) ?? "";
}

export function saveSessionToken(token: string) {
  sessionStorage.setItem(TOKEN_KEY, token);
  emitSession();
}

export function getSessionToken() {
  if (typeof window === "undefined") return "";
  return sessionStorage.getItem(TOKEN_KEY) ?? "";
}

export function saveSessionUser(user: SessionUser | null) {
  if (!user) {
    sessionStorage.removeItem(USER_KEY);
  } else {
    sessionStorage.setItem(USER_KEY, JSON.stringify(user));
  }
  cachedUserRaw = null;
  cachedUser = null;
  emitSession();
}

let cachedUserRaw: string | null = null;
let cachedUser: SessionUser | null = null;

export function getSessionUser(): SessionUser | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(USER_KEY);
  if (raw === cachedUserRaw) return cachedUser;
  cachedUserRaw = raw;
  if (!raw) {
    cachedUser = null;
    return null;
  }
  try {
    const parsed = JSON.parse(raw) as SessionUser;
    if (!parsed || typeof parsed !== "object" || !parsed.username) {
      cachedUser = null;
      return null;
    }
    cachedUser = {
      id: typeof parsed.id === "number" ? parsed.id : undefined,
      username: String(parsed.username ?? "").trim(),
      email: String(parsed.email ?? "").trim(),
      firstname: String(parsed.firstname ?? "").trim(),
      lastname: String(parsed.lastname ?? "").trim(),
      lastConnection: String(parsed.lastConnection ?? "").trim(),
    };
    return cachedUser;
  } catch {
    cachedUser = null;
    return null;
  }
}

export function clearSession() {
  sessionStorage.removeItem(USERNAME_KEY);
  sessionStorage.removeItem(PASSWORD_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
  cachedUserRaw = null;
  cachedUser = null;
  emitSession();
}

export function logoutSession() {
  clearSession();
  window.location.assign("/");
}
