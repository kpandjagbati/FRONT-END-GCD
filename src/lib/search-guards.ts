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

export function validateMsisdnWithCountry(value: string, label = "numéro") {
  const digits = calledNumberDigits(value);
  if (!digits) return `Renseignez le ${label}.`;
  if (!digits.startsWith("228") || digits.length < 11) {
    return `Le ${label} doit commencer par l'indicatif du pays (228).`;
  }
  return null;
}

export function validateCalledNumber(value: string) {
  return validateMsisdnWithCountry(value, "numéro appelé");
}

export function validateCallerNumber(value: string) {
  return validateMsisdnWithCountry(value, "numéro");
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
