import { frenchDateToIso } from "@/lib/format-date";

export function validateRequired(value: string, message: string) {
  if (value.trim()) return null;
  return message;
}

export function calledNumberDigits(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.startsWith("00")) return digits.slice(2);
  return digits;
}

export function validateMsisdn(value: string, label = "numéro") {
  const digits = calledNumberDigits(value);
  if (!digits) return `Renseignez le ${label}.`;
  if (digits.length < 8) {
    return `Le ${label} doit contenir au moins 8 chiffres.`;
  }
  return null;
}

/** Numéro appelé : indicatif pays requis (pas forcément 228). */
export function validateCalledNumber(value: string) {
  const digits = calledNumberDigits(value);
  if (!digits) return "Renseignez le numéro appelé.";
  // Indicatif international : au moins 10 chiffres (indicatif + numéro local).
  if (digits.length < 10) {
    return "Ajouter l'indicatif de votre pays.";
  }
  return null;
}

export function validateCallerNumber(value: string) {
  return validateMsisdn(value, "numéro");
}

export function validatePeriod(debut: string, fin: string) {
  if (!debut.trim() || !fin.trim()) {
    return "Renseignez la date de début et la date de fin.";
  }
  const start = frenchDateToIso(debut);
  const end = frenchDateToIso(fin);
  if (!start || !end) return "Utilisez une date au format jj/mm/aaaa.";
  if (start > end) return "La date de fin doit être après la date de début.";
  return null;
}
