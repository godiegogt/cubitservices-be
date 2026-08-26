import {
  EstadoCargo,
  EstadoPago,
  EstadoRegistroBasico,
  Prisma,
} from "@prisma/client";
import prisma from "../../config/prisma";
import {
  PagoDetail,
  PagoListItem,
  createAplicacionesPago,
  createPago,
  findAplicacionesByPagoId,
  findCargosByIds,
  findClienteById,
  findMetodoPagoById,
  findPagoById,
  findPagosByEmpresa,
  getPagoWithDetail,
  incrementAplicacionPagoMonto,
  resetAplicacionesMontoByPagoId,
  updateCargoSaldoEstado,
  updatePagoStatus,
} from "./pagos.repository";
import { formatDate, startOfDay } from "../../common/utils/datetime";

function parseDateOnly(value: string) {
  return new Date(`${value}T00:00:00.000Z`);
}

function formatDateOnly(value: Date) {
  return value.toISOString().slice(0, 10);
}

function calculateMontoAplicado(
  aplicaciones: { montoAplicado: Prisma.Decimal }[]
) {
  return aplicaciones.reduce(
    (total, aplicacion) => total.plus(aplicacion.montoAplicado),
    new Prisma.Decimal(0)
  );
}

function calculateMontoDisponible(
  montoTotal: Prisma.Decimal,
  montoAplicado: Prisma.Decimal
) {
  return montoTotal.minus(montoAplicado);
}

function calculateCargoNewState(
  monto: Prisma.Decimal,
  saldo: Prisma.Decimal
) {
  if (saldo.equals(0)) {
    return EstadoCargo.PAGADO;
  }

  if (saldo.lessThan(monto)) {
    return EstadoCargo.PARCIAL;
  }

  return EstadoCargo.PENDIENTE;
}

function ensureUniqueCargoIds(aplicaciones: { cargoId: string }[]) {
  const cargoIds = aplicaciones.map((aplicacion) => aplicacion.cargoId);

  if (new Set(cargoIds).size !== cargoIds.length) {
    throw new Error("No se permiten cargos duplicados en la misma aplicacion");
  }
}

function ensureCanApplyPayment(estado: EstadoPago) {
  if (estado === EstadoPago.ANULADO) {
    throw new Error("No se pueden aplicar pagos ANULADOS");
  }
}

function ensureCanUpdatePaymentStatus(
  pago: PagoDetail,
  nuevoEstado: EstadoPago,
  motivo?: string
) {
  if (pago.estado === EstadoPago.ANULADO) {
    throw new Error("No se puede cambiar el estado de un pago ANULADO");
  }

  if (nuevoEstado === EstadoPago.ANULADO && (!motivo || motivo.trim().length < 3)) {
    throw new Error("El motivo es obligatorio para anular un pago");
  }

  if (pago.estado === EstadoPago.REGISTRADO) {
    return;
  }

  if (
    pago.estado === EstadoPago.CONFIRMADO &&
    nuevoEstado === EstadoPago.ANULADO
  ) {
    return;
  }

  throw new Error(`No se puede cambiar el estado de ${pago.estado} a ${nuevoEstado}`);
}

function formatPagoListItem(pago: PagoListItem) {
  const montoAplicado = calculateMontoAplicado(pago.aplicaciones);
  const montoDisponible = calculateMontoDisponible(pago.montoTotal, montoAplicado);

  return {
    ...pago,
    montoTotal: pago.montoTotal.toString(),
    fechaPago: formatDateOnly(pago.fechaPago),
    montoAplicado: montoAplicado.toString(),
    montoDisponible: montoDisponible.toString(),
  };
}

function formatPagoDetail(pago: PagoDetail) {
  const montoAplicado = calculateMontoAplicado(pago.aplicaciones);
  const montoDisponible = calculateMontoDisponible(pago.montoTotal, montoAplicado);

  return {
    ...pago,
    montoTotal: pago.montoTotal.toString(),
    fechaPago: formatDateOnly(pago.fechaPago),
    montoAplicado: montoAplicado.toString(),
    montoDisponible: montoDisponible.toString(),
    aplicaciones: pago.aplicaciones.map((aplicacion) => ({
      ...aplicacion,
      montoAplicado: aplicacion.montoAplicado.toString(),
      cargo: {
        ...aplicacion.cargo,
        monto: aplicacion.cargo.monto.toString(),
        saldo: aplicacion.cargo.saldo.toString(),
      },
    })),
  };
}

