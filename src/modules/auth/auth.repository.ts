import prisma from "../../config/prisma";

export async function findUserByEmail(email: string) {
  return prisma.usuario.findFirst({
    where: { email },
    include: {
      rol: true,
      empresa: true,
    },
  });
}

export async function updateLastAccess(userId: string) {
  return prisma.usuario.update({
    where: { id: userId },
    data: {
      ultimoAcceso: new Date(),
    },
  });
}