import { EstadoEjecucionGeneracion, Prisma, ResultadoGeneracion } from "@prisma/client";
import {
  createDetalle,
  findCuentasCandidatas,
  updateEjecucion,
  updateEjecucionProgreso,
} from "./generacion-cargos.repository";
import { procesarCuentaCandidata } from "./generacion-cargos.processor";

export async function ejecutarGeneracionCargos(
  ejecucionId: string,
  input: { empresaId: string; periodo: string }
) {
  let generadas = 0;
  let omitidas = 0;
  let errores = 0;
  let procesadas = 0;
  let montoGenerado = new Prisma.Decimal(0);
  try {
    const cuentas = await findCuentasCandidatas(input.empresaId);
    const pasoProgreso = Math.max(1, Math.ceil(cuentas.length / 20));

    for (let i = 0; i < cuentas.length; i += 1) {
      const cuenta = cuentas[i];

      const resultado = await procesarCuentaCandidata(cuenta, input, {
        dryRun: false,
      });

      if (resultado.resultado === "GENERADO") {
        generadas += 1;
        montoGenerado = montoGenerado.add(resultado.monto);

        await createDetalle({
          ejecucionId,
          cuentaServicioId: cuenta.id,
          clienteId: cuenta.cliente.id,
          cargoId: resultado.cargoId,
          resultado: ResultadoGeneracion.GENERADO,
        });
      } else if (resultado.resultado === "OMITIDO") {
        omitidas += 1;
        await createDetalle({
          ejecucionId,
          cuentaServicioId: cuenta.id,
          clienteId: cuenta.cliente.id,
          resultado: ResultadoGeneracion.OMITIDO,
          mensaje: resultado.mensaje,
        });
      } else {
        errores += 1;
        await createDetalle({
          ejecucionId,
          cuentaServicioId: cuenta.id,
          clienteId: cuenta.cliente.id,
          resultado: ResultadoGeneracion.ERROR,
          mensaje: resultado.mensaje,
        });
      }

      procesadas = i + 1;
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
      cantidadProcesadas: procesadas,
      cantidadGeneradas: generadas,
      cantidadOmitidas: omitidas,
      cantidadErrores: errores,
      montoGenerado,
      mensajeError:
        error instanceof Error ? error.message : "Error crítico desconocido",
    });
  }
}
