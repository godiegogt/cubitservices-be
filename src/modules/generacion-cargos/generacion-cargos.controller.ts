import { Request, Response } from "express";
import { ZodError } from "zod";
import { CargoDuplicadoError } from "../cargos/cargos.errors";
import {
  generarCargosSchema,
  getCargosGeneradosQuerySchema,
  getDetallesQuerySchema,
  getEjecucionesQuerySchema,
  previewQuerySchema,
} from "./generacion-cargos.schemas";
import {
  getCargosGeneradosService,
  getDetallesService,
  getEjecucionByIdService,
  getEjecucionesService,
  getPreviewService,
  iniciarGeneracionCargosService,
} from "./generacion-cargos.service";

const ERRORES_NO_ENCONTRADO = ["Ejecución no encontrada"];

function handleGeneracionCargosError(
  res: Response,
  error: unknown,
  defaultMessage: string
) {
  if (error instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: "Datos de entrada inválidos",
      errors: error.issues,
    });
  }

  if (error instanceof CargoDuplicadoError) {
    return res.status(409).json({ success: false, message: error.message });
  }

  if (error instanceof Error && ERRORES_NO_ENCONTRADO.includes(error.message)) {
    return res.status(404).json({ success: false, message: error.message });
  }

  console.error(defaultMessage, error);

  return res.status(500).json({ success: false, message: defaultMessage });
}

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
    return handleGeneracionCargosError(
      res,
      error,
      "Error obteniendo previsualización"
    );
  }
}

export async function generarCargosHandler(req: Request, res: Response) {
  try {
    const empresaId = req.auth!.empresaId;
    const usuarioId = req.auth!.userId;
    const parsed = generarCargosSchema.parse(req.body);

    const ejecucion = await iniciarGeneracionCargosService({
      empresaId,
      usuarioId,
      periodo: parsed.periodo,
    });

    return res.status(202).json({
      success: true,
      message: "Generación de cargos iniciada",
      data: ejecucion,
    });
  } catch (error) {
    return handleGeneracionCargosError(res, error, "Error generando cargos");
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
    return handleGeneracionCargosError(
      res,
      error,
      "Error obteniendo ejecuciones"
    );
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
    return handleGeneracionCargosError(res, error, "Error obteniendo ejecución");
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
    return handleGeneracionCargosError(res, error, "Error obteniendo detalle");
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
    return handleGeneracionCargosError(
      res,
      error,
      "Error obteniendo cargos generados"
    );
  }
}
