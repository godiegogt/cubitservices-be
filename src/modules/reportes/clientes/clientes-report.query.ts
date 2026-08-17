import { Prisma } from "@prisma/client";
import { startOfDay, endOfDay } from "../../../common/utils/datetime";
import { ClientesReportFilters } from "./clientes-report.dto";

export function buildClientesWhereClause(
  empresaId: string,
  filters: ClientesReportFilters,
): { where: Prisma.ClienteWhereInput; whereBase: Prisma.ClienteWhereInput } {
  const { estado, zonaId, aldea, servicioId, search, fechaInicio, fechaFin } =
    filters;

  const createdAtFilter: { gte?: Date; lte?: Date } = {};
  if (fechaInicio) createdAtFilter.gte = startOfDay(fechaInicio);
  if (fechaFin) createdAtFilter.lte = endOfDay(fechaFin);

  const whereBase: Prisma.ClienteWhereInput = {
    empresaId,
    ...(Object.keys(createdAtFilter).length && { createdAt: createdAtFilter }),
    ...((zonaId !== undefined || aldea !== undefined) && {
      ubicaciones: {
        some: {
          ...(zonaId !== undefined && { zona: { equals: zonaId, mode: "insensitive" as const } }),
          ...(aldea !== undefined && { aldea: { equals: aldea, mode: "insensitive" as const } }),
        },
      },
    }),
    ...(servicioId && {
      cuentasServicio: {
        some: { codigo: { contains: servicioId, mode: "insensitive" } },
      },
    }),
    ...(search && {
      OR: [
        { nombreRazonSocial: { contains: search, mode: "insensitive" } },
        { codigo: { contains: search, mode: "insensitive" } },
        { telefono: { contains: search, mode: "insensitive" } },
      ],
    }),
  };

  const where: Prisma.ClienteWhereInput = {
    ...whereBase,
    ...(estado && { estado }),
  };

  return { where, whereBase };
}
