import { EstadoRegistroBasico } from "@prisma/client";
import {
  createMetodoPago,
  findMetodoPagoById,
  findMetodoPagoByName,
  findMetodosPagoByEmpresa,
  updateMetodoPago,
  updateMetodoPagoStatus,
} from "./metodos-pago.repository";

export async function getMetodosPago(empresaId: string) {
  return findMetodosPagoByEmpresa(empresaId);
}

export async function createMetodoPagoService(input: {
  empresaId: string;
  nombre: string;
  descripcion?: string;
}) {
  const existing = await findMetodoPagoByName(input.empresaId, input.nombre);

  if (existing) {
    throw new Error("Ya existe un método de pago con ese nombre");
  }

  return createMetodoPago(input);
}

export async function updateMetodoPagoService(
  id: string,
  empresaId: string,
  input: {
    nombre?: string;
    descripcion?: string;
  }
) {
  const metodo = await findMetodoPagoById(id);

  if (!metodo || metodo.empresaId !== empresaId) {
    throw new Error("Método de pago no encontrado");
  }

  if (input.nombre && input.nombre !== metodo.nombre) {
    const existing = await findMetodoPagoByName(empresaId, input.nombre);

    if (existing) {
      throw new Error("Ya existe un método de pago con ese nombre");
    }
  }

  return updateMetodoPago(id, input);
}

export async function updateMetodoPagoStatusService(
  id: string,
  empresaId: string,
  estado: EstadoRegistroBasico
) {
  const metodo = await findMetodoPagoById(id);

  if (!metodo || metodo.empresaId !== empresaId) {
    throw new Error("Método de pago no encontrado");
  }

  return updateMetodoPagoStatus(id, estado);
}