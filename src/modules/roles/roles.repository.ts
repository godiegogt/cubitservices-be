import prisma from "../../config/prisma";
import { EstadoRegistroBasico } from "@prisma/client";

export async function findRolesByEmpresa(empresaId: string) {
  return prisma.rol.findMany({
    where: { empresaId },
    orderBy: { createdAt: "desc" },
  });
}

export async function findRoleById(id: string) {
  return prisma.rol.findUnique({
    where: { id },
  });
}

export async function findRoleByName(empresaId: string, nombre: string) {
  return prisma.rol.findFirst({
    where: {
      empresaId,
      nombre,
    },
  });
}

export async function createRole(data: {
  empresaId: string;
  nombre: string;
  descripcion?: string;
}) {
  return prisma.rol.create({
    data: {
      empresaId: data.empresaId,
      nombre: data.nombre,
      descripcion: data.descripcion,
      estado: EstadoRegistroBasico.ACTIVO,
    },
  });
}

export async function updateRole(
  id: string,
  data: {
    nombre?: string;
    descripcion?: string;
  }
) {
  return prisma.rol.update({
    where: { id },
    data,
  });
}

export async function updateRoleStatus(id: string, estado: EstadoRegistroBasico) {
  return prisma.rol.update({
    where: { id },
    data: { estado },
  });
}