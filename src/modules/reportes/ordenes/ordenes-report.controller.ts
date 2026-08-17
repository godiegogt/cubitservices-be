import { Request, Response } from "express";
import { ZodError } from "zod";
import { reporteOrdenesQuerySchema, reporteOrdenesExportQuerySchema } from "./ordenes-report.schemas";
import { generarReporteOrdenes } from "./ordenes-report.service";
import { exportOrdenesPdf, exportOrdenesExcel } from "./ordenes-report.exporter";

function handleReporteOrdenesError(error: unknown, res: Response, context: string, defaultMessage: string) {
    console.error(`[${context}]`, error);

    if (error instanceof ZodError) {
        return res.status(400).json({
            success: false,
            message: "Parámetros de consulta inválidos",
            errors: error.issues,
        });
    }

    return res.status(500).json({
        success: false,
        message: defaultMessage,
    });
}

export async function reporteOrdenesHandler(req: Request, res: Response) {
    try {
        const empresaId = req.auth!.empresaId;
        const query = reporteOrdenesQuerySchema.parse(req.query);

        const report = await generarReporteOrdenes(empresaId, {
            estado: query.estado,
            tipoServicioId: query.tipoServicioId,
            tecnicoId: query.tecnicoId,
            zonaId: query.zonaId,
            aldea: query.aldea,
            fechaInicio: query.fechaInicio,
            fechaFin: query.fechaFin,
            search: query.search,
            page: query.page,
            pageSize: query.pageSize,
        });

        return res.json({
            success: true,
            message: "Reporte generado correctamente",
            data: report,
        });
    } catch (error) {
        return handleReporteOrdenesError(error, res, "reporteOrdenes", "Error generando reporte de órdenes");
    }
}

export async function exportOrdenesExcelHandler(req: Request, res: Response) {
    try {
        const empresaId = req.auth!.empresaId;
        const query = reporteOrdenesExportQuerySchema.parse(req.query);

        const report = await generarReporteOrdenes(empresaId, {
            estado: query.estado,
            tipoServicioId: query.tipoServicioId,
            tecnicoId: query.tecnicoId,
            zonaId: query.zonaId,
            aldea: query.aldea,
            fechaInicio: query.fechaInicio,
            fechaFin: query.fechaFin,
            search: query.search,
        });

        const buffer = await exportOrdenesExcel(report);

        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        res.setHeader(
            "Content-Disposition",
            `attachment; filename="reporte-ordenes-${query.fechaInicio ?? "all"}-${query.fechaFin ?? "all"}.xlsx"`
        );
        return res.send(buffer);
    } catch (error) {
        return handleReporteOrdenesError(error, res, "exportOrdenesExcel", "Error exportando reporte de órdenes a Excel");
    }
}

export async function exportOrdenesPdfHandler(req: Request, res: Response) {
    try {
        const empresaId = req.auth!.empresaId;
        const query = reporteOrdenesExportQuerySchema.parse(req.query);

        const report = await generarReporteOrdenes(empresaId, {
            estado: query.estado,
            tipoServicioId: query.tipoServicioId,
            tecnicoId: query.tecnicoId,
            zonaId: query.zonaId,
            aldea: query.aldea,
            fechaInicio: query.fechaInicio,
            fechaFin: query.fechaFin,
            search: query.search,
        });

        const buffer = await exportOrdenesPdf(report);

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
            "Content-Disposition",
            `attachment; filename="reporte-ordenes-${query.fechaInicio ?? "all"}-${query.fechaFin ?? "all"}.pdf"`
        );
        return res.send(buffer);
    } catch (error) {
        return handleReporteOrdenesError(error, res, "exportOrdenesPdf", "Error exportando reporte de órdenes a PDF");
    }
}
