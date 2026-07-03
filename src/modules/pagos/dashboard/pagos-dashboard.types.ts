import { EstadoPago } from "@prisma/client";

export interface RawPagoReciente {
    id: string;
    fechaRegistro: Date;
    montoTotal: { toString(): string };
    referencia: string | null;
    estado: EstadoPago;
    metodoPago: { nombre: string };
    cliente: { nombreRazonSocial: string };
    registradoBy: { nombres: string; apellidos: string | null };
}
