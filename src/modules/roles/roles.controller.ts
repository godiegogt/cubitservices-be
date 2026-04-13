import { Request, Response } from "express";
import {
  createRoleSchema,
  updateRoleSchema,
  updateRoleStatusSchema,
} from "./roles.schemas";
import {
  createRoleService,
  getRoles,
  updateRoleService,
  updateRoleStatusService,
} from "./roles.service";

export async function listRoles(req: Request, res: Response) {
  try {
    const empresaId = req.auth!.empresaId;
    const roles = await getRoles(empresaId);

    return res.json({
      success: true,
      message: "Roles obtenidos correctamente",
      data: roles,
    });
  } catch {
    return res.status(500).json({
      success: false,
      message: "Error obteniendo roles",
    });
  }
}

export async function createRoleHandler(req: Request, res: Response) {
  try {
    const empresaId = req.auth!.empresaId;
    const parsed = createRoleSchema.parse(req.body);

    const role = await createRoleService({
      empresaId,
      ...parsed,
    });

    return res.status(201).json({
      success: true,
      message: "Rol creado correctamente",
      data: role,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : "Error creando rol",
    });
  }
}

export async function updateRoleHandler(req: Request, res: Response) {
  try {
    const empresaId = req.auth!.empresaId;
    const { id } = req.params;
    const parsed = updateRoleSchema.parse(req.body);

    const role = await updateRoleService(id, empresaId, parsed);

    return res.json({
      success: true,
      message: "Rol actualizado correctamente",
      data: role,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : "Error actualizando rol",
    });
  }
}

export async function updateRoleStatusHandler(req: Request, res: Response) {
  try {
    const empresaId = req.auth!.empresaId;
    const { id } = req.params;
    const parsed = updateRoleStatusSchema.parse(req.body);

    const role = await updateRoleStatusService(id, empresaId, parsed.estado);

    return res.json({
      success: true,
      message: "Estado del rol actualizado correctamente",
      data: role,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message:
        error instanceof Error ? error.message : "Error actualizando estado del rol",
    });
  }
}