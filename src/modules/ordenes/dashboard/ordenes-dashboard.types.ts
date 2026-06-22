export interface RawOrdenRow {
    id: string;
    numeroOrden: string;
    titulo: string;
    estado: string;
    prioridad: string;
    fechaProgramada: Date | null;
    cliente: { nombreRazonSocial: string };
    tipoServicio: { nombre: string };
    ubicacion: { zona: number | null };
    asignaciones: {
        usuario: { nombres: string; apellidos: string | null };
    }[];
}
