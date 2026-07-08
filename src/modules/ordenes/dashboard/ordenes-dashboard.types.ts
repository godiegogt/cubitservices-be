import { EstadoOrdenServicio, PrioridadOrden } from "@prisma/client";

export interface RawOrdenRow {
    id: string;
    numeroOrden: string;
    titulo: string;
    estado: EstadoOrdenServicio;
    prioridad: PrioridadOrden;
    fechaProgramada: Date | null;
    cliente: { id: string; nombreRazonSocial: string; telefono: string | null };
    tipoServicio: { id: string; nombre: string };
    ubicacion: { zona: number | null };
    asignaciones: {
        usuario: { id: string; nombres: string; apellidos: string | null };
    }[];
}
