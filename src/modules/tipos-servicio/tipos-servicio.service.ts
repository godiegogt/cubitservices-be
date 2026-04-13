import { EstadoRegistroBasico } from "@prisma/client";
import {
  createTipoServicio,
  findTipoServicioById,
  findTipoServicioByName,
  findTiposServicioByEmpresa,
  updateTipoServicio,
  updateTipoServicioStatus,
} from "./tipos-servicio.repository";

export async function getTiposServicio(empresaId: string) {
  return findTiposServicioByEmpresa(empresaId);
}

export async function createTipoServicioService(input: {
  empresaId: string;
  nombre: string;
  descripcion?: string;
  precioBase: number;
}) {
  const existing = await findTipoServicioByName(input.empresaId, input.nombre);

  if (existing) {
    throw new Error("Ya existe un tipo de servicio con ese nombre");
  }

  return createTipoServicio(input);
}

export async function updateTipoServicioService(
  id: string,
  empresaId: string,
  input: {
    nombre?: string;
    descripcion?: string;
    precioBase?: number;
  }
) {
  const tipoServicio = await findTipoServicioById(id);

  if (!tipoServicio || tipoServicio.empresaId !== empresaId) {
    throw new Error("Tipo de servicio no encontrado");
  }

  if (input.nombre && input.nombre !== tipoServicio.nombre) {
    const existing = await findTipoServicioByName(empresaId, input.nombre);

    if (existing) {
      throw new Error("Ya existe un tipo de servicio con ese nombre");
    }
  }

  return updateTipoServicio(id, input);
}

export async function updateTipoServicioStatusService(
  id: string,
  empresaId: string,
  estado: EstadoRegistroBasico
) {
  const tipoServicio = await findTipoServicioById(id);

  if (!tipoServicio || tipoServicio.empresaId !== empresaId) {
    throw new Error("Tipo de servicio no encontrado");
  }

  return updateTipoServicioStatus(id, estado);
}