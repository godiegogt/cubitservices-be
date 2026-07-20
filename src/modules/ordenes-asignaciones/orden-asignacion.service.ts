import { EstadoAsignacionOrden, EstadoOrdenServicio, EstadoUsuario, RolEnOrden } from "@prisma/client";
import { findOrdenById } from "../ordenes/ordenes.repository";
import { findUserById } from "../usuarios/usuarios.repository";
import {
  createAsignacion,
  findAsignacionActiva,
  findAsignacionById,
  findAsignacionesByOrdenId,
  updateAsignacionEstado,
} from "./orden-asignacion.repository";

const terminalStates = new Set<EstadoOrdenServicio>([
  EstadoOrdenServicio.FINALIZADA,
  EstadoOrdenServicio.CANCELADA,
]);

async function validarOrdenDeEmpresa(ordenServicioId: string, empresaId: string) {
  const orden = await findOrdenById(ordenServicioId);

  if (!orden || orden.empresaId !== empresaId) {
    throw new Error("Orden de servicio no encontrada");
  }

  return orden;
}

export async function getAsignacionesService(
  ordenServicioId: string,
  empresaId: string
) {
  await validarOrdenDeEmpresa(ordenServicioId, empresaId);

  return findAsignacionesByOrdenId(ordenServicioId);
}

export async function createAsignacionService(
  ordenServicioId: string,
  empresaId: string,
  asignadoPor: string,
  input: {
    usuarioId: string;
    rolEnOrden: RolEnOrden;
  }
) {
  const orden = await validarOrdenDeEmpresa(ordenServicioId, empresaId);

  if (terminalStates.has(orden.estado)) {
    throw new Error(
      "No se pueden asignar encargados a una orden FINALIZADA o CANCELADA"
    );
  }

  const usuario = await findUserById(input.usuarioId);

  if (!usuario || usuario.empresaId !== empresaId) {
    throw new Error("Usuario no encontrado");
  }

  if (usuario.estado !== EstadoUsuario.ACTIVO) {
    throw new Error("El usuario debe estar ACTIVO para poder ser asignado");
  }

  const asignacionExistente = await findAsignacionActiva(
    ordenServicioId,
    input.usuarioId,
    input.rolEnOrden
  );

  if (asignacionExistente) {
    throw new Error(
      "El usuario ya tiene una asignacion activa con ese rol en esta orden"
    );
  }

  return createAsignacion({
    ordenServicioId,
    usuarioId: input.usuarioId,
    rolEnOrden: input.rolEnOrden,
    asignadoPor,
  });
}

export async function updateAsignacionEstadoService(
  ordenServicioId: string,
  asignacionId: string,
  empresaId: string,
  input: {
    estado: EstadoAsignacionOrden;
  }
) {
  await validarOrdenDeEmpresa(ordenServicioId, empresaId);

  const asignacion = await findAsignacionById(asignacionId);

  if (!asignacion || asignacion.ordenServicioId !== ordenServicioId) {
    throw new Error("Asignacion no encontrada");
  }

  if (asignacion.estado !== EstadoAsignacionOrden.ACTIVA) {
    throw new Error("Solo se pueden actualizar asignaciones ACTIVAS");
  }

  return updateAsignacionEstado(asignacionId, input.estado);
}
