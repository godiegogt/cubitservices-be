export interface ReportePagosFilters {
  fechaInicio: string;
  fechaFin: string;
  clienteId?: string;
  codigoCliente?: string;
  nombreCliente?: string;
  zona?: number;
  metodoPagoId?: string;
  estado?: string;
  usuarioRegistradorId?: string;
  referencia?: string;
}

export interface AplicacionPagoDto {
  cargoId: string;
  concepto: string;
  tipoCargo: string;
  periodoReferencia: string | null;
  montoOriginalCargo: number;
  montoAplicado: number;
  fechaEmisionCargo: string;
  fechaVencimientoCargo: string | null;
  estadoCargo: string;
}

export interface ReportePagoRow {
  id: string;
  fechaPago: string;
  cliente: {
    id: string;
    codigo: string;
    nombre: string;
  };
  metodoPago: {
    id: string;
    nombre: string;
  };
  montoRecibido: number;
  montoAplicado: number;
  montoDisponible: number;
  referencia: string | null;
  estado: "REGISTRADO" | "CONFIRMADO" | "ANULADO";
  registradoPor: {
    id: string;
    nombre: string;
  };
  aplicaciones: AplicacionPagoDto[];
}

export interface ReportePagosSummary {
  totalRecibido: number;
  totalAplicado: number;
  totalDisponible: number;
  cantidadPagos: number;
  pagosAnulados: number;
}

export interface ReportePagosResponse {
  filters: ReportePagosFilters;
  summary: ReportePagosSummary;
  data: ReportePagoRow[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}
