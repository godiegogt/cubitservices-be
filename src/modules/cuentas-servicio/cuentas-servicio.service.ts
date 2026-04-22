import {
  EstadoCuentaServicio,
  EstadoRegistroBasico,
  FrecuenciaServicio,
  ModalidadServicio,
} from "@prisma/client";
import {
  createCuentaServicio,
  findClienteById,
  findCuentaServicioByCodigo,
  findCuentaServicioById,
  findCuentasServicioByEmpresa,
  findPoliticaCobroById,
  findTipoServicioById,
  findUbicacionById,
  updateCuentaServicio,
  updateCuentaServicioStatus,
} from "./cuentas-servicio.repository";

const terminalStates = new Set<EstadoCuentaServicio>([
  EstadoCuentaServicio.CANCELADA,
  EstadoCuentaServicio.FINALIZADA,
]);

const allowedStatusTransitions: Record<
  EstadoCuentaServicio,
  EstadoCuentaServicio[]
> = {
  [EstadoCuentaServicio.ACTIVA]: [
    EstadoCuentaServicio.SUSPENDIDA,
    EstadoCuentaServicio.CANCELADA,
    EstadoCuentaServicio.FINALIZADA,
  ],
  [EstadoCuentaServicio.SUSPENDIDA]: [
    EstadoCuentaServicio.ACTIVA,
    EstadoCuentaServicio.CANCELADA,
  ],
  [EstadoCuentaServicio.CANCELADA]: [],
  [EstadoCuentaServicio.FINALIZADA]: [],
};

function parseDateOnly(value?: string | null) {
  if (value === undefined) {
    return undefined;
  }

  if (value === null) {
    return null;
  }

  return new Date(`${value}T00:00:00.000Z`);
}

async function validateCuentaServicioRelations(input: {
  empresaId: string;
  clienteId: string;
  ubicacionId?: string | null;
  tipoServicioId: string;
  politicaCobroId?: string | null;
  modalidad: ModalidadServicio;
  frecuencia?: FrecuenciaServicio | null;
}) {
  const [cliente, tipoServicio, politicaCobro] = await Promise.all([
    findClienteById(input.clienteId),
    findTipoServicioById(input.tipoServicioId),
    input.politicaCobroId ? findPoliticaCobroById(input.politicaCobroId) : Promise.resolve(null),
  ]);

  if (!cliente || cliente.empresaId !== input.empresaId) {
    throw new Error("Cliente no encontrado");
  }

  if (!tipoServicio || tipoServicio.empresaId !== input.empresaId) {
    throw new Error("Tipo de servicio no encontrado");
  }

  if (tipoServicio.estado !== EstadoRegistroBasico.ACTIVO) {
    throw new Error("El tipo de servicio debe estar ACTIVO");
  }

  if (input.ubicacionId) {
    const ubicacion = await findUbicacionById(input.ubicacionId);

    if (!ubicacion || ubicacion.clienteId !== input.clienteId) {
      throw new Error("UbicaciÃ³n no encontrada para el cliente");
    }
  }

  if (input.modalidad === ModalidadServicio.RECURRENTE) {
    if (!input.politicaCobroId) {
      throw new Error("politicaCobroId es obligatoria para modalidad RECURRENTE");
    }

    if (!input.frecuencia) {
      throw new Error("frecuencia es obligatoria para modalidad RECURRENTE");
    }
  }

  if (input.modalidad === ModalidadServicio.PUNTUAL && input.frecuencia) {
    throw new Error("frecuencia no debe enviarse para modalidad PUNTUAL");
  }

  if (input.politicaCobroId) {
    if (!politicaCobro || politicaCobro.empresaId !== input.empresaId) {
      throw new Error("PolÃ­tica de cobro no encontrada");
    }

    if (politicaCobro.estado !== EstadoRegistroBasico.ACTIVO) {
      throw new Error("La polÃ­tica de cobro debe estar ACTIVA");
    }
  }
}

export async function getCuentasServicio(
  empresaId: string,
  filters?: {
    clienteId?: string;
    estado?: EstadoCuentaServicio;
    tipoServicioId?: string;
    search?: string;
  }
) {
  return findCuentasServicioByEmpresa(empresaId, filters);
}

export async function getCuentaServicioByIdService(id: string, empresaId: string) {
  const cuentaServicio = await findCuentaServicioById(id);

  if (!cuentaServicio || cuentaServicio.empresaId !== empresaId) {
    throw new Error("Cuenta de servicio no encontrada");
  }

  return cuentaServicio;
}

