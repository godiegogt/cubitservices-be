import { Prisma, EstadoRegistroBasico } from "@prisma/client";
import { ClientesReportFilters } from "./clientes-report.dto";

export function buildClientesWhereClause(
  empresaId: string,
  filters: ClientesReportFilters,
): { where: Prisma.ClienteWhereInput; whereBase: Prisma.ClienteWhereInput } {
  const { estado, zonaId, servicioId, search, fechaInicio, fechaFin } =
    filters;

  const createdAtFilter: { gte?: Date; lte?: Date } = {};
  if (fechaInicio)
    createdAtFilter.gte = new Date(`${fechaInicio}T00:00:00.000Z`);
  if (fechaFin) createdAtFilter.lte = new Date(`${fechaFin}T23:59:59.999Z`);

  const whereBase: Prisma.ClienteWhereInput = {
    empresaId,
    ...(Object.keys(createdAtFilter).length && { createdAt: createdAtFilter }),
    ...(zonaId !== undefined && { ubicaciones: { some: { zona: zonaId } } }),
    ...(servicioId && {
      cuentasServicio: { some: { tipoServicioId: servicioId } },
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
    ...(estado && { estado: estado as EstadoRegistroBasico }),
  };

  return { where, whereBase };
}
