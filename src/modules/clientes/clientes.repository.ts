import prisma from "../../config/prisma";
import {
  EstadoRegistroBasico,
  TipoCliente,
  TipoIdentificacion,
} from "@prisma/client";

export async function findClientesByEmpresa(empresaId: string) {
  return prisma.cliente.findMany({
    where: { empresaId },
    orderBy: { createdAt: "desc" },
  });
}

export async function findClienteById(id: string) {
  return prisma.cliente.findUnique({
    where: { id }
  });
}

export async function getPagosByClient(id: string) {
  return prisma.pago.findMany({
    where: {clienteId: id},
      include: {
          metodoPago: {
            select: {
              id: true,
              nombre: true,
            },
          },
          registradoBy: {
            select: {
              id: true,
              nombres: true,
              apellidos: true
            },
          },
      },
  })
}

export async function getCuentasByClient(id: string) {
  return prisma.cuentaServicio.findMany({
    where: {clienteId: id},
      include: {
        tipoServicio: {
          select: {
            nombre: true
          }
        }
      }
  })
}

export async function findClienteByCodigo(empresaId: string, codigo: string) {
  return prisma.cliente.findFirst({
    where: {
      empresaId,
      codigo,
    },
  });
}

export async function searchClientesForSelect( empresaId: string, options?: { search?: string}
) {
  const { search } = options ?? {};

  return prisma.cliente.findMany({
    where: {
      empresaId,
      ...(search && {
        OR: [
          { nombreRazonSocial: { contains: search, mode: "insensitive" as const } },
          { codigo: { contains: search, mode: "insensitive" as const } },
        ],
      }),
    },
    orderBy: { nombreRazonSocial: "asc" },
    select: {
      id: true,
      codigo: true,
      nombreRazonSocial: true,
    },
  });
}

export async function createCliente(data: {
  empresaId: string;
  codigo: string;
  tipoCliente: TipoCliente;
  primerNombre?: string;
  segundoNombre?: string;
  primerApellido?: string;
  segundoApellido?: string;
  nombreRazonSocial: string;
  nombreComercial?: string;
  tipoIdentificacion?: TipoIdentificacion;
  identificacion?: string;
  telefono?: string;
  email?: string;
  direccionFiscal?: string;
  observaciones?: string;
}) {
  return prisma.cliente.create({
    data: {
      empresaId: data.empresaId,
      codigo: data.codigo,
      tipoCliente: data.tipoCliente,
      primerNombre: data.primerNombre,
      segundoNombre: data.segundoNombre,
      primerApellido: data.primerApellido,
      segundoApellido: data.segundoApellido,
      nombreRazonSocial: data.nombreRazonSocial,
      nombreComercial: data.nombreComercial,
      tipoIdentificacion: data.tipoIdentificacion,
      identificacion: data.identificacion,
      telefono: data.telefono,
      email: data.email,
      direccionFiscal: data.direccionFiscal,
      observaciones: data.observaciones,
      estado: EstadoRegistroBasico.ACTIVO,
    },
  });
}

export async function updateCliente(
  id: string,
  data: {
    tipoCliente?: TipoCliente;
    primerNombre?: string;
    segundoNombre?: string;
    primerApellido?: string;
    segundoApellido?: string;
    nombreRazonSocial?: string;
    nombreComercial?: string;
    tipoIdentificacion?: TipoIdentificacion;
    identificacion?: string;
    telefono?: string;
    email?: string;
    direccionFiscal?: string;
    observaciones?: string;
  }
) {
  return prisma.cliente.update({
    where: { id },
    data,
  });
}

export async function updateClienteStatus(
  id: string,
  estado: EstadoRegistroBasico
) {
  return prisma.cliente.update({
    where: { id },
    data: { estado },
  });
}