import { Request, Response } from "express";
import {
  applyPagoSchema,
  createPagoSchema,
  getPagosQuerySchema,
  updatePagoStatusSchema,
} from "./pagos.schemas";
import {
  applyPagoService,
  createPagoService,
  getPagoByIdService,
  getPagosService,
  updatePagoStatusService,
} from "./pagos.service";

export async function listPagos(req: Request, res: Response) {
  try {
    const empresaId = req.auth!.empresaId;
    const parsedQuery = getPagosQuerySchema.parse(req.query);
    const pagos = await getPagosService(empresaId, parsedQuery);

    return res.json({
      success: true,
      message: "Pagos obtenidos correctamente",
      data: pagos,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : "Error obteniendo pagos",
    });
  }
}

export async function getPagoHandler(req: Request, res: Response) {
  try {
    const empresaId = req.auth!.empresaId;
    const { id } = req.params;
    const pago = await getPagoByIdService(id, empresaId);

    return res.json({
      success: true,
      message: "Pago obtenido correctamente",
      data: pago,
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: error instanceof Error ? error.message : "Error obteniendo pago",
    });
  }
}

export async function createPagoHandler(req: Request, res: Response) {
  try {
    const empresaId = req.auth!.empresaId;
    const userId = req.auth!.userId;
    const parsed = createPagoSchema.parse(req.body);

    const pago = await createPagoService({
      empresaId,
      userId,
      ...parsed,
    });

    return res.status(201).json({
      success: true,
      message: "Pago registrado correctamente",
      data: pago,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : "Error registrando pago",
    });
  }
}

export async function updatePagoStatusHandler(req: Request, res: Response) {
  try {
    const empresaId = req.auth!.empresaId;
    const { id } = req.params;
    const parsed = updatePagoStatusSchema.parse(req.body);
    const pago = await updatePagoStatusService(id, empresaId, parsed);

    return res.json({
      success: true,
      message: "Estado del pago actualizado correctamente",
      data: pago,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Error actualizando estado del pago",
    });
  }
}

export async function applyPagoHandler(req: Request, res: Response) {
  try {
    const empresaId = req.auth!.empresaId;
    const { id } = req.params;
    const parsed = applyPagoSchema.parse(req.body);
    const pago = await applyPagoService(id, empresaId, parsed);

    return res.json({
      success: true,
      message: "Pago aplicado correctamente",
      data: pago,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : "Error aplicando pago",
    });
  }
}
