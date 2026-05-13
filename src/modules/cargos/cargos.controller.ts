import { Request, Response } from "express";
import {
  createCargoFromCuentaSchema,
  createCargoSchema,
  getCargosQuerySchema,
  updateCargoStatusSchema,
} from "./cargos.schemas";
import {
  createCargoFromCuentaService,
  createCargoService,
  getCargoByIdService,
  getCargosService,
  updateCargoStatusService,
} from "./cargos.service";

export async function listCargos(req: Request, res: Response) {
  try {
    const empresaId = req.auth!.empresaId;
    const parsedQuery = getCargosQuerySchema.parse(req.query);
    const result = await getCargosService(empresaId, parsedQuery);

    return res.json({
      success: true,
      message: "Cargos obtenidos correctamente",
      data: result.data,
      meta: result.meta,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message:
        error instanceof Error ? error.message : "Error obteniendo cargos",
    });
  }
}

export async function getCargoHandler(req: Request, res: Response) {
  try {
    const empresaId = req.auth!.empresaId;
    const { id } = req.params;

    const cargo = await getCargoByIdService(id, empresaId);

    return res.json({
      success: true,
      message: "Cargo obtenido correctamente",
      data: cargo,
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message:
        error instanceof Error ? error.message : "Error obteniendo cargo",
    });
  }
}

export async function createCargoHandler(req: Request, res: Response) {
  try {
    const empresaId = req.auth!.empresaId;
    const parsed = createCargoSchema.parse(req.body);

    const cargo = await createCargoService({
      empresaId,
      ...parsed,
    });

    return res.status(201).json({
      success: true,
      message: "Cargo creado correctamente",
      data: cargo,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : "Error creando cargo",
    });
  }
}

export async function createCargoFromCuentaHandler(
  req: Request,
  res: Response
) {
  try {
    const empresaId = req.auth!.empresaId;
    const { id } = req.params;
    const parsed = createCargoFromCuentaSchema.parse(req.body);

    const cargo = await createCargoFromCuentaService({
      empresaId,
      cuentaServicioId: id,
      ...parsed,
    });

    return res.status(201).json({
      success: true,
      message: "Cargo creado correctamente",
      data: cargo,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : "Error creando cargo",
    });
  }
}

export async function updateCargoStatusHandler(req: Request, res: Response) {
  try {
    const empresaId = req.auth!.empresaId;
    const { id } = req.params;
    const parsed = updateCargoStatusSchema.parse(req.body);

    const cargo = await updateCargoStatusService(id, empresaId, parsed);

    return res.json({
      success: true,
      message: "Cargo anulado correctamente",
      data: cargo,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Error actualizando estado del cargo",
    });
  }
}
