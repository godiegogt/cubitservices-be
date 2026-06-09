import { Prisma } from "@prisma/client";

export function formatDateOnly(date: Date): string {
    return date.toISOString().slice(0, 10);
}

export function decimalToNumber(value: Prisma.Decimal): number {
    return value.toNumber();
}