export async function getPagosService(
  empresaId: string,
  filters?: {
    clienteId?: string;
    metodoPagoId?: string;
    estado?: EstadoPago;
    search?: string;
    page?: number;
    limit?: number;
  }
) {
  const page = Math.max(1, filters?.page ?? 1);
  const limit = Math.min(100, Math.max(1, filters?.limit ?? 20));

  const hoy = formatDate(new Date());
  const desde = startOfDay(hoy);
  const hasta = startOfDay(hoy);
  hasta.setUTCDate(hasta.getUTCDate() + 1);

  const { pagos, total } = await findPagosByEmpresa(
    empresaId,
    {
      clienteId: filters?.clienteId,
      metodoPagoId: filters?.metodoPagoId,
      estado: filters?.estado,
      desde,
      hasta,
      search: filters?.search,
    },
    { page, limit }
  );

  return {
    data: pagos.map(formatPagoListItem),
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
}

export async function getPagoByIdService(id: string, empresaId: string) {
  const pago = await findPagoById(id);

  if (!pago || pago.empresaId !== empresaId) {
    throw new Error("Pago no encontrado");
  }

  return formatPagoDetail(pago);
}

export async function createPagoService(input: {
  empresaId: string;
  userId: string;
  clienteId: string;
  metodoPagoId: string;
  montoTotal: number;
  referencia?: string;
  fechaPago: string;
  observaciones?: string;
  confirmar?: boolean;
}) {
  const [cliente, metodoPago] = await Promise.all([
    findClienteById(input.clienteId),
    findMetodoPagoById(input.metodoPagoId),
  ]);

  if (!cliente || cliente.empresaId !== input.empresaId) {
    throw new Error("Cliente no encontrado");
  }

  if (!metodoPago || metodoPago.empresaId !== input.empresaId) {
    throw new Error("Metodo de pago no encontrado");
  }

  if (metodoPago.estado !== EstadoRegistroBasico.ACTIVO) {
    throw new Error("El metodo de pago debe estar ACTIVO");
  }

  const pago = await createPago({
    empresaId: input.empresaId,
    clienteId: input.clienteId,
    metodoPagoId: input.metodoPagoId,
    registradoPor: input.userId,
    montoTotal: input.montoTotal,
    referencia: input.referencia,
    fechaPago: parseDateOnly(input.fechaPago),
    fechaRegistro: new Date(),
    estado: input.confirmar ? EstadoPago.CONFIRMADO : EstadoPago.REGISTRADO,
    observaciones: input.observaciones,
  });

  return {
    id: pago.id,
    clienteId: pago.clienteId,
    metodoPagoId: pago.metodoPagoId,
    montoTotal: pago.montoTotal.toString(),
    referencia: pago.referencia,
    fechaPago: formatDateOnly(pago.fechaPago),
    fechaRegistro: pago.fechaRegistro,
    estado: pago.estado,
  };
}

export async function updatePagoStatusService(
  id: string,
  empresaId: string,
  input: {
    estado: EstadoPago;
    motivo?: string;
  }
) {
  return prisma.$transaction(async (tx) => {
    const pago = await findPagoById(id, tx);

    if (!pago || pago.empresaId !== empresaId) {
      throw new Error("Pago no encontrado");
    }

    ensureCanUpdatePaymentStatus(pago, input.estado, input.motivo);

    const pagoActualizado = await updatePagoStatus(id, input.estado, tx);

    if (input.estado === EstadoPago.ANULADO) {
      for (const aplicacion of pago.aplicaciones) {
        if (aplicacion.cargo.estado === EstadoCargo.ANULADO) {
          continue;
        }

        const nuevoSaldo = aplicacion.cargo.saldo.plus(aplicacion.montoAplicado);
        const nuevoEstado = calculateCargoNewState(aplicacion.cargo.monto, nuevoSaldo);

        await updateCargoSaldoEstado(aplicacion.cargo.id, nuevoSaldo, nuevoEstado, tx);
      }

      if (pago.aplicaciones.length > 0) {
        await resetAplicacionesMontoByPagoId(id, tx);
      }
    }

    return pagoActualizado;
  });
}

export async function applyPagoService(
  id: string,
  empresaId: string,
  input: {
    aplicaciones: {
      cargoId: string;
      montoAplicado: number;
    }[];
  }
) {
  ensureUniqueCargoIds(input.aplicaciones);

  const pagoActualizado = await prisma.$transaction(async (tx) => {
    const pago = await getPagoWithDetail(id, tx);

    if (!pago || pago.empresaId !== empresaId) {
      throw new Error("Pago no encontrado");
    }

    ensureCanApplyPayment(pago.estado);

    const aplicacionesExistentes = await findAplicacionesByPagoId(id, tx);
    const montoAplicadoExistente = calculateMontoAplicado(aplicacionesExistentes);
    const montoAplicadoNuevo = input.aplicaciones.reduce(
      (total, aplicacion) => total.plus(aplicacion.montoAplicado),
      new Prisma.Decimal(0)
    );

    if (montoAplicadoExistente.plus(montoAplicadoNuevo).greaterThan(pago.montoTotal)) {
      throw new Error("La suma de aplicaciones excede el monto total del pago");
    }

    const cargoIds = input.aplicaciones.map((aplicacion) => aplicacion.cargoId);
    const cargos = await findCargosByIds(cargoIds, tx);

    if (cargos.length !== cargoIds.length) {
      throw new Error("Uno o mas cargos no fueron encontrados");
    }

    const cargosById = new Map(cargos.map((cargo) => [cargo.id, cargo]));
    const cargoIdsAplicados = new Set(
      aplicacionesExistentes.map((aplicacion) => aplicacion.cargoId)
    );

    const aplicacionesNuevas: typeof input.aplicaciones = [];
    const aplicacionesAIncrementar: typeof input.aplicaciones = [];

    for (const aplicacion of input.aplicaciones) {
      const cargo = cargosById.get(aplicacion.cargoId);

      if (!cargo || cargo.empresaId !== empresaId) {
        throw new Error("Cargo no encontrado");
      }

      if (cargo.clienteId !== pago.clienteId) {
        throw new Error("Todos los cargos deben pertenecer al cliente del pago");
      }

      if (cargo.estado === EstadoCargo.ANULADO) {
        throw new Error("No se pueden aplicar pagos a cargos ANULADOS");
      }

      if (cargo.estado === EstadoCargo.PAGADO) {
        throw new Error("No se pueden aplicar pagos a cargos PAGADOS");
      }

      const montoAplicado = new Prisma.Decimal(aplicacion.montoAplicado);

      if (montoAplicado.greaterThan(cargo.saldo)) {
        throw new Error("El monto aplicado no puede exceder el saldo del cargo");
      }

      if (cargoIdsAplicados.has(aplicacion.cargoId)) {
        aplicacionesAIncrementar.push(aplicacion);
      } else {
        aplicacionesNuevas.push(aplicacion);
      }
    }

    if (aplicacionesNuevas.length > 0) {
      await createAplicacionesPago(
        aplicacionesNuevas.map((aplicacion) => ({
          pagoId: id,
          cargoId: aplicacion.cargoId,
          montoAplicado: new Prisma.Decimal(aplicacion.montoAplicado),
        })),
        tx
      );
    }

    for (const aplicacion of aplicacionesAIncrementar) {
      await incrementAplicacionPagoMonto(
        id,
        aplicacion.cargoId,
        new Prisma.Decimal(aplicacion.montoAplicado),
        tx
      );
    }

    for (const aplicacion of input.aplicaciones) {
      const cargo = cargosById.get(aplicacion.cargoId)!;
      const nuevoSaldo = cargo.saldo.minus(aplicacion.montoAplicado);
      const nuevoEstado = calculateCargoNewState(cargo.monto, nuevoSaldo);

      await updateCargoSaldoEstado(cargo.id, nuevoSaldo, nuevoEstado, tx);
    }

    if (pago.estado === EstadoPago.REGISTRADO) {
      await updatePagoStatus(id, EstadoPago.CONFIRMADO, tx);
    }

    return getPagoWithDetail(id, tx);
  });

  if (!pagoActualizado) {
    throw new Error("Pago no encontrado");
  }

  const formattedPago = formatPagoDetail(pagoActualizado);

  return {
    id: formattedPago.id,
    estado: formattedPago.estado,
    montoTotal: formattedPago.montoTotal,
    montoAplicado: formattedPago.montoAplicado,
    montoDisponible: formattedPago.montoDisponible,
    aplicaciones: formattedPago.aplicaciones.map((aplicacion) => ({
      id: aplicacion.id,
      cargoId: aplicacion.cargoId,
      montoAplicado: aplicacion.montoAplicado,
    })),
  };
}
