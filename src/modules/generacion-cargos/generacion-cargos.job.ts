import {
  EstadoEjecucionGeneracion,
  OrigenCargo,
  Prisma,
  ResultadoGeneracion,
  TipoCargo,
} from "@prisma/client";
import { createCargoInternal } from "../cargos/cargos.service";
import { formatDate } from "../../common/utils/datetime";
import {
  createDetalle,
  findCuentasCandidatas,
  updateEjecucion,
  updateEjecucionProgreso,
} from "./generacion-cargos.repository";

export function esErrorDuplicado(error: unknown) {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  ) {
    return true;
  }

  return (
    error instanceof Error &&
    error.message === "Ya existe un cargo SERVICIO para ese periodo"
  );
}

export function hoyComoFecha() {
  return formatDate(new Date());
}

export async function ejecutarGeneracionCargos(
  ejecucionId: string,
  input: { empresaId: string; periodo: string }
) {
  let generadas = 0;
  let omitidas = 0;
  let errores = 0;
  let montoGenerado = new Prisma.Decimal(0);
  try {
    const cuentas = await findCuentasCandidatas(input.empresaId);
    const pasoProgreso = Math.max(1, Math.ceil(cuentas.length / 20));

    

    for (let i = 0; i < cuentas.length; i += 1) {
      const cuenta = cuentas[i];

      try {
        const cargoCreado = await createCargoInternal({
          empresaId: input.empresaId,
          cuentaServicioId: cuenta.id,
          tipoCargo: TipoCargo.SERVICIO,
          concepto: `Cargo de servicio ${input.periodo}`,
          periodoReferencia: input.periodo,
          monto: cuenta.montoBase.toNumber(),
          fechaEmision: hoyComoFecha(),
          origen: OrigenCargo.GENERACION_AUTOMATICA,
        });

        generadas += 1;
        montoGenerado = montoGenerado.add(cuenta.montoBase);

        await createDetalle({
          ejecucionId,
          cuentaServicioId: cuenta.id,
          clienteId: cuenta.cliente.id,
          cargoId: cargoCreado.id,
          resultado: ResultadoGeneracion.GENERADO,
        });
      } catch (error) {
        if (esErrorDuplicado(error)) {
          omitidas += 1;
          await createDetalle({
            ejecucionId,
            cuentaServicioId: cuenta.id,
            clienteId: cuenta.cliente.id,
            resultado: ResultadoGeneracion.OMITIDO,
            mensaje: "Ya existe un cargo SERVICIO para ese periodo",
          });
        } else {
          errores += 1;
          await createDetalle({
            ejecucionId,
            cuentaServicioId: cuenta.id,
            clienteId: cuenta.cliente.id,
            resultado: ResultadoGeneracion.ERROR,
            mensaje: error instanceof Error ? error.message : "Error desconocido",
          });
        }
      }

      const procesadas = i + 1;
      if (procesadas % pasoProgreso === 0 || procesadas === cuentas.length) {
        await updateEjecucionProgreso(ejecucionId, {
          cantidadProcesadas: procesadas,
          cantidadGeneradas: generadas,
          cantidadOmitidas: omitidas,
          cantidadErrores: errores,
          montoGenerado,
        });
      }
    }

    const estado =
      errores > 0
        ? EstadoEjecucionGeneracion.COMPLETADA_CON_ERRORES
        : EstadoEjecucionGeneracion.COMPLETADA;

    await updateEjecucion(ejecucionId, {
      estado,
      fechaFin: new Date(),
      cantidadProcesadas: cuentas.length,
      cantidadGeneradas: generadas,
      cantidadOmitidas: omitidas,
      cantidadErrores: errores,
      montoGenerado,
    });
  } catch (error) {
    await updateEjecucion(ejecucionId, {
      estado: EstadoEjecucionGeneracion.FALLIDA,
      fechaFin: new Date(),
      cantidadProcesadas: 0,
      cantidadGeneradas: 0,
      cantidadOmitidas: 0,
      cantidadErrores: 0,
      montoGenerado: 0,
      mensajeError:
        error instanceof Error ? error.message : "Error crítico desconocido",
    });
  }
}
