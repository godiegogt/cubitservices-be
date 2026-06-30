import { EstadoCargo, TipoCargo } from '@prisma/client';
import type {
    EstadoCuentaHeaderDto,
    EstadoCuentaMovimientoDto,
    EstadoCuentaResumenDto,
} from './estado-cuenta.dto';
import type { TipoMovimientoEstadoCuenta } from './estado-cuenta.types';
import { TIPO_MOVIMIENTO_PRIORIDAD } from './estado-cuenta.types';

type CuentaConRelaciones = {
    id: string;
    codigo: string;
    nombre: string;
    estado: string;
    fechaInicio: Date | null;
    montoBase: { toNumber(): number } | number;
    empresaId: string;
    cliente: {
    id: string;
    codigo: string;
    nombreRazonSocial: string;
    telefono: string | null;
    email: string | null;
    estado: string;
    };
    tipoServicio: { id: string; nombre: string };
    ubicacion: { id: string; nombre: string; direccion: string; referencia: string | null } | null;
    politicaCobro: { id: string; nombre: string } | null;
};

type CargoRaw = {
    id: string;
    tipoCargo: TipoCargo;
    concepto: string;
    periodoReferencia: string | null;
    monto: { toNumber(): number } | number;
    saldo: { toNumber(): number } | number;
    fechaEmision: Date;
    estado: EstadoCargo;
    createdAt: Date;
};

type AplicacionPagoRaw = {
    id: string;
    pagoId: string;
    cargoId: string;
    montoAplicado: { toNumber(): number } | number;
    createdAt: Date;
    pago: {
    id: string;
    fechaPago: Date;
    referencia: string | null;
    estado: string;
    metodoPago: { nombre: string };
    };
};

function toNum(val: { toNumber(): number } | number): number {
    return typeof val === 'number' ? val : val.toNumber();
}

function formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
}

export function mapHeader(cuenta: CuentaConRelaciones): EstadoCuentaHeaderDto {
    return {
    cliente: {
        id: cuenta.cliente.id,
        codigo: cuenta.cliente.codigo,
        nombre: cuenta.cliente.nombreRazonSocial,
        telefono: cuenta.cliente.telefono,
        email: cuenta.cliente.email,
        estado: cuenta.cliente.estado,
    },
    cuentaServicio: {
        id: cuenta.id,
        codigo: cuenta.codigo,
        nombre: cuenta.nombre,
        estado: cuenta.estado,
        fechaInicio: cuenta.fechaInicio ? formatDate(cuenta.fechaInicio) : null,
        montoBase: toNum(cuenta.montoBase),
    },
    servicio: {
        id: cuenta.tipoServicio.id,
        nombre: cuenta.tipoServicio.nombre,
    },
    ubicacion: cuenta.ubicacion
        ? {
            id: cuenta.ubicacion.id,
            nombre: cuenta.ubicacion.nombre,
            direccion: cuenta.ubicacion.direccion,
            referencia: cuenta.ubicacion.referencia,
        }
        : null,
    politicaCobro: cuenta.politicaCobro
        ? {
            id: cuenta.politicaCobro.id,
            nombre: cuenta.politicaCobro.nombre,
        }
        : null,
    };
}

export function mapResumen(
    cargos: CargoRaw[],
    aplicaciones: AplicacionPagoRaw[],
    saldoDisponibleCliente: number,
): EstadoCuentaResumenDto {
    let saldoPendiente = 0;
    let totalCargos = 0;

    for (const cargo of cargos) {
    if (cargo.estado === EstadoCargo.ANULADO) continue;
    totalCargos += toNum(cargo.monto);

    if (
        cargo.estado === EstadoCargo.PENDIENTE ||
        cargo.estado === EstadoCargo.PARCIAL ||
        cargo.estado === EstadoCargo.VENCIDO
    ) {
        saldoPendiente += toNum(cargo.saldo);
    }
    }

    let totalAplicado = 0;
    for (const ap of aplicaciones) {
    totalAplicado += toNum(ap.montoAplicado);
    }

    return {
    saldoPendiente: round2(saldoPendiente),
    totalCargos: round2(totalCargos),
    totalAplicado: round2(totalAplicado),
    saldoDisponibleCliente: round2(saldoDisponibleCliente),
    };
}

