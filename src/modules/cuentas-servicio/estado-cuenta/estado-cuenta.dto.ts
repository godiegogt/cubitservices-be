import type { TipoMovimientoEstadoCuenta } from './estado-cuenta.types';

export interface EstadoCuentaHeaderDto {
    cliente: {
    id: string;
    codigo: string;
    nombre: string;
    telefono?: string | null;
    email?: string | null;
    estado: string;
    };
    cuentaServicio: {
    id: string;
    codigo: string;
    nombre: string;
    estado: string;
    fechaInicio?: string | null;
    montoBase: number;
    };
    servicio: {
    id: string;
    nombre: string;
    };
    ubicacion?: {
    id: string;
    nombre: string;
    direccion: string;
    referencia?: string | null;
    } | null;
    politicaCobro?: {
    id: string;
    nombre: string;
    } | null;
}

export interface EstadoCuentaResumenDto {
    saldoPendiente: number;
    totalCargos: number;
    totalAplicado: number;
    saldoDisponibleCliente: number;
}

export interface EstadoCuentaMovimientoDto {
    id: string;
    fecha: string;
    tipo: TipoMovimientoEstadoCuenta;
    descripcion: string;
    debito: number;
    credito: number;
    saldoAcumulado: number;
    referencia?: string | null;
    cargoId?: string | null;
    pagoId?: string | null;
    aplicacionPagoId?: string | null;
    estado: string;
}

export interface EstadoCuentaPaginationMeta {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface EstadoCuentaResponse {
    cuenta: EstadoCuentaHeaderDto;
    resumen: EstadoCuentaResumenDto;
    movimientos: EstadoCuentaMovimientoDto[];
    meta: EstadoCuentaPaginationMeta;
}
