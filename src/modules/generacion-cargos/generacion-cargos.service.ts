import {
  EstadoEjecucionGeneracion,
  OrigenEjecucion,
  Prisma,
  ResultadoGeneracion,
} from "@prisma/client";
import { ejecutarGeneracionCargos } from "./generacion-cargos.job";
import { procesarCuentaCandidata } from "./generacion-cargos.processor";
import { formatCargoGenerado, formatEjecucion } from "./generacion-cargos.mapper";
import {
  createEjecucion,
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

    const resultado = await procesarCuentaCandidata(
      cuenta,
      { empresaId, periodo },
      { dryRun: true }
    );

    if (resultado.resultado === "GENERADO") {
      elegibles += 1;
      montoEstimado = montoEstimado.add(resultado.monto);

      detalle.push({
        ...base,
        resultado: ResultadoGeneracion.GENERADO,
        mensaje: null,
      });
    } else if (resultado.resultado === "OMITIDO") {
      omitidas += 1;
      detalle.push({
        ...base,
        resultado: ResultadoGeneracion.OMITIDO,
        mensaje: resultado.mensaje,
      });
    } else {
      errores += 1;
      detalle.push({
        ...base,
        resultado: ResultadoGeneracion.ERROR,
        mensaje: resultado.mensaje,
      });
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

  const { cargos, total } = await findCargosPorIds(cargoIds, { page, limit });

  return {
    data: cargos.map(formatCargoGenerado),
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
}
