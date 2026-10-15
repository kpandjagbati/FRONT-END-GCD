/** Empêche les redirections ouvertes (uniquement chemins internes). */
export function safeNextPath(raw: string | null | undefined) {
  if (!raw) return null;
  let path = raw.trim();
  try {
    path = decodeURIComponent(path);
  } catch {
    return null;
  }
  if (!path.startsWith("/") || path.startsWith("//") || path.includes("://")) return null;
  if (path === "/" || path.startsWith("/?")) return null;
  return path;
}
