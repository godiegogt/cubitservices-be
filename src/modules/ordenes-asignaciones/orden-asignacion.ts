import { Request, Response } from "express";
import {
  createAsignacionSchema,
  updateAsignacionEstadoSchema,
} from "./orden-asignacion.schemas";
import {
  createAsignacionService,
  getAsignacionesService,
  updateAsignacionEstadoService,
} from "./orden-asignacion.service";

export async function listAsignaciones(req: Request, res: Response) {
  try {
    const empresaId = req.auth!.empresaId;
    const { ordenServicioId } = req.params;

    const asignaciones = await getAsignacionesService(ordenServicioId, empresaId);

    return res.json({
      success: true,
      message: "Asignaciones obtenidas correctamente",
      data: asignaciones,
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message:
        error instanceof Error ? error.message : "Error obteniendo asignaciones",
    });
  }
}

export async function createAsignacionHandler(req: Request, res: Response) {
  try {
    const empresaId = req.auth!.empresaId;
    const asignadoPor = req.auth!.userId;
    const { ordenServicioId } = req.params;
    const parsed = createAsignacionSchema.parse(req.body);

    const asignacion = await createAsignacionService(
      ordenServicioId,
      empresaId,
      asignadoPor,
      parsed
    );

    return res.status(201).json({
      success: true,
      message: "Encargado asignado correctamente",
      data: asignacion,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : "Error asignando encargado",
    });
  }
}

export async function updateAsignacionEstadoHandler(req: Request, res: Response) {
  try {
    const empresaId = req.auth!.empresaId;
    const { ordenServicioId, id } = req.params;
    const parsed = updateAsignacionEstadoSchema.parse(req.body);

    const asignacion = await updateAsignacionEstadoService(
      ordenServicioId,
      id,
      empresaId,
      parsed
    );

    return res.json({
      success: true,
      message: "Asignación actualizada correctamente",
      data: asignacion,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message:
        error instanceof Error ? error.message : "Error actualizando asignación",
    });
  }
}
