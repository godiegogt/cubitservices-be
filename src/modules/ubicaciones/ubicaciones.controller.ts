import { Request, Response } from "express";
import {
    createUbicacionSchema,
    updateUbicacionEstadoSchema,
    updateUbicacionSchema,
} from "./ubicacion.schemas";
import {
    createUbicacionService,
    getUbicacionesService,
    updateUbicacionEstadoService,
    updateUbicacionService,
} from "./ubicaciones.service";

export async function listUbicaciones(req: Request, res: Response) {
    try {
    const empresaId = req.auth!.empresaId;
    const { clienteId } = req.params;

    const ubicaciones = await getUbicacionesService(clienteId, empresaId);

    return res.json({
        success: true,
        message: "Ubicaciones obtenidas correctamente",
        data: ubicaciones,
    });
    } catch (error) {
    return res.status(404).json({
        success: false,
        message: error instanceof Error ? error.message : "Error obteniendo ubicaciones",
    });
    }
}

export async function createUbicacionHandler(req: Request, res: Response) {
    try {
    const empresaId = req.auth!.empresaId;
    const { clienteId } = req.params;
    const parsed = createUbicacionSchema.parse(req.body);

    const ubicacion = await createUbicacionService(clienteId, empresaId, parsed);

    return res.status(201).json({
        success: true,
        message: "Ubicación creada correctamente",
        data: ubicacion,
    });
    } catch (error) {
    return res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : "Error creando ubicación",
    });
    }
}

export async function updateUbicacionHandler(req: Request, res: Response) {
    try {
    const empresaId = req.auth!.empresaId;
    const { clienteId, id } = req.params;
    const parsed = updateUbicacionSchema.parse(req.body);

    const ubicacion = await updateUbicacionService(id, clienteId, empresaId, parsed);

    return res.json({
        success: true,
        message: "Ubicación actualizada correctamente",
        data: ubicacion,
    });
    } catch (error) {
    return res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : "Error actualizando ubicación",
    });
    }
}

export async function updateUbicacionEstadoHandler(req: Request, res: Response) {
    try {
    const empresaId = req.auth!.empresaId;
    const { clienteId, id } = req.params;
    const parsed = updateUbicacionEstadoSchema.parse(req.body);

    const ubicacion = await updateUbicacionEstadoService(
        id,
        clienteId,
        empresaId,
        parsed.estado
    );

    return res.json({
        success: true,
        message: "Estado de la ubicación actualizado correctamente",
        data: ubicacion,
    });
    } catch (error) {
    return res.status(400).json({
        success: false,
        message:
        error instanceof Error ? error.message : "Error actualizando estado de la ubicación",
    });
    }
}