export async function createCuentaServicioService(input: {
  empresaId: string;
  clienteId: string;
  ubicacionId?: string;
  tipoServicioId: string;
  politicaCobroId?: string;
  codigo: string;
  nombre: string;
  descripcion?: string;
  modalidad: ModalidadServicio;
  frecuencia?: FrecuenciaServicio;
  fechaInicio?: string;
  fechaFin?: string | null;
  montoBase: number;
  diaCorte?: number;
  diaPago?: number;
  observaciones?: string;
}) {
  const existing = await findCuentaServicioByCodigo(input.empresaId, input.codigo);

  if (existing) {
    throw new Error("Ya existe una cuenta de servicio con ese cÃ³digo");
  }

  await validateCuentaServicioRelations({
    empresaId: input.empresaId,
    clienteId: input.clienteId,
    ubicacionId: input.ubicacionId,
    tipoServicioId: input.tipoServicioId,
    politicaCobroId: input.politicaCobroId,
    modalidad: input.modalidad,
    frecuencia: input.frecuencia,
  });

  return createCuentaServicio({
    ...input,
    fechaInicio: parseDateOnly(input.fechaInicio) ?? undefined,
    fechaFin: parseDateOnly(input.fechaFin),
  });
}

export async function updateCuentaServicioService(
  id: string,
  empresaId: string,
  input: {
    clienteId?: string;
    ubicacionId?: string | null;
    tipoServicioId?: string;
    politicaCobroId?: string | null;
    codigo?: string;
    nombre?: string;
    descripcion?: string;
    modalidad?: ModalidadServicio;
    frecuencia?: FrecuenciaServicio | null;
    fechaInicio?: string | null;
    fechaFin?: string | null;
    montoBase?: number;
    diaCorte?: number | null;
    diaPago?: number | null;
    observaciones?: string;
  }
) {
  const cuentaServicio = await findCuentaServicioById(id);

  if (!cuentaServicio || cuentaServicio.empresaId !== empresaId) {
    throw new Error("Cuenta de servicio no encontrada");
  }

  if (terminalStates.has(cuentaServicio.estado)) {
    throw new Error("No se puede editar una cuenta en estado CANCELADA o FINALIZADA");
  }

  if (input.codigo && input.codigo !== cuentaServicio.codigo) {
    const existing = await findCuentaServicioByCodigo(empresaId, input.codigo);

    if (existing && existing.id !== id) {
      throw new Error("Ya existe una cuenta de servicio con ese código");
    }
  }

  const modalidad = input.modalidad ?? cuentaServicio.modalidad;
  const clienteId = input.clienteId ?? cuentaServicio.clienteId;
  const ubicacionId =
    input.ubicacionId !== undefined ? input.ubicacionId : cuentaServicio.ubicacionId;
  const tipoServicioId = input.tipoServicioId ?? cuentaServicio.tipoServicioId;
  const politicaCobroId =
    input.politicaCobroId !== undefined
      ? input.politicaCobroId
      : cuentaServicio.politicaCobroId;
  const frecuencia =
    input.frecuencia !== undefined ? input.frecuencia : cuentaServicio.frecuencia;

  await validateCuentaServicioRelations({
    empresaId,
    clienteId,
    ubicacionId,
    tipoServicioId,
    politicaCobroId,
    modalidad,
    frecuencia,
  });

  const dataToUpdate = {
    ...input,
    fechaInicio: parseDateOnly(input.fechaInicio),
    fechaFin: parseDateOnly(input.fechaFin),
  };

  return updateCuentaServicio(id, dataToUpdate);
}

export async function updateCuentaServicioStatusService(
  id: string,
  empresaId: string,
  estado: EstadoCuentaServicio
) {
  const cuentaServicio = await findCuentaServicioById(id);

  if (!cuentaServicio || cuentaServicio.empresaId !== empresaId) {
    throw new Error("Cuenta de servicio no encontrada");
  }

  if (cuentaServicio.estado === estado) {
    throw new Error("La cuenta ya tiene ese estado");
  }

  const allowedTransitions = allowedStatusTransitions[cuentaServicio.estado];

  if (!allowedTransitions.includes(estado)) {
    throw new Error(
      `No se permite cambiar de ${cuentaServicio.estado} a ${estado}`
    );
  }

  return updateCuentaServicioStatus(id, estado);
}
