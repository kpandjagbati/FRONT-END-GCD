const EMPTY = "—";

function displayValue(value?: string) {
  const trimmed = value?.trim();
  if (!trimmed || trimmed.toUpperCase() === "N/A") return EMPTY;
  return trimmed;
}

export function formatDateTime(value?: string) {
  const raw = displayValue(value);
  if (raw === EMPTY) return EMPTY;

  const iso = raw.match(/^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}:\d{2}:\d{2}))?$/);
  if (iso) {
    const [, year, month, day, time] = iso;
    return formatParts(day, month, year, time);
  }

  const french = raw.match(/^(\d{2})[/-](\d{2})[/-](\d{4})(?:[ T](\d{2}:\d{2}:\d{2}))?$/);
  if (french) {
    const [, day, month, year, time] = french;
    return formatParts(day, month, year, time);
  }

  return raw;
}

function formatParts(day: string, month: string, year: string, time?: string) {
  const date = `${day}/${month}/${year}`;
  return time ? `${date} · ${time}` : date;
}

export function isoToFrenchDate(iso?: string) {
  const match = iso?.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return "";
  const [, year, month, day] = match;
  return `${day}/${month}/${year}`;
}

export function frenchDateToIso(value?: string) {
  const match = value?.trim().match(/^(\d{2})[/-](\d{2})[/-](\d{4})$/);
  if (!match) return "";
  const [, day, month, year] = match;
  return `${year}-${month}-${day}`;
}
