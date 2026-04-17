import { Request, Response } from "express";
import {
  createPoliticaCobroSchema,
  updatePoliticaCobroSchema,
  updatePoliticaCobroStatusSchema,
} from "./politicas-cobro.schemas";
import {
  createPoliticaCobroService,
  getPoliticasCobro,
  updatePoliticaCobroService,
  updatePoliticaCobroStatusService,
} from "./politicas-cobro.service";

export async function listPoliticasCobro(req: Request, res: Response) {
  try {
    const empresaId = req.auth!.empresaId;
    const politicas = await getPoliticasCobro(empresaId);

    return res.json({
      success: true,
      message: "Políticas de cobro obtenidas correctamente",
      data: politicas,
    });
  } catch {
    return res.status(500).json({
      success: false,
      message: "Error obteniendo políticas de cobro",
    });
  }
}

export async function createPoliticaCobroHandler(req: Request, res: Response) {
  try {
    const empresaId = req.auth!.empresaId;
    const parsed = createPoliticaCobroSchema.parse(req.body);

    const politica = await createPoliticaCobroService({
      empresaId,
      ...parsed,
    });

    return res.status(201).json({
      success: true,
      message: "Política de cobro creada correctamente",
      data: politica,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Error creando política de cobro",
    });
  }
}

export async function updatePoliticaCobroHandler(req: Request, res: Response) {
  try {
    const empresaId = req.auth!.empresaId;
    const { id } = req.params;
    const parsed = updatePoliticaCobroSchema.parse(req.body);

    const politica = await updatePoliticaCobroService(id, empresaId, parsed);

    return res.json({
      success: true,
      message: "Política de cobro actualizada correctamente",
      data: politica,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Error actualizando política de cobro",
    });
  }
}

export async function updatePoliticaCobroStatusHandler(
  req: Request,
  res: Response
) {
  try {
    const empresaId = req.auth!.empresaId;
    const { id } = req.params;
    const parsed = updatePoliticaCobroStatusSchema.parse(req.body);

    const politica = await updatePoliticaCobroStatusService(
      id,
      empresaId,
      parsed.estado
    );

    return res.json({
      success: true,
      message: "Estado actualizado correctamente",
      data: politica,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message:
        error instanceof Error ? error.message : "Error actualizando estado",
    });
  }
}
