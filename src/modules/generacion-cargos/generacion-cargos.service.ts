import {
  EstadoEjecucionGeneracion,
  OrigenEjecucion,
  Prisma,
  ResultadoGeneracion,
  TipoCargo,
} from "@prisma/client";
import { createCargoInternal } from "../cargos/cargos.service";
import { esErrorDuplicado, ejecutarGeneracionCargos, hoyComoFecha } from "./generacion-cargos.job";
import { formatCargoGenerado, formatEjecucion } from "./generacion-cargos.mapper";
import {
  createEjecucion,
  findCargosPorCuentas,
  findCargosPorIds,
  findCuentasCandidatas,
  findDetallesByEjecucion,
  findDetallesGeneradosConCargoId,
  findEjecucionById,
  findEjecucionesByEmpresa,
} from "./generacion-cargos.repository";

export async function iniciarGeneracionCargosService(input: {
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

  ejecutarGeneracionCargos(ejecucion.id, {
    empresaId: input.empresaId,
    periodo: input.periodo,
  }).catch((error) => {
    console.error("Error inesperado generando cargos", error);
  });

  return formatEjecucion(ejecucion);
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
    data: await Promise.all(ejecuciones.map(formatEjecucion)),
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

  const detalles = await findDetallesGeneradosConCargoId(id);

  if (detalles.length === 0) {
    return {
      data: [],
      meta: { total: 0, page, limit, totalPages: 0 },
    };
  }

  const cargoIds = detalles
    .map((detalle) => detalle.cargoId)
    .filter((cargoId): cargoId is string => cargoId !== null);

  const { cargos, total } =
    cargoIds.length > 0
      ? await findCargosPorIds(cargoIds, { page, limit })
      : await findCargosPorCuentas(
          empresaId,
          ejecucion.periodo,
          detalles.map((detalle) => detalle.cuentaServicioId),
          { page, limit }
        );

  return {
    data: cargos.map(formatCargoGenerado),
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
}
