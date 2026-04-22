import { EstadoCuentaServicio } from "@prisma/client";
import { Request, Response } from "express";
import { z } from "zod";
import {
  createCuentaServicioSchema,
  updateCuentaServicioSchema,
  updateCuentaServicioStatusSchema,
} from "./cuentas-servicio.schemas";
import {
  createCuentaServicioService,
  getCuentaServicioByIdService,
  getCuentasServicio,
  updateCuentaServicioService,
  updateCuentaServicioStatusService,
} from "./cuentas-servicio.service";

const listCuentasServicioQuerySchema = z.object({
  clienteId: z.string().uuid().optional(),
  estado: z.nativeEnum(EstadoCuentaServicio).optional(),
  tipoServicioId: z.string().uuid().optional(),
  search: z.string().min(1).optional(),
});

export async function listCuentasServicio(req: Request, res: Response) {
  try {
    const empresaId = req.auth!.empresaId;
    const parsedQuery = listCuentasServicioQuerySchema.parse(req.query);
    const cuentasServicio = await getCuentasServicio(empresaId, parsedQuery);

    return res.json({
      success: true,
      message: "Cuentas de servicio obtenidas correctamente",
      data: cuentasServicio,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Error obteniendo cuentas de servicio",
    });
  }
}

export async function getCuentaServicioHandler(req: Request, res: Response) {
  try {
    const empresaId = req.auth!.empresaId;
    const { id } = req.params;

    const cuentaServicio = await getCuentaServicioByIdService(id, empresaId);

    return res.json({
      success: true,
      message: "Cuenta de servicio obtenida correctamente",
      data: cuentaServicio,
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Error obteniendo cuenta de servicio",
    });
  }
}

export async function createCuentaServicioHandler(req: Request, res: Response) {
  try {
    const empresaId = req.auth!.empresaId;
    const parsed = createCuentaServicioSchema.parse(req.body);

    const cuentaServicio = await createCuentaServicioService({
      empresaId,
      ...parsed,
    });

    return res.status(201).json({
      success: true,
      message: "Cuenta de servicio creada correctamente",
      data: cuentaServicio,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message:
        error instanceof Error ? error.message : "Error creando cuenta de servicio",
    });
  }
}

export async function updateCuentaServicioHandler(req: Request, res: Response) {
  try {
    const empresaId = req.auth!.empresaId;
    const { id } = req.params;
    const parsed = updateCuentaServicioSchema.parse(req.body);

    const cuentaServicio = await updateCuentaServicioService(id, empresaId, parsed);

    return res.json({
      success: true,
      message: "Cuenta de servicio actualizada correctamente",
      data: cuentaServicio,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Error actualizando cuenta de servicio",
    });
  }
}

export async function updateCuentaServicioStatusHandler(
  req: Request,
  res: Response
) {
  try {
    const empresaId = req.auth!.empresaId;
    const { id } = req.params;
    const parsed = updateCuentaServicioStatusSchema.parse(req.body);

    const cuentaServicio = await updateCuentaServicioStatusService(
      id,
      empresaId,
      parsed.estado
    );

    return res.json({
      success: true,
      message: "Estado de la cuenta de servicio actualizado correctamente",
      data: cuentaServicio,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Error actualizando estado de la cuenta de servicio",
    });
  }
}
