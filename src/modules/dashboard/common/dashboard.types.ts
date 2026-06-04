export interface MetodoPagoTotal {
    metodo: string;
    total: number;
}

export interface RawPagoDia {
    id: string;
    fechaPago: Date;
    montoTotal: { toString(): string };
    metodoPago: { nombre: string };
    cliente: { nombreRazonSocial: string };
    registradoBy: { nombres: string; apellidos: string | null };
}

export interface RawOrdenRow {
    id: string;
    numeroOrden: string;
    titulo: string;
    estado: string;
    prioridad: string;
    fechaProgramada: Date | null;
    cliente: { nombreRazonSocial: string };
    ubicacion: { zona: number | null };
}