export const NAV_ITEMS = [
  { href: "/accueil", label: "Accueil", icon: "home" },
  { href: "/appels", label: "Appels Détaillés", icon: "phone" },
  { href: "/identite", label: "Identités", icon: "user" },
  { href: "/identification", label: "Identification", icon: "scan" },
  { href: "/tmoney", label: "Mixx by Yas", icon: "dollar" },
  { href: "/traitement", label: "Traitements", icon: "file" },
  { href: "/ftth-login", label: "FTTH Login", icon: "login" },
] as const;

export const BREADCRUMBS: Record<string, { label: string; href: string }> = {
  "/accueil": { label: "Accueil", href: "/accueil" },
  "/appels": { label: "Appels Détaillés", href: "/appels" },
  "/identite": { label: "Identités", href: "/identite" },
  "/identification": { label: "Identités", href: "/identite" },
  "/tmoney": { label: "Transactions Mixx by Yas", href: "/tmoney" },
  "/traitement": { label: "Traitement en masse", href: "/traitement" },
  "/ftth-login": { label: "FTTH-login", href: "/ftth-login" },
};
