export function toNumber(value: string | number | { toNumber(): number }): number {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') return parseFloat(value);
    return value.toNumber();
}

export function toDateString(date: Date): string {
    return date.toISOString().split('T')[0];
}