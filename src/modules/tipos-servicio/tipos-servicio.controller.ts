import { Request, Response } from "express";
import {
  createTipoServicioSchema,
  updateTipoServicioSchema,
  updateTipoServicioStatusSchema,
} from "./tipos-servicio.schemas";
import {
  createTipoServicioService,
  getTiposServicio,
  updateTipoServicioService,
  updateTipoServicioStatusService,
} from "./tipos-servicio.service";

export async function listTiposServicio(req: Request, res: Response) {
  try {
    const empresaId = req.auth!.empresaId;
    const tipos = await getTiposServicio(empresaId);

    return res.json({
      success: true,
      message: "Tipos de servicio obtenidos correctamente",
      data: tipos,
    });
  } catch {
    return res.status(500).json({
      success: false,
      message: "Error obteniendo tipos de servicio",
    });
  }
}

export async function createTipoServicioHandler(req: Request, res: Response) {
  try {
    const empresaId = req.auth!.empresaId;
    const parsed = createTipoServicioSchema.parse(req.body);

    const tipo = await createTipoServicioService({
      empresaId,
      ...parsed,
    });

    return res.status(201).json({
      success: true,
      message: "Tipo de servicio creado correctamente",
      data: tipo,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message:
        error instanceof Error ? error.message : "Error creando tipo de servicio",
    });
  }
}

export async function updateTipoServicioHandler(req: Request, res: Response) {
  try {
    const empresaId = req.auth!.empresaId;
    const { id } = req.params;
    const parsed = updateTipoServicioSchema.parse(req.body);

    const tipo = await updateTipoServicioService(id, empresaId, parsed);

    return res.json({
      success: true,
      message: "Tipo de servicio actualizado correctamente",
      data: tipo,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Error actualizando tipo de servicio",
    });
  }
}

export async function updateTipoServicioStatusHandler(
  req: Request,
  res: Response
) {
  try {
    const empresaId = req.auth!.empresaId;
    const { id } = req.params;
    const parsed = updateTipoServicioStatusSchema.parse(req.body);

    const tipo = await updateTipoServicioStatusService(
      id,
      empresaId,
      parsed.estado
    );

    return res.json({
      success: true,
      message: "Estado actualizado correctamente",
      data: tipo,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message:
        error instanceof Error ? error.message : "Error actualizando estado",
    });
  }
}