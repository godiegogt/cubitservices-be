import { PagoDiaRow } from './dashboard.types';

export function formatMonto(value: number): number {
    return parseFloat(value.toFixed(2));
}

export function formatFecha(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    const pad = (n: number) => String(n).padStart(2, '0');

    const year = d.getFullYear();
    const month = pad(d.getMonth() + 1);
    const day = pad(d.getDate());
    const hours = pad(d.getHours());
    const minutes = pad(d.getMinutes());

    return `${year}-${month}-${day} ${hours}:${minutes}`;
}

export function buildDayRange(fecha?: string): { start: Date; end: Date } {
    const base = fecha ? new Date(fecha) : new Date();

    const start = new Date(base);
    start.setHours(0, 0, 0, 0);

    const end = new Date(base);
    end.setHours(23, 59, 59, 999);

    return { start, end };
}

export function toPagoDiaRow(raw: {
    id: string;
    fechaPago: Date | string;
    clienteNombre: string;
    metodoPago: string;
    monto: number | string;
    usuarioNombre: string;
}): PagoDiaRow {
    return {
    id: raw.id,
    fecha: formatFecha(raw.fechaPago),
    cliente: raw.clienteNombre,
    metodoPago: raw.metodoPago,
    monto: formatMonto(Number(raw.monto)),
    usuario: raw.usuarioNombre,
    };
}