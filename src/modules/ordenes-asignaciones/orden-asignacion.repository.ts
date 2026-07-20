import { EstadoAsignacionOrden, Prisma, RolEnOrden } from "@prisma/client";
import prisma from "../../config/prisma";

const ordenServicioAsignacionInclude = {
  usuario: {
    select: {
      id: true,
      nombres: true,
      apellidos: true,
      email: true,
    },
  },
  asignador: {
    select: {
      id: true,
      nombres: true,
      apellidos: true,
      email: true,
    },
  },
} satisfies Prisma.OrdenServicioAsignacionInclude;

export async function findAsignacionesByOrdenId(ordenServicioId: string) {
  return prisma.ordenServicioAsignacion.findMany({
    where: { ordenServicioId },
    include: ordenServicioAsignacionInclude,
    orderBy: { createdAt: "desc" },
  });
}

export async function findAsignacionActiva(
  ordenServicioId: string,
  usuarioId: string,
  rolEnOrden: RolEnOrden
) {
  return prisma.ordenServicioAsignacion.findFirst({
    where: {
      ordenServicioId,
      usuarioId,
      rolEnOrden,
      estado: EstadoAsignacionOrden.ACTIVA,
    },
  });
}

export async function findAsignacionById(id: string) {
  return prisma.ordenServicioAsignacion.findUnique({
    where: { id },
    include: ordenServicioAsignacionInclude,
  });
}

export async function createAsignacion(data: {
  ordenServicioId: string;
  usuarioId: string;
  rolEnOrden: RolEnOrden;
  asignadoPor: string;
}) {
  return prisma.ordenServicioAsignacion.create({
    data: {
      ordenServicioId: data.ordenServicioId,
      usuarioId: data.usuarioId,
      rolEnOrden: data.rolEnOrden,
      asignadoPor: data.asignadoPor,
      estado: EstadoAsignacionOrden.ACTIVA,
      fechaAsignacion: new Date(),
    },
    include: ordenServicioAsignacionInclude,
  });
}

export async function updateAsignacionEstado(
  id: string,
  estado: EstadoAsignacionOrden
) {
  return prisma.ordenServicioAsignacion.update({
    where: { id },
    data: { estado },
    include: ordenServicioAsignacionInclude,
  });
}
