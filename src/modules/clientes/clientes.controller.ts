import { Request, Response } from "express";
import {
  createClienteSchema,
  searchClientesSelectSchema,
  updateClienteSchema,
  updateClienteStatusSchema,
} from "./clientes.schemas";
import {
  createClienteService,
  getClienteByIdService,
  getClientes,
  searchClientesForSelectService,
  updateClienteService,
  updateClienteStatusService,
} from "./clientes.service";

export async function listClientes(req: Request, res: Response) {
  try {
    const empresaId = req.auth!.empresaId;
    const clientes = await getClientes(empresaId);

    return res.json({
      success: true,
      message: "Clientes obtenidos correctamente",
      data: clientes,
    });
  } catch {
    return res.status(500).json({
      success: false,
      message: "Error obteniendo clientes",
    });
  }
}

export async function getClienteHandler(req: Request, res: Response) {
  try {
    const empresaId = req.auth!.empresaId;
    const { id } = req.params;

    const cliente = await getClienteByIdService(id, empresaId);

    return res.json({
      success: true,
      message: "Cliente obtenido correctamente",
      data: cliente,
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: error instanceof Error ? error.message : "Error obteniendo cliente",
    });
  }
}

export async function createClienteHandler(req: Request, res: Response) {
  try {
    const empresaId = req.auth!.empresaId;
    const parsed = createClienteSchema.parse(req.body);

    const cliente = await createClienteService({
      empresaId,
      ...parsed,
    });

    return res.status(201).json({
      success: true,
      message: "Cliente creado correctamente",
      data: cliente,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : "Error creando cliente",
    });
  }
}

export async function updateClienteHandler(req: Request, res: Response) {
  try {
    const empresaId = req.auth!.empresaId;
    const { id } = req.params;
    const parsed = updateClienteSchema.parse(req.body);

    const cliente = await updateClienteService(id, empresaId, parsed);

    return res.json({
      success: true,
      message: "Cliente actualizado correctamente",
      data: cliente,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : "Error actualizando cliente",
    });
  }
}

export async function updateClienteStatusHandler(req: Request, res: Response) {
  try {
    const empresaId = req.auth!.empresaId;
    const { id } = req.params;
    const parsed = updateClienteStatusSchema.parse(req.body);

    const cliente = await updateClienteStatusService(id, empresaId, parsed.estado);

    return res.json({
      success: true,
      message: "Estado del cliente actualizado correctamente",
      data: cliente,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message:
        error instanceof Error ? error.message : "Error actualizando estado del cliente",
    });
  }
}

export async function searchClientesSelectHandler(req: Request, res: Response) {
  try {
    const empresaId = req.auth!.empresaId;
    const { search } = searchClientesSelectSchema.parse(req.query);

    const clientes = await searchClientesForSelectService(empresaId, { search });

    return res.json({
      success: true,
      message: "Clientes obtenidos correctamente",
      data: clientes,
    });
  } catch {
    return res.status(500).json({
      success: false,
      message: "Error buscando clientes",
    });
  }
}