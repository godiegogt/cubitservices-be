import {
  EstadoCargo,
  EstadoCuentaServicio,
  OrigenCargo,
  TipoCargo,
  TipoMora,
  TipoVencimiento,
} from "@prisma/client";
import {
  CargoDetail,
  CargoListItem,
  createCargo,
  findCargoById,
  findCuentaServicioById,
  findCargosByEmpresa,
  findDuplicateServicioCargo,
  findOrdenServicioById,
  findPoliticaCobroById,
  updateCargoStatus,
} from "./cargos.repository";
import { CargoDuplicadoError } from "./cargos.errors";

function parseDateOnly(value: string) {
  return new Date(`${value}T00:00:00.000Z`);
}

function formatDateOnly(value?: Date | null) {
  if (!value) {
    return null;
  }

  return value.toISOString().slice(0, 10);
}

function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

function getLastDayOfMonth(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0));
}

function calculateFechaVencimiento(
  fechaEmision: Date,
  politica: {
    tipoVencimiento: TipoVencimiento;
    diaVencimiento: number | null;
    diasGracia: number;
  } | null
) {
  if (!politica) {
    return null;
  }

  if (politica.tipoVencimiento === TipoVencimiento.FIN_MES) {
    return getLastDayOfMonth(fechaEmision);
  }

  if (politica.tipoVencimiento === TipoVencimiento.FECHA_FIJA) {
    if (!politica.diaVencimiento) {
      throw new Error("diaVencimiento es obligatorio para FECHA_FIJA");
    }

    const lastDay = getLastDayOfMonth(fechaEmision).getUTCDate();
    const day = Math.min(politica.diaVencimiento, lastDay);

    return new Date(
      Date.UTC(fechaEmision.getUTCFullYear(), fechaEmision.getUTCMonth(), day)
    );
  }

  // MVP: el modelo no tiene un campo de dias despues, se usa diasGracia.
  return addDays(fechaEmision, politica.diasGracia);
}

function formatCargo(cargo: CargoListItem | CargoDetail) {
  return {
    ...cargo,
    monto: cargo.monto.toString(),
    saldo: cargo.saldo.toString(),
    fechaEmision: formatDateOnly(cargo.fechaEmision),
    fechaVencimiento: formatDateOnly(cargo.fechaVencimiento),
    fechaUltimaMoraCalculada: formatDateOnly(cargo.fechaUltimaMoraCalculada),
    valorMoraAplicado: cargo.valorMoraAplicado?.toString() ?? null,
    politicaCobro: cargo.politicaCobro
      ? {
          ...cargo.politicaCobro,
          ...("valorMora" in cargo.politicaCobro
            ? {
                valorMora: cargo.politicaCobro.valorMora?.toString() ?? null,
              }
            : {}),
        }
      : null,
  };
}

export async function createCargoInternal(input: {
  empresaId: string;
  cuentaServicioId: string;
  ordenServicioId?: string | null;
  tipoCargo: TipoCargo;
  concepto: string;
  periodoReferencia?: string;
  monto: number;
  fechaEmision: string;
  origen?: OrigenCargo;
  dryRun?: boolean;
}) {
  const cuentaServicio = await findCuentaServicioById(input.cuentaServicioId);

  if (!cuentaServicio || cuentaServicio.empresaId !== input.empresaId) {
    throw new Error("Cuenta de servicio no encontrada");
  }

  if (
    cuentaServicio.estado === EstadoCuentaServicio.CANCELADA ||
    cuentaServicio.estado === EstadoCuentaServicio.FINALIZADA
  ) {
    throw new Error(
      "No se pueden crear cargos para cuentas CANCELADA o FINALIZADA"
    );
  }

  if (
    cuentaServicio.estado === EstadoCuentaServicio.SUSPENDIDA &&
    input.tipoCargo !== TipoCargo.AJUSTE &&
    input.tipoCargo !== TipoCargo.EXTRAORDINARIO
  ) {
    throw new Error(
      "Solo se pueden crear cargos AJUSTE o EXTRAORDINARIO para cuentas SUSPENDIDA"
    );
  }

  const politica = cuentaServicio.politicaCobroId
    ? await findPoliticaCobroById(cuentaServicio.politicaCobroId)
    : null;

  if (cuentaServicio.politicaCobroId && !politica) {
    throw new Error("Politica de cobro no encontrada");
  }

  if (
    !politica &&
    (input.tipoCargo === TipoCargo.SERVICIO || input.tipoCargo === TipoCargo.MORA)
  ) {
    throw new Error(
      "La cuenta requiere politica de cobro para cargos SERVICIO o MORA"
    );
  }

  if (input.tipoCargo === TipoCargo.SERVICIO) {
    if (!input.periodoReferencia) {
      throw new Error("periodoReferencia es obligatorio para cargos SERVICIO");
    }

    const duplicate = await findDuplicateServicioCargo({
      empresaId: input.empresaId,
      cuentaServicioId: input.cuentaServicioId,
      periodoReferencia: input.periodoReferencia,
    });

    if (duplicate) {
      throw new CargoDuplicadoError();
    }
  }

  if (input.ordenServicioId) {
    const orden = await findOrdenServicioById(input.ordenServicioId);

    if (!orden || orden.empresaId !== input.empresaId) {
      throw new Error("Orden de servicio no encontrada");
    }

    if (orden.cuentaServicioId !== input.cuentaServicioId) {
      throw new Error("La orden de servicio no pertenece a la cuenta");
    }
  }

  const fechaEmision = parseDateOnly(input.fechaEmision);
  const fechaVencimiento = calculateFechaVencimiento(fechaEmision, politica);

  if (input.dryRun) {
    return {
      id: null,
      tipoCargo: input.tipoCargo,
      concepto: input.concepto,
      periodoReferencia: input.periodoReferencia ?? null,
      monto: input.monto.toString(),
      saldo: input.monto.toString(),
      fechaEmision: formatDateOnly(fechaEmision),
      fechaVencimiento: formatDateOnly(fechaVencimiento),
      estado: EstadoCargo.PENDIENTE,
    };
  }

  const cargo = await createCargo({
    empresaId: input.empresaId,
    clienteId: cuentaServicio.clienteId,
    cuentaServicioId: cuentaServicio.id,
    ordenServicioId: input.ordenServicioId,
    politicaCobroId: politica?.id ?? null,
    tipoCargo: input.tipoCargo,
    concepto: input.concepto,
    periodoReferencia: input.periodoReferencia,
    monto: input.monto,
    saldo: input.monto,
    fechaEmision,
    fechaVencimiento,
    diasGraciaAplicados: politica?.diasGracia ?? null,
    tipoMoraAplicada: politica?.tipoMora ?? null,
    valorMoraAplicado: politica?.valorMora ?? null,
    estado: EstadoCargo.PENDIENTE,
    origen: input.origen,
  });

  return {
    id: cargo.id,
    tipoCargo: cargo.tipoCargo,
    concepto: cargo.concepto,
    periodoReferencia: cargo.periodoReferencia,
    monto: cargo.monto.toString(),
    saldo: cargo.saldo.toString(),
    fechaEmision: formatDateOnly(cargo.fechaEmision),
    fechaVencimiento: formatDateOnly(cargo.fechaVencimiento),
    estado: cargo.estado,
  };
}

