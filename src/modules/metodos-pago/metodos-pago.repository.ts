import prisma from "../../config/prisma";
import { EstadoRegistroBasico } from "@prisma/client";

export async function findMetodosPagoByEmpresa(empresaId: string) {
  return prisma.metodoPago.findMany({
    where: { empresaId },
    orderBy: { createdAt: "desc" },
  });
}

export async function findMetodoPagoById(id: string) {
  return prisma.metodoPago.findUnique({
    where: { id },
  });
}

export async function findMetodoPagoByName(empresaId: string, nombre: string) {
  return prisma.metodoPago.findFirst({
    where: {
      empresaId,
      nombre,
    },
  });
}

export async function createMetodoPago(data: {
  empresaId: string;
  nombre: string;
  descripcion?: string;
}) {
  return prisma.metodoPago.create({
    data: {
      empresaId: data.empresaId,
      nombre: data.nombre,
      descripcion: data.descripcion,
      estado: EstadoRegistroBasico.ACTIVO,
    },
  });
}

export async function updateMetodoPago(
  id: string,
  data: {
    nombre?: string;
    descripcion?: string;
  }
) {
  return prisma.metodoPago.update({
    where: { id },
    data,
  });
}

export async function updateMetodoPagoStatus(
  id: string,
  estado: EstadoRegistroBasico
) {
  return prisma.metodoPago.update({
    where: { id },
    data: { estado },
  });
}