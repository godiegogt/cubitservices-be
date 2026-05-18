import {
  EstadoCuentaServicio,
  EstadoOrdenServicio,
  EstadoRegistroBasico,
  OrigenOrden,
  PrioridadOrden,
} from "@prisma/client";
import {
  countOrdenesByEmpresa,
  createOrden,
  findCuentaServicioById,
  findEstadosByOrdenId,
  findOrdenById,
  findOrdenByNumero,
  findOrdenesByEmpresa,
  findOrdenesSelect,
  findTipoServicioById,
  findUbicacionById,
  updateOrden,
  updateOrdenStatus,
} from "./ordenes.repository";

const terminalStates = new Set<EstadoOrdenServicio>([
  EstadoOrdenServicio.FINALIZADA,
  EstadoOrdenServicio.CANCELADA,
]);

const allowedStatusTransitions: Record<
  EstadoOrdenServicio,
  EstadoOrdenServicio[]
> = {
  [EstadoOrdenServicio.PENDIENTE]: [
    EstadoOrdenServicio.PROGRAMADA,
    EstadoOrdenServicio.EN_PROCESO,
    EstadoOrdenServicio.CANCELADA,
  ],
  [EstadoOrdenServicio.PROGRAMADA]: [
    EstadoOrdenServicio.EN_PROCESO,
    EstadoOrdenServicio.CANCELADA,
  ],
  [EstadoOrdenServicio.EN_PROCESO]: [
    EstadoOrdenServicio.PAUSADA,
    EstadoOrdenServicio.FINALIZADA,
    EstadoOrdenServicio.CANCELADA,
  ],
  [EstadoOrdenServicio.PAUSADA]: [
    EstadoOrdenServicio.EN_PROCESO,
    EstadoOrdenServicio.CANCELADA,
  ],
  [EstadoOrdenServicio.FINALIZADA]: [],
  [EstadoOrdenServicio.CANCELADA]: [],
};

function parseDateTime(value?: string) {
  if (value === undefined) {
    return undefined;
  }

  return new Date(value);
}

async function generateNumeroOrden(empresaId: string) {
  let sequence = (await countOrdenesByEmpresa(empresaId)) + 1;

  while (true) {
    const numeroOrden = `OS-${String(sequence).padStart(6, "0")}`;
    const existing = await findOrdenByNumero(empresaId, numeroOrden);

    if (!existing) {
      return numeroOrden;
    }

    sequence += 1;
  }
}

async function validateTipoServicio(empresaId: string, tipoServicioId: string) {
  const tipoServicio = await findTipoServicioById(tipoServicioId);

  if (!tipoServicio || tipoServicio.empresaId !== empresaId) {
    throw new Error("Tipo de servicio no encontrado");
  }

  if (tipoServicio.estado !== EstadoRegistroBasico.ACTIVO) {
    throw new Error("El tipo de servicio debe estar ACTIVO");
  }

  return tipoServicio;
}

async function validateUbicacion(clienteId: string, ubicacionId: string) {
  const ubicacion = await findUbicacionById(ubicacionId);

  if (!ubicacion || ubicacion.clienteId !== clienteId) {
    throw new Error("Ubicacion no encontrada para el cliente");
  }

  return ubicacion;
}

