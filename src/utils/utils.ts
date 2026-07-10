import { Prisma } from "@prisma/client";

export function parseDateOnly(value: string) {
    return new Date(`${value}T00:00:00.000Z`);
}

export function formatDateOnly(date: Date): string {
    return date.toISOString().slice(0, 10);
}

export function getDefaultDateRange() {
    const now = new Date();
    const desde = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1));
    const hasta = new Date(Date.UTC(now.getFullYear(), now.getMonth() + 1, 0));
    return { desde, hasta };
}

export function toNumber(value: Prisma.Decimal | number): number {
    if (value instanceof Prisma.Decimal) return value.toNumber();
    return value;
}