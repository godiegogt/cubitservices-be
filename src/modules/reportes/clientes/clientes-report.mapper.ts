import { Prisma } from "@prisma/client";
import { formatDate } from "../../../common/utils/datetime";
import { ClienteReportItemDto } from "./clientes-report.dto";

const clienteInclude = Prisma.validator<Prisma.ClienteDefaultArgs>()({
  include: {
    _count: { select: { cuentasServicio: true } },
  },
});

export type ClienteReportRow = Prisma.ClienteGetPayload<typeof clienteInclude>;

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
    estado: cliente.estado,
    totalCuentas: cliente._count.cuentasServicio,
    fechaRegistro: formatDate(cliente.createdAt),
  };
}
