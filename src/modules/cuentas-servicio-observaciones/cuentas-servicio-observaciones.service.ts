import { randomUUID } from "crypto";
import {
    CreateObservacionDto,
    Observacion,
    UpdateObservacionDto,
} from "./cuentas-servicio-observaciones.schemas";
import {
    findCuentaServicioObservaciones,
    updateObservaciones,
} from "./cuentas-servicio-observaciones.repository";

async function getCuentaYObservaciones(
    cuentaServicioId: string,
    empresaId: string
): Promise<Observacion[]> {
    const cuenta = await findCuentaServicioObservaciones(cuentaServicioId);

    if (!cuenta || cuenta.empresaId !== empresaId) {
        throw new Error("Cuenta de servicio no encontrada");
    }

    const raw = cuenta.observaciones;

    if (!raw) return [];
    if (Array.isArray(raw)) {
        const observaciones = raw as Observacion[];

        return observaciones.sort((a, b) => {
            const fechaA = new Date(a.updatedAt ?? a.createdAt).getTime();
            const fechaB = new Date(b.updatedAt ?? b.createdAt).getTime();
            return fechaB - fechaA;
        });
    }

    throw new Error("El campo observaciones tiene un formato inválido");
}

export async function listObservacionesService(
    cuentaServicioId: string,
    empresaId: string
): Promise<Observacion[]> {
    return getCuentaYObservaciones(cuentaServicioId, empresaId);
}

export async function getObservacionService(
    cuentaServicioId: string,
    empresaId: string,
    observacionId: string
): Promise<Observacion> {
    const observaciones = await getCuentaYObservaciones(cuentaServicioId, empresaId);
    const obs = observaciones.find((o) => o.id === observacionId);

    if (!obs) {
    throw new Error(`Observación no encontrada`);
    }

    return obs;
}

export async function createObservacionService(
    cuentaServicioId: string,
    empresaId: string,
    dto: CreateObservacionDto
): Promise<Observacion> {
    const observaciones = await getCuentaYObservaciones(cuentaServicioId, empresaId);

    const nueva: Observacion = {
    id: randomUUID(),
    texto: dto.texto,
    createdBy: dto.createdBy,
    createdAt: new Date().toISOString(),
    };

    await updateObservaciones(cuentaServicioId, [...observaciones, nueva]);

    return nueva;
}

export async function updateObservacionService(
    cuentaServicioId: string,
    empresaId: string,
    observacionId: string,
    dto: UpdateObservacionDto
): Promise<Observacion> {
    const observaciones = await getCuentaYObservaciones(cuentaServicioId, empresaId);

    const index = observaciones.findIndex((o) => o.id === observacionId);

    if (index === -1) {
    throw new Error("Observación no encontrada");
    }

    const actualizada: Observacion = {
    ...observaciones[index],
    texto: dto.texto,
    updatedBy: dto.updatedBy,
    updatedAt: new Date().toISOString(),
    };

    const nuevasObservaciones = [...observaciones];
    nuevasObservaciones[index] = actualizada;

    await updateObservaciones(cuentaServicioId, nuevasObservaciones);

    return actualizada;
}

export async function deleteObservacionService(
    cuentaServicioId: string,
    empresaId: string,
    observacionId: string
): Promise<void> {
    const observaciones = await getCuentaYObservaciones(cuentaServicioId, empresaId);

    const existe = observaciones.some((o) => o.id === observacionId);

    if (!existe) {
    throw new Error("Observación no encontrada");
    }

    await updateObservaciones(
    cuentaServicioId,
    observaciones.filter((o) => o.id !== observacionId)
    );
}