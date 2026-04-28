import {
  EstadoOrdenServicio,
  OrigenOrden,
  Prisma,
  PrioridadOrden,
} from "@prisma/client";
import prisma from "../../config/prisma";

const ordenServicioInclude = {
  cuentaServicio: {
    select: {
      id: true,
      codigo: true,
      nombre: true,
      estado: true,
    },
  },
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
} satisfies Prisma.OrdenServicioInclude;

const ordenServicioEstadoInclude = {
  usuario: {
    select: {
      id: true,
      nombres: true,
      apellidos: true,
      email: true,
    },
  },
} satisfies Prisma.OrdenServicioEstadoInclude;

export async function findOrdenesByEmpresa(
  empresaId: string,
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
  return prisma.ordenServicio.findMany({
    where: {
      empresaId,
      estado: filters?.estado,
      clienteId: filters?.clienteId,
      cuentaServicioId: filters?.cuentaServicioId,
      tipoServicioId: filters?.tipoServicioId,
      prioridad: filters?.prioridad,
      origen: filters?.origen,
      ...(filters?.search
        ? {
            OR: [
              { numeroOrden: { contains: filters.search, mode: "insensitive" } },
              { titulo: { contains: filters.search, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: ordenServicioInclude,
    orderBy: { createdAt: "desc" },
  });
}

export async function findOrdenById(id: string) {
  return prisma.ordenServicio.findUnique({
    where: { id },
    include: ordenServicioInclude,
  });
}

export async function findOrdenByNumero(empresaId: string, numeroOrden: string) {
  return prisma.ordenServicio.findFirst({
    where: {
      empresaId,
      numeroOrden,
    },
  });
}

export async function countOrdenesByEmpresa(empresaId: string) {
  return prisma.ordenServicio.count({
    where: { empresaId },
  });
}

export async function findCuentaServicioById(id: string) {
  return prisma.cuentaServicio.findUnique({
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

export async function createOrden(data: {
  empresaId: string;
  cuentaServicioId: string;
  clienteId: string;
  ubicacionId: string;
  tipoServicioId: string;
  numeroOrden: string;
  titulo: string;
  descripcion?: string;
  origen: OrigenOrden;
  prioridad: PrioridadOrden;
  estado: EstadoOrdenServicio;
  fechaProgramada?: Date;
  requiereEvidenciaFinal?: boolean;
  observacionesGenerales?: string;
  usuarioId: string;
}) {
  return prisma.$transaction(async (tx) => {
    const orden = await tx.ordenServicio.create({
      data: {
        empresaId: data.empresaId,
        cuentaServicioId: data.cuentaServicioId,
        clienteId: data.clienteId,
        ubicacionId: data.ubicacionId,
        tipoServicioId: data.tipoServicioId,
        numeroOrden: data.numeroOrden,
        titulo: data.titulo,
        descripcion: data.descripcion,
        origen: data.origen,
        prioridad: data.prioridad,
        estado: data.estado,
        fechaProgramada: data.fechaProgramada,
        requiereEvidenciaFinal: data.requiereEvidenciaFinal ?? false,
        observacionesGenerales: data.observacionesGenerales,
      },
      include: ordenServicioInclude,
    });

    await tx.ordenServicioEstado.create({
      data: {
        ordenServicioId: orden.id,
        estadoAnterior: null,
        estadoNuevo: data.estado,
        motivo: "Orden creada",
        usuarioId: data.usuarioId,
      },
    });

    return orden;
  });
}

export async function updateOrden(
  id: string,
  data: {
    titulo?: string;
    descripcion?: string;
    ubicacionId?: string;
    tipoServicioId?: string;
    origen?: OrigenOrden;
    prioridad?: PrioridadOrden;
    fechaProgramada?: Date;
    requiereEvidenciaFinal?: boolean;
    observacionesGenerales?: string;
  }
) {
  return prisma.ordenServicio.update({
    where: { id },
    data,
    include: ordenServicioInclude,
  });
}

export async function updateOrdenStatus(
  id: string,
  data: {
    estadoAnterior: EstadoOrdenServicio;
    estadoNuevo: EstadoOrdenServicio;
    motivo?: string;
    usuarioId: string;
    fechaInicio?: Date;
    fechaCierre?: Date;
    motivoCancelacion?: string;
  }
) {
  return prisma.$transaction(async (tx) => {
    const orden = await tx.ordenServicio.update({
      where: { id },
      data: {
        estado: data.estadoNuevo,
        fechaInicio: data.fechaInicio,
        fechaCierre: data.fechaCierre,
        motivoCancelacion: data.motivoCancelacion,
      },
      include: ordenServicioInclude,
    });

    await tx.ordenServicioEstado.create({
      data: {
        ordenServicioId: id,
        estadoAnterior: data.estadoAnterior,
        estadoNuevo: data.estadoNuevo,
        motivo: data.motivo,
        usuarioId: data.usuarioId,
      },
    });

    return orden;
  });
}

export async function findEstadosByOrdenId(ordenServicioId: string) {
  return prisma.ordenServicioEstado.findMany({
    where: { ordenServicioId },
    include: ordenServicioEstadoInclude,
    orderBy: { createdAt: "asc" },
  });
}
