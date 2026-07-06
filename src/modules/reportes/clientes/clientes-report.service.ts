import { EstadoRegistroBasico } from "@prisma/client";
import prisma from "../../../config/prisma";
import {
  ClientesReportFilters,
  ClientesReportResultDto,
} from "./clientes-report.dto";
import { mapClienteToItem } from "./clientes-report.mapper";
import { buildClientesWhereClause } from "./clientes-report.query";

export async function generarReporteClientes(
  empresaId: string,
  filters: ClientesReportFilters,
): Promise<ClientesReportResultDto> {
  const { page = 1, pageSize = 50, fetchAll = false } = filters;
  const { where, whereBase } = buildClientesWhereClause(empresaId, filters);

  const [clientes, total, activos, inactivos] = await Promise.all([
    prisma.cliente.findMany({
      where,
      include: {
        _count: { select: { cuentasServicio: true } },
        ubicaciones: { select: { zona: true } },
        cuentasServicio: {
          select: {
            nombre: true,
            tipoServicio: { select: { nombre: true } },
            ubicacion: { select: { zona: true } },
          },
        },
      },
      orderBy: { nombreRazonSocial: "asc" },
      ...(!fetchAll && { skip: (page - 1) * pageSize, take: pageSize }),
    }),
    prisma.cliente.count({ where }),
    prisma.cliente.count({
      where: { ...whereBase, estado: EstadoRegistroBasico.ACTIVO },
    }),
    prisma.cliente.count({
      where: { ...whereBase, estado: EstadoRegistroBasico.INACTIVO },
    }),
  ]);

  const filtersDto: ClientesReportResultDto["filters"] = {
    ...(filters.estado && { estado: filters.estado }),
    ...(filters.zonaId !== undefined && { zonaId: filters.zonaId }),
    ...(filters.servicio && { servicio: filters.servicio }),
    ...(filters.search && { search: filters.search }),
    ...(filters.fechaInicio && { fechaInicio: filters.fechaInicio }),
    ...(filters.fechaFin && { fechaFin: filters.fechaFin }),
  };

  const effectivePage = fetchAll ? 1 : page;
  const effectivePageSize = fetchAll ? total : pageSize;

  return {
    filters: filtersDto,
    summary: { totalClientes: activos + inactivos, activos, inactivos },
    data: clientes.map(mapClienteToItem),
    pagination: {
      total,
      page: effectivePage,
      pageSize: effectivePageSize,
      totalPages: fetchAll ? 1 : Math.ceil(total / pageSize),
    },
  };
}
