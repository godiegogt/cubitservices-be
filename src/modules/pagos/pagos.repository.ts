import { EstadoCargo, EstadoPago, Prisma } from "@prisma/client";
import prisma from "../../config/prisma";

const pagoListInclude = {
  cliente: {
    select: {
      id: true,
      codigo: true,
      nombreRazonSocial: true,
    },
  },
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
      apellidos: true,
    },
  },
  aplicaciones: {
    select: {
      montoAplicado: true,
    },
  },
} satisfies Prisma.PagoInclude;

const pagoDetailInclude = {
  cliente: pagoListInclude.cliente,
  metodoPago: pagoListInclude.metodoPago,
  registradoBy: pagoListInclude.registradoBy,
  aplicaciones: {
    select: {
      id: true,
      pagoId: true,
      cargoId: true,
      montoAplicado: true,
      createdAt: true,
      cargo: {
        select: {
          id: true,
          concepto: true,
          periodoReferencia: true,
          monto: true,
          saldo: true,
          estado: true,
        },
      },
    },
  },
} satisfies Prisma.PagoInclude;

export type PagoListItem = Prisma.PagoGetPayload<{
  include: typeof pagoListInclude;
}>;

export type PagoDetail = Prisma.PagoGetPayload<{
  include: typeof pagoDetailInclude;
}>;

type PrismaClientLike = typeof prisma | Prisma.TransactionClient;

export async function findPagosByEmpresa(
  empresaId: string,
  filters?: {
    clienteId?: string;
    metodoPagoId?: string;
    estado?: EstadoPago;
    fechaDesde?: Date;
    fechaHasta?: Date;
    search?: string;
  },
  pagination?: {
    page: number;
    limit: number;
  }
) {
  const page = pagination?.page ?? 1;
  const limit = pagination?.limit ?? 20;
  const skip = (page - 1) * limit;

  const where: Prisma.PagoWhereInput = {
    empresaId,
    clienteId: filters?.clienteId,
    metodoPagoId: filters?.metodoPagoId,
    estado: filters?.estado,
    ...(filters?.fechaDesde || filters?.fechaHasta
      ? {
          fechaPago: {
            gte: filters.fechaDesde,
            lte: filters.fechaHasta,
          },
        }
      : {}),
    ...(filters?.search
      ? {
          OR: [
            { referencia: { contains: filters.search, mode: "insensitive" } },
            {
              observaciones: {
                contains: filters.search,
                mode: "insensitive",
              },
            },
          ],
        }
      : {}),
  };

  const [pagos, total] = await Promise.all([
    prisma.pago.findMany({
      where,
      include: pagoListInclude,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.pago.count({ where }),
  ]);

  return { pagos, total };
}

export async function findPagoById(id: string, client: PrismaClientLike = prisma) {
  return client.pago.findUnique({
    where: { id },
    include: pagoDetailInclude,
  });
}

export async function findClienteById(id: string) {
  return prisma.cliente.findUnique({
    where: { id },
  });
}

export async function findMetodoPagoById(id: string) {
  return prisma.metodoPago.findUnique({
    where: { id },
  });
}

export async function createPago(data: {
  empresaId: string;
  clienteId: string;
  metodoPagoId: string;
  registradoPor: string;
  montoTotal: number;
  referencia?: string;
  fechaPago: Date;
  fechaRegistro: Date;
  estado: EstadoPago;
  observaciones?: string;
}) {
  return prisma.pago.create({
    data,
  });
}

export async function updatePagoStatus(
  id: string,
  estado: EstadoPago,
  client: PrismaClientLike = prisma
) {
  return client.pago.update({
    where: { id },
    data: { estado },
    select: {
      id: true,
      estado: true,
    },
  });
}

export async function findCargosByIds(
  ids: string[],
  client: PrismaClientLike = prisma
) {
  return client.cargo.findMany({
    where: {
      id: { in: ids },
    },
  });
}

export async function createAplicacionesPago(
  aplicaciones: {
    pagoId: string;
    cargoId: string;
    montoAplicado: Prisma.Decimal;
  }[],
  client: PrismaClientLike = prisma
) {
  return client.aplicacionPago.createMany({
    data: aplicaciones,
  });
}

export async function updateCargoSaldoEstado(
  id: string,
  saldo: Prisma.Decimal,
  estado: EstadoCargo,
  client: PrismaClientLike = prisma
) {
  return client.cargo.update({
    where: { id },
    data: {
      saldo,
      estado,
    },
  });
}

export async function findAplicacionesByPagoId(
  pagoId: string,
  client: PrismaClientLike = prisma
) {
  return client.aplicacionPago.findMany({
    where: { pagoId },
  });
}

export async function getPagoWithDetail(
  id: string,
  client: PrismaClientLike = prisma
) {
  return client.pago.findUnique({
    where: { id },
    include: pagoDetailInclude,
  });
}
