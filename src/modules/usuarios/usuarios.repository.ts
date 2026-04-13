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