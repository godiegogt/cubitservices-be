export interface RawOrdenRow {
    id: string;
    numeroOrden: string;
    titulo: string;
    estado: "PENDIENTE" | "PROGRAMADA" | "EN_PROCESO" | "PAUSADA" | "FINALIZADA" | "CANCELADA";
    prioridad: "BAJA" | "MEDIA" | "ALTA" | "URGENTE";
    fechaProgramada: Date | null;
    cliente: { nombreRazonSocial: string };
    tipoServicio: { nombre: string };
    ubicacion: { zona: number | null };
    asignaciones: {
        usuario: { nombres: string; apellidos: string | null };
    }[];
}
