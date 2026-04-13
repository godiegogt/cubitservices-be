import { Request, Response } from "express";
import {
  createMetodoPagoSchema,
  updateMetodoPagoSchema,
  updateMetodoPagoStatusSchema,
} from "./metodos-pago.schemas";
import {
  createMetodoPagoService,
  getMetodosPago,
  updateMetodoPagoService,
  updateMetodoPagoStatusService,
} from "./metodos-pago.service";

export async function listMetodosPago(req: Request, res: Response) {
  try {
    const empresaId = req.auth!.empresaId;
    const metodos = await getMetodosPago(empresaId);

    return res.json({
      success: true,
      message: "Métodos de pago obtenidos correctamente",
      data: metodos,
    });
  } catch {
    return res.status(500).json({
      success: false,
      message: "Error obteniendo métodos de pago",
    });
  }
}

export async function createMetodoPagoHandler(req: Request, res: Response) {
  try {
    const empresaId = req.auth!.empresaId;
    const parsed = createMetodoPagoSchema.parse(req.body);

    const metodo = await createMetodoPagoService({
      empresaId,
      ...parsed,
    });

    return res.status(201).json({
      success: true,
      message: "Método de pago creado correctamente",
      data: metodo,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message:
        error instanceof Error ? error.message : "Error creando método de pago",
    });
  }
}

export async function updateMetodoPagoHandler(req: Request, res: Response) {
  try {
    const empresaId = req.auth!.empresaId;
    const { id } = req.params;
    const parsed = updateMetodoPagoSchema.parse(req.body);

    const metodo = await updateMetodoPagoService(id, empresaId, parsed);

    return res.json({
      success: true,
      message: "Método de pago actualizado correctamente",
      data: metodo,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Error actualizando método de pago",
    });
  }
}

export async function updateMetodoPagoStatusHandler(
  req: Request,
  res: Response
) {
  try {
    const empresaId = req.auth!.empresaId;
    const { id } = req.params;
    const parsed = updateMetodoPagoStatusSchema.parse(req.body);

    const metodo = await updateMetodoPagoStatusService(
      id,
      empresaId,
      parsed.estado
    );

    return res.json({
      success: true,
      message: "Estado actualizado correctamente",
      data: metodo,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message:
        error instanceof Error ? error.message : "Error actualizando estado",
    });
  }
}