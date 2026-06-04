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