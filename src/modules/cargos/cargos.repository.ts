import {
  EstadoCargo,
  Prisma,
  TipoCargo,
  TipoMora,
} from "@prisma/client";
import prisma from "../../config/prisma";

const cargoListInclude = {
  cliente: {
    select: {
      id: true,
      codigo: true,
      nombreRazonSocial: true,
    },
  },
  cuentaServicio: {
    select: {
      id: true,
      codigo: true,
      nombre: true,
      estado: true,
    },
  },
  ordenServicio: {
    select: {
      id: true,
      numeroOrden: true,
      titulo: true,
    },
  },
  politicaCobro: {
    select: {
      id: true,
      nombre: true,
    },
  },
} satisfies Prisma.CargoInclude;

const cargoDetailInclude = {
  ...cargoListInclude,
  politicaCobro: {
    select: {
      id: true,
      nombre: true,
      tipoVencimiento: true,
      diaCorte: true,
      diaVencimiento: true,
      diasGracia: true,
      aplicaMora: true,
      tipoMora: true,
      valorMora: true,
    },
  },
} satisfies Prisma.CargoInclude;

export type CargoListItem = Prisma.CargoGetPayload<{
  include: typeof cargoListInclude;
}>;

export type CargoDetail = Prisma.CargoGetPayload<{
  include: typeof cargoDetailInclude;
}>;

export async function findCargosByEmpresa(
  empresaId: string,
  filters?: {
    clienteId?: string;
    cuentaServicioId?: string;
    estado?: EstadoCargo;
    tipoCargo?: TipoCargo;
    periodoReferencia?: string;
    search?: string;
  },
  pagination?: {
    page: number;
    limit: number;
  }
) {
  const page  = pagination?.page  ?? 1;
  const limit = pagination?.limit ?? 20;
  const skip  = (page - 1) * limit;

  const where: Prisma.CargoWhereInput = {
    empresaId,
    clienteId: filters?.clienteId,
    cuentaServicioId: filters?.cuentaServicioId,
    estado: filters?.estado,
    tipoCargo: filters?.tipoCargo,
    periodoReferencia: filters?.periodoReferencia,
    ...(filters?.search
      ? {
          OR: [
            { concepto: { contains: filters.search, mode: "insensitive" } },
            {
              periodoReferencia: {
                contains: filters.search,
                mode: "insensitive",
              },
            },
          ],
        }
      : {}),
  };

  const [cargos, total] = await Promise.all([
    prisma.cargo.findMany({
      where,
      include: cargoListInclude,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.cargo.count({ where }),
  ]);

  return { cargos, total };
}

export async function findCargoById(id: string) {
  return prisma.cargo.findUnique({
    where: { id },
    include: cargoDetailInclude,
  });
}

export async function findCuentaServicioById(id: string) {
  return prisma.cuentaServicio.findUnique({
    where: { id },
  });
}

export async function findOrdenServicioById(id: string) {
  return prisma.ordenServicio.findUnique({
    where: { id },
  });
}

export async function findPoliticaCobroById(id: string) {
  return prisma.politicaCobro.findUnique({
    where: { id },
  });
}

export async function findDuplicateServicioCargo(input: {
  empresaId: string;
  cuentaServicioId: string;
  periodoReferencia: string;
}) {
  return prisma.cargo.findFirst({
    where: {
      empresaId: input.empresaId,
      cuentaServicioId: input.cuentaServicioId,
      tipoCargo: TipoCargo.SERVICIO,
      periodoReferencia: input.periodoReferencia,
    },
  });
}

export async function createCargo(data: {
  empresaId: string;
  clienteId: string;
  cuentaServicioId: string;
  ordenServicioId?: string | null;
  politicaCobroId?: string | null;
  tipoCargo: TipoCargo;
  concepto: string;
  periodoReferencia?: string | null;
  monto: number;
  saldo: number;
  fechaEmision: Date;
  fechaVencimiento?: Date | null;
  diasGraciaAplicados?: number | null;
  tipoMoraAplicada?: TipoMora | null;
  valorMoraAplicado?: Prisma.Decimal | number | null;
  estado: EstadoCargo;
}) {
  return prisma.cargo.create({
    data: {
      empresaId: data.empresaId,
      clienteId: data.clienteId,
      cuentaServicioId: data.cuentaServicioId,
      ordenServicioId: data.ordenServicioId,
      politicaCobroId: data.politicaCobroId,
      tipoCargo: data.tipoCargo,
      concepto: data.concepto,
      periodoReferencia: data.periodoReferencia,
      monto: data.monto,
      saldo: data.saldo,
      fechaEmision: data.fechaEmision,
      fechaVencimiento: data.fechaVencimiento,
      diasGraciaAplicados: data.diasGraciaAplicados,
      tipoMoraAplicada: data.tipoMoraAplicada,
      valorMoraAplicado: data.valorMoraAplicado,
      estado: data.estado,
    },
    include: cargoDetailInclude,
  });
}

export async function updateCargoStatus(id: string, estado: EstadoCargo) {
  return prisma.cargo.update({
    where: { id },
    data: { estado },
    select: {
      id: true,
      estado: true,
    },
  });
}
