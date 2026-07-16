import { Prisma } from "@prisma/client";
const GUATEMALA_TIME_ZONE = "America/Guatemala";

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: GUATEMALA_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function formatDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10);
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

export function startOfDay(dateStr: string): Date {
  return new Date(`${dateStr}T00:00:00.000Z`);
}

export function endOfDay(dateStr: string): Date {
  return new Date(`${dateStr}T23:59:59.999Z`);
}

export function decimalToNumber(value: Prisma.Decimal): number {
    return value.toNumber();
}