import { Prisma } from "@prisma/client";
import { formatDate, formatDateOnly } from "../../../common/utils/datetime";
import { ClienteReportItemDto, ZonaServiciosDto } from "./clientes-report.dto";

const clienteInclude = Prisma.validator<Prisma.ClienteDefaultArgs>()({
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
});

export type ClienteReportRow = Prisma.ClienteGetPayload<typeof clienteInclude>;

function resolveZonasServicios(
  ubicaciones: ClienteReportRow["ubicaciones"],
  cuentasServicio: ClienteReportRow["cuentasServicio"],
): ZonaServiciosDto[] {
  const serviciosPorZona = new Map<number | null, Set<string>>();

  for (const ubicacion of ubicaciones) {
    if (!serviciosPorZona.has(ubicacion.zona)) {
      serviciosPorZona.set(ubicacion.zona, new Set());
    }
  }

  for (const cuenta of cuentasServicio) {
    const zona = cuenta.ubicacion?.zona ?? null;
    if (!serviciosPorZona.has(zona)) {
      serviciosPorZona.set(zona, new Set());
    }
    serviciosPorZona.get(zona)!.add(cuenta.tipoServicio.nombre);
  }

  return Array.from(serviciosPorZona.entries())
    .map(([zona, servicios]) => ({ zona, servicios: Array.from(servicios) }))
    .sort((a, b) => {
      if (a.zona === null) return 1;
      if (b.zona === null) return -1;
      return a.zona - b.zona;
    });
}

function resolveCuentas(
  cuentasServicio: ClienteReportRow["cuentasServicio"],
): string[] {
  return cuentasServicio.map((c) => c.nombre);
}

export function formatZonasServicios(zonas: ZonaServiciosDto[]): string {
  if (!zonas.length) return "";
  return zonas
    .map(
      (z) =>
        `${z.zona !== null ? `Zona ${z.zona}` : "Sin zona"}: ${
          z.servicios.join(", ") || "Sin servicio"
        }`,
    )
    .join(" | ");
}

export function mapClienteToItem(
  cliente: ClienteReportRow,
): ClienteReportItemDto {
  return {
    id: cliente.id,
    codigo: cliente.codigo,
    nombre: cliente.nombreRazonSocial,
    tipoCliente: cliente.tipoCliente,
    identificacion: cliente.identificacion ?? null,
    telefono: cliente.telefono ?? null,
    email: cliente.email ?? null,
    zonas: resolveZonasServicios(cliente.ubicaciones, cliente.cuentasServicio),
    cuentas: resolveCuentas(cliente.cuentasServicio),
    estado: cliente.estado,
    totalCuentas: cliente._count.cuentasServicio,
    fechaRegistro: formatDateOnly(cliente.createdAt),
  };
}
