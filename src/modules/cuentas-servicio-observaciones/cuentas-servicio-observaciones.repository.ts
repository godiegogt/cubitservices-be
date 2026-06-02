import { Prisma } from "@prisma/client"
import prisma from "../../config/prisma";
import { Observacion } from "./cuentas-servicio-observaciones.schemas";

export async function findCuentaServicioObservaciones(
    id: string
): Promise<{ id: string; empresaId: string; observaciones: unknown } | null> {
    return prisma.cuentaServicio.findUnique({
    where: { id },
    select: { id: true, empresaId: true, observaciones: true },
    });
}

export async function updateObservaciones(
    id: string,
    observaciones: Observacion[]
): Promise<Observacion[]> {
    const updated = await prisma.cuentaServicio.update({
    where: { id },
    data: {  observaciones: observaciones as unknown as Prisma.InputJsonValue },
    select: { observaciones: true },
    });

    return (updated.observaciones ?? []) as unknown as Observacion[];
}