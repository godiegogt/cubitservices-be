import prisma from "../../config/prisma";
import { EstadoRegistroBasico, CategoriaServicio } from "@prisma/client";

export async function findTiposServicioByEmpresa(empresaId: string) {
  return prisma.tipoServicio.findMany({
    where: { empresaId },
    orderBy: { createdAt: "desc" },
  });
}

export async function findTipoServicioById(id: string) {
  return prisma.tipoServicio.findUnique({
    where: { id },
  });
}

export async function findTipoServicioByName(empresaId: string, nombre: string) {
  return prisma.tipoServicio.findFirst({
    where: {
      empresaId,
      nombre,
    },
  });
}

export async function createTipoServicio(data: {
  empresaId: string;
  nombre: string;
  descripcion?: string;
  precioBase: number;
  categoriaServicio: CategoriaServicio;
}) {
  return prisma.tipoServicio.create({
    data: {
      empresaId: data.empresaId,
      nombre: data.nombre,
      descripcion: data.descripcion,
      precioBase: data.precioBase,
      categoriaServicio: data.categoriaServicio,
      estado: EstadoRegistroBasico.ACTIVO,
    },
  });
}

export async function updateTipoServicio(
  id: string,
  data: {
    nombre?: string;
    descripcion?: string;
    precioBase?: number;
    categoriaServicio?: CategoriaServicio;
  }
) {
  return prisma.tipoServicio.update({
    where: { id },
    data,
  });
}

export async function updateTipoServicioStatus(
  id: string,
  estado: EstadoRegistroBasico
) {
  return prisma.tipoServicio.update({
    where: { id },
    data: { estado },
  });
}