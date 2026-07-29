import {
  EstadoEjecucionGeneracion,
  OrigenCargo,
  OrigenEjecucion,
  Prisma,
  ResultadoGeneracion,
  TipoCargo,
} from "@prisma/client";
import { createCargoInternal } from "../cargos/cargos.service";
import {
  CargoGeneradoItem,
  createDetalle,
  createEjecucion,
  findCargosPorCuentas,
  findCuentasCandidatas,
  findCuentaServicioIdsGeneradas,
  findDetallesByEjecucion,
  findEjecucionById,
  findEjecucionesByEmpresa,
  updateEjecucion,
} from "./generacion-cargos.repository";

function formatEjecucion<T extends { montoGenerado: Prisma.Decimal }>(
  ejecucion: T
) {
  return {
    ...ejecucion,
    montoGenerado: ejecucion.montoGenerado.toString(),
  };
}

function esErrorDuplicado(error: unknown) {
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

function hoyComoFecha() {
  return new Date().toISOString().slice(0, 10);
}

function formatDateOnly(value: Date | null) {
  return value ? value.toISOString().slice(0, 10) : null;
}

function formatCargoGenerado(cargo: CargoGeneradoItem) {
  return {
    ...cargo,
    monto: cargo.monto.toString(),
    saldo: cargo.saldo.toString(),
    fechaEmision: formatDateOnly(cargo.fechaEmision),
    fechaVencimiento: formatDateOnly(cargo.fechaVencimiento),
    valorMoraAplicado: cargo.valorMoraAplicado?.toString() ?? null,
  };
}

export async function generarCargosService(input: {
  empresaId: string;
  usuarioId: string;
  periodo: string;
}) {
  const ejecucion = await createEjecucion({
    empresaId: input.empresaId,
    usuarioId: input.usuarioId,
    periodo: input.periodo,
    origen: OrigenEjecucion.MANUAL,
  });

  try {
    const cuentas = await findCuentasCandidatas(input.empresaId);

    let generadas = 0;
    let omitidas = 0;
    let errores = 0;
    let montoGenerado = new Prisma.Decimal(0);

    for (const cuenta of cuentas) {
      try {
        await createCargoInternal({
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
          ejecucionId: ejecucion.id,
          cuentaServicioId: cuenta.id,
          clienteId: cuenta.cliente.id,
          resultado: ResultadoGeneracion.GENERADO,
        });
      } catch (error) {
        if (esErrorDuplicado(error)) {
          omitidas += 1;
          await createDetalle({
            ejecucionId: ejecucion.id,
            cuentaServicioId: cuenta.id,
            clienteId: cuenta.cliente.id,
            resultado: ResultadoGeneracion.OMITIDO,
            mensaje: "Ya existe un cargo SERVICIO para ese periodo",
          });
        } else {
          errores += 1;
          await createDetalle({
            ejecucionId: ejecucion.id,
            cuentaServicioId: cuenta.id,
            clienteId: cuenta.cliente.id,
            resultado: ResultadoGeneracion.ERROR,
            mensaje: error instanceof Error ? error.message : "Error desconocido",
          });
        }
      }
    }

    const estado =
      errores > 0
        ? EstadoEjecucionGeneracion.COMPLETADA_CON_ERRORES
        : EstadoEjecucionGeneracion.COMPLETADA;

    const actualizada = await updateEjecucion(ejecucion.id, {
      estado,
      fechaFin: new Date(),
      cantidadProcesadas: cuentas.length,
      cantidadGeneradas: generadas,
      cantidadOmitidas: omitidas,
      cantidadErrores: errores,
      montoGenerado,
    });

    return formatEjecucion(actualizada);
  } catch (error) {
    const actualizada = await updateEjecucion(ejecucion.id, {
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

    return formatEjecucion(actualizada);
  }
}

export async function getEjecucionesService(
  empresaId: string,
  filters?: {
    estado?: EstadoEjecucionGeneracion;
    periodo?: string;
    page?: number;
    limit?: number;
  }
) {
  const page = Math.max(1, filters?.page ?? 1);
  const limit = Math.min(100, Math.max(1, filters?.limit ?? 20));

  const { ejecuciones, total } = await findEjecucionesByEmpresa(
    empresaId,
    filters,
    { page, limit }
  );

  return {
    data: ejecuciones.map(formatEjecucion),
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
}

export async function getEjecucionByIdService(id: string, empresaId: string) {
  const ejecucion = await findEjecucionById(id);

  if (!ejecucion || ejecucion.empresaId !== empresaId) {
    throw new Error("Ejecución no encontrada");
  }

  return formatEjecucion(ejecucion);
}

export async function getDetallesService(
  id: string,
  empresaId: string,
  filters?: {
    resultado?: ResultadoGeneracion;
    page?: number;
    limit?: number;
  }
) {
  const ejecucion = await findEjecucionById(id);

  if (!ejecucion || ejecucion.empresaId !== empresaId) {
    throw new Error("Ejecución no encontrada");
  }

  const page = Math.max(1, filters?.page ?? 1);
  const limit = Math.min(100, Math.max(1, filters?.limit ?? 20));

  const { detalles, total } = await findDetallesByEjecucion(id, filters, {
    page,
    limit,
  });

  return {
    data: detalles,
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
}

export async function getPreviewService(empresaId: string, periodo: string) {
  const cuentas = await findCuentasCandidatas(empresaId);

  let elegibles = 0;
  let omitidas = 0;
  let errores = 0;
  let montoEstimado = new Prisma.Decimal(0);

  const detalle = [];

  for (const cuenta of cuentas) {
    const base = {
      cuentaServicioId: cuenta.id,
      codigo: cuenta.codigo,
      nombre: cuenta.nombre,
      montoBase: cuenta.montoBase.toString(),
      cliente: cuenta.cliente,
    };

    try {
      await createCargoInternal({
        empresaId,
        cuentaServicioId: cuenta.id,
        tipoCargo: TipoCargo.SERVICIO,
        concepto: `Cargo de servicio ${periodo}`,
        periodoReferencia: periodo,
        monto: cuenta.montoBase.toNumber(),
        fechaEmision: hoyComoFecha(),
        dryRun: true,
      });

      elegibles += 1;
      montoEstimado = montoEstimado.add(cuenta.montoBase);

      detalle.push({
        ...base,
        resultado: ResultadoGeneracion.GENERADO,
        mensaje: null,
      });
    } catch (error) {
      if (esErrorDuplicado(error)) {
        omitidas += 1;
        detalle.push({
          ...base,
          resultado: ResultadoGeneracion.OMITIDO,
          mensaje: "Ya existe un cargo SERVICIO para ese periodo",
        });
      } else {
        errores += 1;
        detalle.push({
          ...base,
          resultado: ResultadoGeneracion.ERROR,
          mensaje: error instanceof Error ? error.message : "Error desconocido",
        });
      }
    }
  }

  return {
    periodo,
    cantidadEvaluadas: cuentas.length,
    cantidadElegibles: elegibles,
    cantidadOmitidas: omitidas,
    cantidadErrores: errores,
    montoEstimado: montoEstimado.toString(),
    cuentas: detalle,
  };
}

export async function getCargosGeneradosService(
  id: string,
  empresaId: string,
  filters?: { page?: number; limit?: number }
) {
  const ejecucion = await findEjecucionById(id);

  if (!ejecucion || ejecucion.empresaId !== empresaId) {
    throw new Error("Ejecución no encontrada");
  }

  const page = Math.max(1, filters?.page ?? 1);
  const limit = Math.min(100, Math.max(1, filters?.limit ?? 20));

  const cuentaServicioIds = await findCuentaServicioIdsGeneradas(id);

  if (cuentaServicioIds.length === 0) {
    return {
      data: [],
      meta: { total: 0, page, limit, totalPages: 0 },
    };
  }

  const { cargos, total } = await findCargosPorCuentas(
    empresaId,
    ejecucion.periodo,
    cuentaServicioIds,
    { page, limit }
  );

  return {
    data: cargos.map(formatCargoGenerado),
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
}
