const USERNAME_KEY = "gcd-username";
const PASSWORD_KEY = "gcd-password";
const SESSION_EVENT = "gcd-session";

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
  return sessionStorage.getItem(USERNAME_KEY) || "";
}

export function getSessionDisplayName() {
  const username = getSessionUsername().trim();
  const base = username.includes("@") ? username.slice(0, username.indexOf("@")) : username;
  const cleaned = base.replace(/[._-]+/g, " ").trim();
  if (!cleaned) return "";
  return cleaned
    .split(/\s+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

export function getSessionEmail() {
  const username = getSessionUsername().trim();
  if (!username) return "utilisateur@yas.tg";
  return username.includes("@") ? username : `${username}@yas.tg`;
}

export function resolvePdfMailAddress(typedEmail: string) {
  return typedEmail.trim() || getSessionEmail();
}

export function getSessionPassword() {
  if (typeof window === "undefined") return "";
  return sessionStorage.getItem(PASSWORD_KEY) ?? "";
}

export function clearSession() {
  sessionStorage.removeItem(USERNAME_KEY);
  sessionStorage.removeItem(PASSWORD_KEY);
  emitSession();
}

export function logoutSession() {
  clearSession();
  window.location.assign("/");
}
