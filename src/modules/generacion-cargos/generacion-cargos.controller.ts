import { Request, Response } from "express";
import {
  generarCargosSchema,
  getCargosGeneradosQuerySchema,
  getDetallesQuerySchema,
  getEjecucionesQuerySchema,
  previewQuerySchema,
} from "./generacion-cargos.schemas";
import {
  generarCargosService,
  getCargosGeneradosService,
  getDetallesService,
  getEjecucionByIdService,
  getEjecucionesService,
  getPreviewService,
} from "./generacion-cargos.service";

export async function previewHandler(req: Request, res: Response) {
  try {
    const empresaId = req.auth!.empresaId;
    const parsedQuery = previewQuerySchema.parse(req.query);

    const preview = await getPreviewService(empresaId, parsedQuery.periodo);

    return res.json({
      success: true,
      message: "Previsualización obtenida correctamente",
      data: preview,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message:
        error instanceof Error ? error.message : "Error obteniendo previsualización",
    });
  }
}

export async function generarCargosHandler(req: Request, res: Response) {
  try {
    const empresaId = req.auth!.empresaId;
    const usuarioId = req.auth!.userId;
    const parsed = generarCargosSchema.parse(req.body);

    const ejecucion = await generarCargosService({
      empresaId,
      usuarioId,
      periodo: parsed.periodo,
    });

    return res.status(201).json({
      success: true,
      message: "Generación de cargos finalizada",
      data: ejecucion,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message:
        error instanceof Error ? error.message : "Error generando cargos",
    });
  }
}

export async function listEjecucionesHandler(req: Request, res: Response) {
  try {
    const empresaId = req.auth!.empresaId;
    const parsedQuery = getEjecucionesQuerySchema.parse(req.query);
    const result = await getEjecucionesService(empresaId, parsedQuery);

    return res.json({
      success: true,
      message: "Ejecuciones obtenidas correctamente",
      data: result.data,
      meta: result.meta,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message:
        error instanceof Error ? error.message : "Error obteniendo ejecuciones",
    });
  }
}

export async function getEjecucionHandler(req: Request, res: Response) {
  try {
    const empresaId = req.auth!.empresaId;
    const { id } = req.params;

    const ejecucion = await getEjecucionByIdService(id, empresaId);

    return res.json({
      success: true,
      message: "Ejecución obtenida correctamente",
      data: ejecucion,
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message:
        error instanceof Error ? error.message : "Error obteniendo ejecución",
    });
  }
}

export async function listDetallesHandler(req: Request, res: Response) {
  try {
    const empresaId = req.auth!.empresaId;
    const { id } = req.params;
    const parsedQuery = getDetallesQuerySchema.parse(req.query);

    const result = await getDetallesService(id, empresaId, parsedQuery);

    return res.json({
      success: true,
      message: "Detalle obtenido correctamente",
      data: result.data,
      meta: result.meta,
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message:
        error instanceof Error ? error.message : "Error obteniendo detalle",
    });
  }
}

export async function listCargosGeneradosHandler(req: Request, res: Response) {
  try {
    const empresaId = req.auth!.empresaId;
    const { id } = req.params;
    const parsedQuery = getCargosGeneradosQuerySchema.parse(req.query);

    const result = await getCargosGeneradosService(id, empresaId, parsedQuery);

    return res.json({
      success: true,
      message: "Cargos generados obtenidos correctamente",
      data: result.data,
      meta: result.meta,
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message:
        error instanceof Error ? error.message : "Error obteniendo cargos generados",
    });
  }
}