export async function getOrdenes(
  empresaId: string,
  page: number,
  limit: number,
  filters?: {
    estado?: EstadoOrdenServicio;
    clienteId?: string;
    cuentaServicioId?: string;
    tipoServicioId?: string;
    prioridad?: PrioridadOrden;
    origen?: OrigenOrden;
    search?: string;
  }
) {
  const { ordenes, total } = await findOrdenesByEmpresa(empresaId, page, limit, filters);

  return {
    data: ordenes,
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
}

export async function getOrdenByIdService(id: string, empresaId: string) {
  const orden = await findOrdenById(id);

  if (!orden || orden.empresaId !== empresaId) {
    throw new Error("Orden de servicio no encontrada");
  }

  return orden;
}

export async function createOrdenService(input: {
  empresaId: string;
  usuarioId: string;
  cuentaServicioId: string;
  ubicacionId: string;
  tipoServicioId: string;
  titulo: string;
  descripcion?: string;
  origen: OrigenOrden;
  prioridad: PrioridadOrden;
  fechaProgramada?: string;
  requiereEvidenciaFinal?: boolean;
  observacionesGenerales?: string;
}) {
  const cuentaServicio = await findCuentaServicioById(input.cuentaServicioId);

  if (!cuentaServicio || cuentaServicio.empresaId !== input.empresaId) {
    throw new Error("Cuenta de servicio no encontrada");
  }

  if (
    cuentaServicio.estado === EstadoCuentaServicio.CANCELADA ||
    cuentaServicio.estado === EstadoCuentaServicio.FINALIZADA
  ) {
    throw new Error(
      "No se pueden crear ordenes para cuentas CANCELADA o FINALIZADA"
    );
  }

  await Promise.all([
    validateUbicacion(cuentaServicio.clienteId, input.ubicacionId),
    validateTipoServicio(input.empresaId, input.tipoServicioId),
  ]);

  const estado = input.fechaProgramada
    ? EstadoOrdenServicio.PROGRAMADA
    : EstadoOrdenServicio.PENDIENTE;
  const numeroOrden = await generateNumeroOrden(input.empresaId);

  return createOrden({
    ...input,
    clienteId: cuentaServicio.clienteId,
    numeroOrden,
    estado,
    fechaProgramada: parseDateTime(input.fechaProgramada),
  });
}

export async function updateOrdenService(
  id: string,
  empresaId: string,
  input: {
    titulo?: string;
    descripcion?: string;
    ubicacionId?: string;
    tipoServicioId?: string;
    origen?: OrigenOrden;
    prioridad?: PrioridadOrden;
    fechaProgramada?: string;
    requiereEvidenciaFinal?: boolean;
    observacionesGenerales?: string;
  }
) {
  const orden = await findOrdenById(id);

  if (!orden || orden.empresaId !== empresaId) {
    throw new Error("Orden de servicio no encontrada");
  }

  if (terminalStates.has(orden.estado)) {
    throw new Error("No se puede editar una orden FINALIZADA o CANCELADA");
  }

  if (input.ubicacionId) {
    await validateUbicacion(orden.clienteId, input.ubicacionId);
  }

  if (input.tipoServicioId) {
    await validateTipoServicio(empresaId, input.tipoServicioId);
  }

  return updateOrden(id, {
    ...input,
    fechaProgramada: parseDateTime(input.fechaProgramada),
  });
}

export async function updateOrdenStatusService(
  id: string,
  empresaId: string,
  usuarioId: string,
  input: {
    estado: EstadoOrdenServicio;
    motivo?: string;
  }
) {
  const orden = await findOrdenById(id);

  if (!orden || orden.empresaId !== empresaId) {
    throw new Error("Orden de servicio no encontrada");
  }

  if (orden.estado === input.estado) {
    throw new Error("La orden ya tiene ese estado");
  }

  if (terminalStates.has(orden.estado)) {
    throw new Error("No se permiten cambios desde FINALIZADA o CANCELADA");
  }

  const allowedTransitions = allowedStatusTransitions[orden.estado];

  if (!allowedTransitions.includes(input.estado)) {
    throw new Error(
      `No se permite cambiar de ${orden.estado} a ${input.estado}`
    );
  }

  if (input.estado === EstadoOrdenServicio.CANCELADA && !input.motivo) {
    throw new Error("motivo es obligatorio para cancelar la orden");
  }

  if (
    input.estado === EstadoOrdenServicio.FINALIZADA &&
    orden.requiereEvidenciaFinal
  ) {
    // TODO: validar archivos/evidencia final cuando exista el módulo de archivos.
  }

  const now = new Date();

  return updateOrdenStatus(id, {
    estadoAnterior: orden.estado,
    estadoNuevo: input.estado,
    motivo: input.motivo,
    usuarioId,
    fechaInicio:
      input.estado === EstadoOrdenServicio.EN_PROCESO && !orden.fechaInicio
        ? now
        : undefined,
    fechaCierre:
      input.estado === EstadoOrdenServicio.FINALIZADA ||
      input.estado === EstadoOrdenServicio.CANCELADA
        ? now
        : undefined,
    motivoCancelacion:
      input.estado === EstadoOrdenServicio.CANCELADA
        ? input.motivo
        : undefined,
  });
}

export async function getOrdenEstadosService(id: string, empresaId: string) {
  const orden = await findOrdenById(id);

  if (!orden || orden.empresaId !== empresaId) {
    throw new Error("Orden de servicio no encontrada");
  }

  return findEstadosByOrdenId(id);
}

export async function getOrdenesSelectService(
  empresaId: string,
  filters: {
    cuentaServicioId: string;
    search?: string;
  }
) {
  const cuentaServicio = await findCuentaServicioById(filters.cuentaServicioId);

  if (!cuentaServicio || cuentaServicio.empresaId !== empresaId) {
    throw new Error("Cuenta de servicio no encontrada");
  }

  return findOrdenesSelect(empresaId, filters);
}