export async function getCargosService(
  empresaId: string,
  filters?: {
    clienteId?: string;
    cuentaServicioId?: string;
    estado?: EstadoCargo;
    tipoCargo?: TipoCargo;
    periodoReferencia?: string;
    search?: string;
    page?: number;
    limit?: number;
  }
) {
  const page  = Math.max(1, filters?.page  ?? 1);
  const limit = Math.min(100, Math.max(1, filters?.limit ?? 20));
  const { cargos, total } = await findCargosByEmpresa(
    empresaId,
    filters,
    { page, limit }
  );
  return {
    data: cargos.map(formatCargo),
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
}

export async function getCargoByIdService(id: string, empresaId: string) {
  const cargo = await findCargoById(id);

  if (!cargo || cargo.empresaId !== empresaId) {
    throw new Error("Cargo no encontrado");
  }

  return formatCargo(cargo);
}

export async function createCargoService(input: {
  empresaId: string;
  cuentaServicioId: string;
  ordenServicioId?: string | null;
  tipoCargo: TipoCargo;
  concepto: string;
  periodoReferencia?: string;
  monto: number;
  fechaEmision: string;
}) {
  return createCargoInternal(input);
}

export async function createCargoFromCuentaService(input: {
  empresaId: string;
  cuentaServicioId: string;
  ordenServicioId?: string | null;
  tipoCargo: TipoCargo;
  concepto: string;
  periodoReferencia?: string;
  monto: number;
  fechaEmision: string;
}) {
  return createCargoInternal(input);
}

const TRANSICIONES_VALIDAS: Record<EstadoCargo, EstadoCargo[]> = {
  [EstadoCargo.PENDIENTE]: [EstadoCargo.ANULADO, EstadoCargo.VENCIDO, EstadoCargo.PAGADO, EstadoCargo.PARCIAL],
  [EstadoCargo.PARCIAL]:   [EstadoCargo.ANULADO, EstadoCargo.VENCIDO, EstadoCargo.PAGADO, EstadoCargo.PENDIENTE],
  [EstadoCargo.PAGADO]:    [],
  [EstadoCargo.VENCIDO]:   [],
  [EstadoCargo.ANULADO]:   [],
};

export async function updateCargoStatusService(
  id: string,
  empresaId: string,
  input: {
    estado: EstadoCargo;
    motivo?: string;
  }
) {
  const cargo = await findCargoById(id);

  if (!cargo || cargo.empresaId !== empresaId) {
    throw new Error("Cargo no encontrado");
  }

  const transicionesPermitidas = TRANSICIONES_VALIDAS[cargo.estado] ?? [];

  if (!transicionesPermitidas.includes(input.estado)) {
    throw new Error(
      `No se puede cambiar el estado de ${cargo.estado} a ${input.estado}`
    );
  }

  if (input.estado === EstadoCargo.ANULADO && (!input.motivo || input.motivo.trim().length < 3)) {
    throw new Error("El motivo es obligatorio para anular un cargo (mínimo 3 caracteres)");
  }

  return updateCargoStatus(id, input.estado, input.motivo);
}