function tipoMovimientoDeCargo(cargo: CargoRaw): TipoMovimientoEstadoCuenta {
    if (cargo.estado === EstadoCargo.ANULADO) return 'ANULACION';
    if (cargo.tipoCargo === TipoCargo.MORA) return 'MORA';
    if (cargo.tipoCargo === TipoCargo.AJUSTE) return 'AJUSTE';
    return 'CARGO';
}

function descripcionCargo(cargo: CargoRaw): string {
    if (cargo.periodoReferencia) {
    return `${cargo.concepto} ${cargo.periodoReferencia}`;
    }
    return cargo.concepto;
}

interface MovimientoInterno {
    id: string;
    fecha: Date;
    createdAt: Date;
    tipo: TipoMovimientoEstadoCuenta;
    descripcion: string;
    debito: number;
    credito: number;
    referencia: string | null;
    cargoId: string | null;
    pagoId: string | null;
    aplicacionPagoId: string | null;
    estado: string;
}

export function construirMovimientos(
    cargos: CargoRaw[],
    aplicaciones: AplicacionPagoRaw[],
): EstadoCuentaMovimientoDto[] {
    const movimientos: MovimientoInterno[] = [];

    for (const cargo of cargos) {
    const tipo = tipoMovimientoDeCargo(cargo);
    const esAnulacion = tipo === 'ANULACION';

    movimientos.push({
        id: cargo.id,
        fecha: cargo.fechaEmision,
        createdAt: cargo.createdAt,
        tipo,
        descripcion: esAnulacion
        ? `Anulación: ${descripcionCargo(cargo)}`
        : descripcionCargo(cargo),
        debito: esAnulacion ? 0 : toNum(cargo.monto),
        credito: 0,
        referencia: null,
        cargoId: cargo.id,
        pagoId: null,
        aplicacionPagoId: null,
        estado: cargo.estado,
    });
    }

    for (const ap of aplicaciones) {
    movimientos.push({
        id: ap.id,
        fecha: ap.pago.fechaPago,
        createdAt: ap.createdAt,
        tipo: 'APLICACION_PAGO',
        descripcion: `Aplicación de pago ${ap.pago.metodoPago.nombre}`,
        debito: 0,
        credito: toNum(ap.montoAplicado),
        referencia: ap.pago.referencia,
        cargoId: ap.cargoId,
        pagoId: ap.pagoId,
        aplicacionPagoId: ap.id,
        estado: ap.pago.estado,
    });
    }

    movimientos.sort((a, b) => {
    const fechaDiff = a.fecha.getTime() - b.fecha.getTime();
    if (fechaDiff !== 0) return fechaDiff;

    const createdDiff = a.createdAt.getTime() - b.createdAt.getTime();
    if (createdDiff !== 0) return createdDiff;

    return TIPO_MOVIMIENTO_PRIORIDAD[a.tipo] - TIPO_MOVIMIENTO_PRIORIDAD[b.tipo];
    });

    let saldoAcumulado = 0;

    return movimientos.map((m) => {
    saldoAcumulado += m.debito - m.credito;

    return {
        id: m.id,
        fecha: formatDate(m.fecha),
        tipo: m.tipo,
        descripcion: m.descripcion,
        debito: round2(m.debito),
        credito: round2(m.credito),
        saldoAcumulado: round2(saldoAcumulado),
        referencia: m.referencia,
        cargoId: m.cargoId,
        pagoId: m.pagoId,
        aplicacionPagoId: m.aplicacionPagoId,
        estado: m.estado,
    };
    });
}

export function filtrarMovimientos(
    movimientos: EstadoCuentaMovimientoDto[],
    filtros: {
    fechaInicio?: string;
    fechaFin?: string;
    tipoMovimiento?: string;
    },
): EstadoCuentaMovimientoDto[] {
    let resultado = movimientos;

    if (filtros.fechaInicio) {
    resultado = resultado.filter((m) => m.fecha >= filtros.fechaInicio!);
    }

    if (filtros.fechaFin) {
    resultado = resultado.filter((m) => m.fecha <= filtros.fechaFin!);
    }

    if (filtros.tipoMovimiento && filtros.tipoMovimiento !== 'TODOS') {
    resultado = resultado.filter((m) => m.tipo === filtros.tipoMovimiento);
    }

    return resultado;
}

function round2(n: number): number {
    return Math.round(n * 100) / 100;
}
