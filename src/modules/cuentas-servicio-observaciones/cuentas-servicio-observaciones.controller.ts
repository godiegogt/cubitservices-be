import { Request, Response } from "express";
import {
    createObservacionSchema,
    updateObservacionSchema,
} from "./cuentas-servicio-observaciones.schemas";
import {
    createObservacionService,
    deleteObservacionService,
    getObservacionService,
    listObservacionesService,
    updateObservacionService,
} from "./cuentas-servicio-observaciones.service";

export async function listObservacionesHandler(req: Request, res: Response) {
    try {
    const empresaId = req.auth!.empresaId;
    const { cuentaServicioId } = req.params;

    const data = await listObservacionesService(cuentaServicioId, empresaId);

    return res.json({
        success: true,
        message: "Observaciones obtenidas correctamente",
        data,
    });
    } catch (error) {
    return res.status(404).json({
        success: false,
        message:
        error instanceof Error ? error.message : "Error obteniendo observaciones",
    });
    }
}

export async function getObservacionHandler(req: Request, res: Response) {
    try {
    const empresaId = req.auth!.empresaId;
    const { cuentaServicioId, observacionId } = req.params;

    const data = await getObservacionService(cuentaServicioId, empresaId, observacionId);

    return res.json({
        success: true,
        message: "Observación obtenida correctamente",
        data,
    });
    } catch (error) {
    return res.status(404).json({
        success: false,
        message:
        error instanceof Error ? error.message : "Error obteniendo observación",
    });
    }
}

export async function createObservacionHandler(req: Request, res: Response) {
    try {
    const { empresaId, nombres, apellidos } = req.auth!;
    const { cuentaServicioId } = req.params;
    const parsed = createObservacionSchema.parse(req.body);

    const createdBy =
        parsed.createdBy ?? `${nombres} ${apellidos}`.trim();

    const data = await createObservacionService(cuentaServicioId, empresaId, {
        ...parsed,
        createdBy,
    });

    return res.status(201).json({
        success: true,
        message: "Observación creada correctamente",
        data,
    });
    } catch (error) {
    return res.status(400).json({
        success: false,
        message:
        error instanceof Error ? error.message : "Error creando observación",
    });
    }
}

export async function updateObservacionHandler(req: Request, res: Response) {
    try {
    const { empresaId, nombres, apellidos } = req.auth!;
    const { cuentaServicioId, observacionId } = req.params;
    const parsed = updateObservacionSchema.parse(req.body);

    const updatedBy =
        parsed.updatedBy ?? `${nombres} ${apellidos}`.trim();

    const data = await updateObservacionService(
        cuentaServicioId,
        empresaId,
        observacionId,
        {
            ...parsed,
            updatedBy: updatedBy
        }
    );

    return res.json({
        success: true,
        message: "Observación actualizada correctamente",
        data,
    });
    } catch (error) {
    return res.status(400).json({
        success: false,
        message:
        error instanceof Error ? error.message : "Error actualizando observación",
    });
    }
}

export async function deleteObservacionHandler(req: Request, res: Response) {
    try {
    const empresaId = req.auth!.empresaId;
    const { cuentaServicioId, observacionId } = req.params;

    await deleteObservacionService(cuentaServicioId, empresaId, observacionId);

    return res.json({
        success: true,
        message: "Observación eliminada correctamente",
        data: null,
    });
    } catch (error) {
    return res.status(404).json({
        success: false,
        message:
        error instanceof Error ? error.message : "Error eliminando observación",
    });
    }
}