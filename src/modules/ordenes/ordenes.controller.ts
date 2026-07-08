import { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import {
  createOrdenSchema,
  listOrdenesQuerySchema,
  updateOrdenSchema,
  updateOrdenStatusSchema,
} from "./ordenes.schemas";
import {
  createOrdenService,
  getOrdenByIdService,
  getOrdenes,
  getOrdenesSelectService,
  getOrdenEstadosService,
  updateOrdenService,
  updateOrdenStatusService,
} from "./ordenes.service";
import { z } from "zod";

function handleCommonErrors(error: unknown, res: Response): boolean {
  if (error instanceof Prisma.PrismaClientInitializationError) {
    res.status(503).json({
      success: false,
      message: "Servicio no disponible, intente más tarde",
    });
    return true;
  }
  return false;
}

export async function listOrdenes(req: Request, res: Response) {
  try {
    if (!req.auth) {
      return res.status(401).json({ success: false, message: "No autenticado" });
    }
    const empresaId = req.auth.empresaId;
    const page  = Math.max(1, parseInt(req.query.page  as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const parsedQuery = listOrdenesQuerySchema.parse(req.query);
    const result = await getOrdenes(empresaId, page, limit, parsedQuery);

    return res.json({
      success: true,
      message: "Ordenes de servicio obtenidas correctamente",
      data: result.data,
      meta: result.meta,
    });
  } catch (error) {
    if (handleCommonErrors(error, res)) return;
    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Error obteniendo ordenes de servicio",
    });
  }
}

export async function getOrdenHandler(req: Request, res: Response) {
  try {
    if (!req.auth) {
      return res.status(401).json({ success: false, message: "No autenticado" });
    }
    const empresaId = req.auth.empresaId;
    const { id } = req.params;

    const orden = await getOrdenByIdService(id, empresaId);

    return res.json({
      success: true,
      message: "Orden de servicio obtenida correctamente",
      data: orden,
    });
  } catch (error) {
    if (handleCommonErrors(error, res)) return;
    return res.status(404).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Error obteniendo orden de servicio",
    });
  }
}

export async function createOrdenHandler(req: Request, res: Response) {
  try {
    if (!req.auth) {
      return res.status(401).json({ success: false, message: "No autenticado" });
    }
    const empresaId = req.auth.empresaId;
    const usuarioId = req.auth.userId;
    const parsed = createOrdenSchema.parse(req.body);

    const orden = await createOrdenService({
      empresaId,
      usuarioId,
      ...parsed,
    });

    return res.status(201).json({
      success: true,
      message: "Orden de servicio creada correctamente",
      data: orden,
    });
  } catch (error) {
    if (handleCommonErrors(error, res)) return;
    return res.status(400).json({
      success: false,
      message:
        error instanceof Error ? error.message : "Error creando orden de servicio",
    });
  }
}

export async function updateOrdenHandler(req: Request, res: Response) {
  try {
    if (!req.auth) {
      return res.status(401).json({ success: false, message: "No autenticado" });
    }
    const empresaId = req.auth.empresaId;
    const { id } = req.params;
    const parsed = updateOrdenSchema.parse(req.body);

    const orden = await updateOrdenService(id, empresaId, parsed);

    return res.json({
      success: true,
      message: "Orden de servicio actualizada correctamente",
      data: orden,
    });
  } catch (error) {
    if (handleCommonErrors(error, res)) return;
    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Error actualizando orden de servicio",
    });
  }
}

export async function updateOrdenStatusHandler(req: Request, res: Response) {
  try {
    if (!req.auth) {
      return res.status(401).json({ success: false, message: "No autenticado" });
    }
    const empresaId = req.auth.empresaId;
    const usuarioId = req.auth.userId;
    const { id } = req.params;
    const parsed = updateOrdenStatusSchema.parse(req.body);

    const orden = await updateOrdenStatusService(id, empresaId, usuarioId, parsed);

    return res.json({
      success: true,
      message: "Estado de la orden de servicio actualizado correctamente",
      data: orden,
    });
  } catch (error) {
    if (handleCommonErrors(error, res)) return;
    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Error actualizando estado de la orden de servicio",
    });
  }
}

export async function listOrdenEstados(req: Request, res: Response) {
  try {
    if (!req.auth) {
      return res.status(401).json({ success: false, message: "No autenticado" });
    }
    const empresaId = req.auth.empresaId;
    const { id } = req.params;

    const estados = await getOrdenEstadosService(id, empresaId);

    return res.json({
      success: true,
      message: "Historial de estados obtenido correctamente",
      data: estados,
    });
  } catch (error) {
    if (handleCommonErrors(error, res)) return;
    return res.status(404).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Error obteniendo historial de estados",
    });
  }
}

const listOrdenesSelectQuerySchema = z.object({
  search: z.string().min(1).optional(),
});

export async function listOrdenesSelectHandler(req: Request, res: Response) {
  try {
    if (!req.auth) {
      return res.status(401).json({ success: false, message: "No autenticado" });
    }
    const empresaId = req.auth.empresaId;
    const { cuentaServicioId } = req.params;
    const { search } = listOrdenesSelectQuerySchema.parse(req.query);

    const ordenes = await getOrdenesSelectService(empresaId, { search, cuentaServicioId });

    return res.json({
      success: true,
      message: "Ordenes de servicio obtenidas correctamente",
      data: ordenes,
    });
  } catch (error) {
    if (handleCommonErrors(error, res)) return;
    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Error obteniendo ordenes de servicio",
    });
  }
}