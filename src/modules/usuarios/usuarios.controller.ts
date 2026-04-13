import { Request, Response } from "express";
import {
  createUserSchema,
  updateUserSchema,
  updateUserStatusSchema,
} from "./usuarios.schemas";
import {
  createUserService,
  getUsers,
  updateUserService,
  updateUserStatusService,
} from "./usuarios.service";

export async function listUsers(req: Request, res: Response) {
  const empresaId = req.auth!.empresaId;
  const users = await getUsers(empresaId);

  return res.json({
    success: true,
    data: users,
  });
}

export async function createUserHandler(req: Request, res: Response) {
  try {
    const empresaId = req.auth!.empresaId;
    const parsed = createUserSchema.parse(req.body);

    const user = await createUserService({
      empresaId,
      ...parsed,
    });

    return res.status(201).json({
      success: true,
      data: user,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : "Error",
    });
  }
}

export async function updateUserHandler(req: Request, res: Response) {
  try {
    const empresaId = req.auth!.empresaId;
    const { id } = req.params;
    const parsed = updateUserSchema.parse(req.body);

    const user = await updateUserService(id, empresaId, parsed);

    return res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : "Error",
    });
  }
}

export async function updateUserStatusHandler(req: Request, res: Response) {
  try {
    const empresaId = req.auth!.empresaId;
    const { id } = req.params;
    const parsed = updateUserStatusSchema.parse(req.body);

    const user = await updateUserStatusService(id, empresaId, parsed.estado);

    return res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : "Error",
    });
  }
}