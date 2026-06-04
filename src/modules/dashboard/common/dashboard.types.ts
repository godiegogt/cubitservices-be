export interface MetodoPagoTotal {
    metodo: string;
    total: number;
}

export interface RawPagoDia {
    id: string;
    fechaPago: Date;
    montoTotal: string | number;
    metodoPago: { nombre: string };
    cliente: { nombre: string };
    registradoBy: { nombre: string };
}