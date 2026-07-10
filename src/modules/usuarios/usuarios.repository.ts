import { Prisma } from "@prisma/client";
import prisma from "../../config/prisma";

export async function findUsersByEmpresa(empresaId: string) {
  return prisma.usuario.findMany({
    where: { empresaId },
    include: {
      rol: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

function nombreCompletoWhere(search: string): Prisma.UsuarioWhereInput {
  const searchTerms = search.trim().split(/\s+/).filter(Boolean);

  if (searchTerms.length === 0) {
    return {};
  }

  return {
    AND: searchTerms.map((term) => ({
      OR: [
        { nombres: { contains: term, mode: "insensitive" as const } },
        { apellidos: { contains: term, mode: "insensitive" as const } },
      ],
    })),
  };
}

export async function searchUsersByNombreCompleto(
  empresaId: string,
  filters?: {
    search?: string;
  }
) {
  return prisma.usuario.findMany({
    where: {
      empresaId,
      ...(filters?.search && nombreCompletoWhere(filters.search)),
    },
    include: {
      rol: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function findUserById(id: string) {
  return prisma.usuario.findUnique({
    where: { id },
  });
}

export async function findUserByEmail(empresaId: string, email: string) {
  return prisma.usuario.findFirst({
    where: {
      empresaId,
      email,
    },
  });
}

export async function createUser(data: any) {
  return prisma.usuario.create({
    data,
  });
}

export async function updateUser(id: string, data: any) {
  return prisma.usuario.update({
    where: { id },
    data,
  });
}