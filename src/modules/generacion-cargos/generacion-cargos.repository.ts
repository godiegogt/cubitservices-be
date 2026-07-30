import {
  EstadoEjecucionGeneracion,
  FrecuenciaServicio,
  ModalidadServicio,
  OrigenEjecucion,
  Prisma,
  ResultadoGeneracion,
  TipoCargo,
} from "@prisma/client";
import prisma from "../../config/prisma";

const ejecucionListInclude = {
  usuario: {
    select: {
      id: true,
      nombres: true,
      apellidos: true,
    },
  },
} satisfies Prisma.EjecucionGeneracionCargoInclude;

export type EjecucionListItem = Prisma.EjecucionGeneracionCargoGetPayload<{
  include: typeof ejecucionListInclude;
}>;

const detalleListInclude = {
  cuentaServicio: {
    select: {
      id: true,
      codigo: true,
      nombre: true,
    },
  },
  cliente: {
    select: {
      id: true,
      codigo: true,
      nombreRazonSocial: true,
    },
  },
} satisfies Prisma.EjecucionGeneracionCargoDetalleInclude;

export type DetalleListItem = Prisma.EjecucionGeneracionCargoDetalleGetPayload<{
  include: typeof detalleListInclude;
}>;

/**
 * Universo de cuentas candidatas para la generación/previsualización: solo
 * el criterio estructural (RECURRENTE + MENSUAL). NO filtra por estado ni
 * por duplicado — eso lo determina la simulación/generación cuenta por
 * cuenta (via `createCargoInternal`), para poder reportar y contabilizar
 * el motivo exacto de cada OMITIDO/ERROR.
 */
export async function findCuentasCandidatas(empresaId: string) {
  return prisma.cuentaServicio.findMany({
    where: {
      empresaId,
      modalidad: ModalidadServicio.RECURRENTE,
      frecuencia: FrecuenciaServicio.MENSUAL,
    },
    select: {
      id: true,
      codigo: true,
      nombre: true,
      montoBase: true,
      cliente: {
        select: {
          id: true,
          codigo: true,
          nombreRazonSocial: true,
        },
      },
    },
    orderBy: { codigo: "asc" },
  });
}

export async function countCuentasCandidatas(empresaId: string) {
  return prisma.cuentaServicio.count({
    where: {
      empresaId,
      modalidad: ModalidadServicio.RECURRENTE,
      frecuencia: FrecuenciaServicio.MENSUAL,
    },
  });
}

export async function createEjecucion(data: {
  empresaId: string;
  usuarioId?: string | null;
  periodo: string;
  origen: OrigenEjecucion;
}) {
  return prisma.ejecucionGeneracionCargo.create({
    data: {
      empresaId: data.empresaId,
      usuarioId: data.usuarioId,
      periodo: data.periodo,
      origen: data.origen,
      estado: EstadoEjecucionGeneracion.PROCESANDO,
    },
  });
}

export async function updateEjecucion(
  id: string,
  data: {
    estado: EstadoEjecucionGeneracion;
    fechaFin: Date;
    cantidadProcesadas: number;
    cantidadGeneradas: number;
    cantidadOmitidas: number;
    cantidadErrores: number;
    montoGenerado: Prisma.Decimal | number;
    mensajeError?: string | null;
  }
) {
  return prisma.ejecucionGeneracionCargo.update({
    where: { id },
    data,
  });
}

export async function updateEjecucionProgreso(
  id: string,
  data: {
    cantidadProcesadas: number;
    cantidadGeneradas: number;
    cantidadOmitidas: number;
    cantidadErrores: number;
    montoGenerado: Prisma.Decimal | number;
  }
) {
  return prisma.ejecucionGeneracionCargo.update({
    where: { id },
    data,
  });
}

export async function createDetalle(data: {
  ejecucionId: string;
  cuentaServicioId: string;
  clienteId: string;
  resultado: ResultadoGeneracion;
  mensaje?: string | null;
}) {
  return prisma.ejecucionGeneracionCargoDetalle.create({
    data,
  });
}

export async function findEjecucionesByEmpresa(
  empresaId: string,
  filters?: {
    estado?: EstadoEjecucionGeneracion;
    periodo?: string;
  },
  pagination?: { page: number; limit: number }
) {
  const page = pagination?.page ?? 1;
  const limit = pagination?.limit ?? 20;
  const skip = (page - 1) * limit;

  const where: Prisma.EjecucionGeneracionCargoWhereInput = {
    empresaId,
    estado: filters?.estado,
    periodo: filters?.periodo,
  };

  const [ejecuciones, total] = await Promise.all([
    prisma.ejecucionGeneracionCargo.findMany({
      where,
      include: ejecucionListInclude,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.ejecucionGeneracionCargo.count({ where }),
  ]);

  return { ejecuciones, total };
}

export async function findEjecucionById(id: string) {
  return prisma.ejecucionGeneracionCargo.findUnique({
    where: { id },
    include: ejecucionListInclude,
  });
}

export async function findDetallesByEjecucion(
  ejecucionId: string,
  filters?: { resultado?: ResultadoGeneracion },
  pagination?: { page: number; limit: number }
) {
  const page = pagination?.page ?? 1;
  const limit = pagination?.limit ?? 20;
  const skip = (page - 1) * limit;

  const where: Prisma.EjecucionGeneracionCargoDetalleWhereInput = {
    ejecucionId,
    resultado: filters?.resultado,
  };

  const [detalles, total] = await Promise.all([
    prisma.ejecucionGeneracionCargoDetalle.findMany({
      where,
      include: detalleListInclude,
      orderBy: { createdAt: "asc" },
      skip,
      take: limit,
    }),
    prisma.ejecucionGeneracionCargoDetalle.count({ where }),
  ]);

  return { detalles, total };
}

export async function findCuentaServicioIdsGeneradas(ejecucionId: string) {
  const detalles = await prisma.ejecucionGeneracionCargoDetalle.findMany({
    where: { ejecucionId, resultado: ResultadoGeneracion.GENERADO },
    select: { cuentaServicioId: true },
  });

  return detalles.map((detalle) => detalle.cuentaServicioId);
}

const cargoGeneradoInclude = {
  cliente: {
    select: {
      id: true,
      codigo: true,
      nombreRazonSocial: true,
    },
  },
  cuentaServicio: {
    select: {
      id: true,
      codigo: true,
      nombre: true,
      estado: true,
    },
  },
} satisfies Prisma.CargoInclude;

export type CargoGeneradoItem = Prisma.CargoGetPayload<{
  include: typeof cargoGeneradoInclude;
}>;

export async function findCargosPorCuentas(
  empresaId: string,
  periodo: string,
  cuentaServicioIds: string[],
  pagination?: { page: number; limit: number }
) {
  const page = pagination?.page ?? 1;
  const limit = pagination?.limit ?? 20;
  const skip = (page - 1) * limit;

  const where: Prisma.CargoWhereInput = {
    empresaId,
    tipoCargo: TipoCargo.SERVICIO,
    periodoReferencia: periodo,
    cuentaServicioId: { in: cuentaServicioIds },
  };

  const [cargos, total] = await Promise.all([
    prisma.cargo.findMany({
      where,
      include: cargoGeneradoInclude,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.cargo.count({ where }),
  ]);

  return { cargos, total };
}
