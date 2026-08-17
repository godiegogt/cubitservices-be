import {
    OrdenReportItemDto,
    OrdenesReportFilters,
    OrdenesReportResultDto,
} from "./ordenes-report.dto";
import { OrdenReportRaw } from "./ordenes-report.query";

function formatDateOptional(date: Date | null | undefined): string | null {
    if (!date) return null;
    return date.toISOString();
}

export function mapOrdenToDto(orden: OrdenReportRaw): OrdenReportItemDto {
    const asignados = orden.asignaciones.map((asignacion) => ({
        id: asignacion.usuario.id,
        nombre: `${asignacion.usuario.nombres} ${asignacion.usuario.apellidos}`.trim(),
        rol: asignacion.rolEnOrden,
    }));

    return {
        id: orden.id,
        numeroOrden: orden.numeroOrden,
        titulo: orden.titulo,
        estado: orden.estado,
        prioridad: orden.prioridad,
        origen: orden.origen,
        fechaProgramada: formatDateOptional(orden.fechaProgramada),
        fechaInicio: formatDateOptional(orden.fechaInicio),
        fechaCierre: formatDateOptional(orden.fechaCierre),
        cliente: {
            id: orden.cliente.id,
            codigo: orden.cliente.codigo,
            nombre: orden.cliente.nombreRazonSocial,
        },
        tipoServicio: {
            id: orden.tipoServicio.id,
            nombre: orden.tipoServicio.nombre,
        },
        ubicacion: {
            direccion: orden.ubicacion?.direccion || "-",
        },
        asignados,
        createdAt: orden.createdAt.toISOString(),
    };
}

export function mapOrdenesReportResult(
    filters: OrdenesReportFilters,
    queryResult: {
        summary: {
            totalOrdenes: number;
            pendientes: number;
            enProceso: number;
            completadas: number;
            vencidas: number;
        };
        data: OrdenReportRaw[];
        pagination: {
            page: number;
            pageSize: number;
            total: number;
            totalPages: number;
        };
    }
): OrdenesReportResultDto {
    const { estado, tipoServicioId, tecnicoId, zonaId, aldea, fechaInicio, fechaFin, search } =
        filters;
    return {
        filters: { estado, tipoServicioId, tecnicoId, zonaId, aldea, fechaInicio, fechaFin, search },
        summary: queryResult.summary,
        data: queryResult.data.map(mapOrdenToDto),
        pagination: queryResult.pagination,
    };
}
