const GUATEMALA_TIME_ZONE = "America/Guatemala";

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: GUATEMALA_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function formatTime(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: GUATEMALA_TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(date);
}
