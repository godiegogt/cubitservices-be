import {
  EstadoCuentaServicio,
  EstadoRegistroBasico,
  FrecuenciaServicio,
  ModalidadServicio,
  Prisma,
} from "@prisma/client";
import prisma from "../../config/prisma";

const cuentaServicioInclude = {
  cliente: {
    select: {
      id: true,
      codigo: true,
      nombreRazonSocial: true,
      nombreComercial: true,
      telefono: true,
      estado: true,
    },
  },
  ubicacion: {
    select: {
      id: true,
      nombre: true,
      direccion: true,
      referencia: true,
      estado: true,
    },
  },
  tipoServicio: {
    select: {
      id: true,
      nombre: true,
      descripcion: true,
      precioBase: true,
      estado: true,
    },
  },
  politicaCobro: {
    select: {
      id: true,
      nombre: true,
      tipoVencimiento: true,
      diaCorte: true,
      diaVencimiento: true,
      diasGracia: true,
      aplicaMora: true,
      estado: true,
    },
  },
} satisfies Prisma.CuentaServicioInclude;

export type CuentaServicioWithRelations = Prisma.CuentaServicioGetPayload<{
  include: typeof cuentaServicioInclude;
}>;

export async function findCuentasServicioByEmpresa(
  empresaId: string,
  filters?: {
    clienteId?: string;
    estado?: EstadoCuentaServicio;
    tipoServicioId?: string;
    search?: string;
  }
) {
  return prisma.cuentaServicio.findMany({
    where: {
      empresaId,
      clienteId: filters?.clienteId,
      estado: filters?.estado,
      tipoServicioId: filters?.tipoServicioId,
      ...(filters?.search
        ? {
            OR: [
              { codigo: { contains: filters.search, mode: "insensitive" } },
              { nombre: { contains: filters.search, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: cuentaServicioInclude,
    orderBy: { createdAt: "desc" },
  });
}

export async function findCuentaServicioById(id: string) {
  return prisma.cuentaServicio.findUnique({
    where: { id },
    include: cuentaServicioInclude,
  });
}

export async function findCuentaServicioByCodigo(empresaId: string, codigo: string) {
  return prisma.cuentaServicio.findFirst({
    where: {
      empresaId,
      codigo,
    },
  });
}

export async function findClienteById(id: string) {
  return prisma.cliente.findUnique({
    where: { id },
  });
}

export async function findUbicacionById(id: string) {
  return prisma.clienteUbicacion.findUnique({
    where: { id },
  });
}

export async function findTipoServicioById(id: string) {
  return prisma.tipoServicio.findUnique({
    where: { id },
  });
}

export async function findPoliticaCobroById(id: string) {
  return prisma.politicaCobro.findUnique({
    where: { id },
  });
}

export async function createCuentaServicio(data: {
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
  fechaInicio?: Date;
  fechaFin?: Date | null;
  montoBase: number;
  diaCorte?: number;
  diaPago?: number;
  observaciones?: string;
}) {
  return prisma.cuentaServicio.create({
    data: {
      empresaId: data.empresaId,
      clienteId: data.clienteId,
      ubicacionId: data.ubicacionId,
      tipoServicioId: data.tipoServicioId,
      politicaCobroId: data.politicaCobroId,
      codigo: data.codigo,
      nombre: data.nombre,
      descripcion: data.descripcion,
      modalidad: data.modalidad,
      frecuencia: data.frecuencia,
      fechaInicio: data.fechaInicio,
      fechaFin: data.fechaFin,
      montoBase: data.montoBase,
      diaCorte: data.diaCorte,
      diaPago: data.diaPago,
      observaciones: data.observaciones,
      estado: EstadoCuentaServicio.ACTIVA,
    },
    include: cuentaServicioInclude,
  });
}

export async function updateCuentaServicio(
  id: string,
  data: {
    clienteId?: string;
    ubicacionId?: string | null;
    tipoServicioId?: string;
    politicaCobroId?: string | null;
    codigo?: string;
    nombre?: string;
    descripcion?: string;
    modalidad?: ModalidadServicio;
    frecuencia?: FrecuenciaServicio | null;
    fechaInicio?: Date | null;
    fechaFin?: Date | null;
    montoBase?: number;
    diaCorte?: number | null;
    diaPago?: number | null;
    observaciones?: string;
  }
) {
  return prisma.cuentaServicio.update({
    where: { id },
    data,
    include: cuentaServicioInclude,
  });
}

export async function updateCuentaServicioStatus(
  id: string,
  estado: EstadoCuentaServicio
) {
  return prisma.cuentaServicio.update({
    where: { id },
    data: { estado },
    include: cuentaServicioInclude,
  });
}
