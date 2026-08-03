import { OrigenCargo, Prisma, TipoCargo } from "@prisma/client";
import { createCargoInternal } from "../cargos/cargos.service";
import { esErrorDuplicado } from "../cargos/cargos.errors";
import { formatDate } from "../../common/utils/datetime";

export type ResultadoProcesamiento =
  | { resultado: "GENERADO"; cargoId: string | null; monto: Prisma.Decimal }
  | { resultado: "OMITIDO"; mensaje: string }
  | { resultado: "ERROR"; mensaje: string };

export async function procesarCuentaCandidata(
  cuenta: { id: string; montoBase: Prisma.Decimal },
  input: { empresaId: string; periodo: string },
  options: { dryRun: boolean }
): Promise<ResultadoProcesamiento> {
  try {
    const cargoCreado = await createCargoInternal({
      empresaId: input.empresaId,
      cuentaServicioId: cuenta.id,
      tipoCargo: TipoCargo.SERVICIO,
      concepto: `Cargo de servicio ${input.periodo}`,
      periodoReferencia: input.periodo,
      monto: cuenta.montoBase.toNumber(),
      fechaEmision: formatDate(new Date()),
      dryRun: options.dryRun,
      origen: options.dryRun ? undefined : OrigenCargo.GENERACION_AUTOMATICA,
    });

    return {
      resultado: "GENERADO",
      cargoId: cargoCreado.id,
      monto: cuenta.montoBase,
    };
  } catch (error) {
    if (esErrorDuplicado(error)) {
      return {
        resultado: "OMITIDO",
        mensaje: "Ya existe un cargo SERVICIO para ese periodo",
      };
    }

    return {
      resultado: "ERROR",
      mensaje: error instanceof Error ? error.message : "Error desconocido",
    };
  }
}
