import { EstadoEjecucionGeneracion, Prisma } from "@prisma/client";
import { formatDateOnly as formatDateOnlyUtil } from "../../common/utils/datetime";
import { CargoGeneradoItem, countCuentasCandidatas } from "./generacion-cargos.repository";

export async function formatEjecucion<
  T extends {
    empresaId: string;
    estado: EstadoEjecucionGeneracion;
    cantidadProcesadas: number;
    montoGenerado: Prisma.Decimal;
  }
>(ejecucion: T) {
  const enProceso = ejecucion.estado === EstadoEjecucionGeneracion.PROCESANDO;
  const cantidadTotal = enProceso
    ? await countCuentasCandidatas(ejecucion.empresaId)
    : ejecucion.cantidadProcesadas;
  const porcentaje = enProceso
    ? cantidadTotal > 0
      ? Math.min(
          100,
          Math.round((ejecucion.cantidadProcesadas / cantidadTotal) * 100)
        )
      : 0
    : 100;

  return {
    ...ejecucion,
    montoGenerado: ejecucion.montoGenerado.toString(),
    cantidadTotal,
    porcentaje,
  };
}

function formatDateOnly(value: Date | null) {
  return value ? formatDateOnlyUtil(value) : null;
}

export function formatCargoGenerado(cargo: CargoGeneradoItem) {
  return {
    ...cargo,
    monto: cargo.monto.toString(),
    saldo: cargo.saldo.toString(),
    fechaEmision: formatDateOnly(cargo.fechaEmision),
    fechaVencimiento: formatDateOnly(cargo.fechaVencimiento),
    valorMoraAplicado: cargo.valorMoraAplicado?.toString() ?? null,
  };
}
