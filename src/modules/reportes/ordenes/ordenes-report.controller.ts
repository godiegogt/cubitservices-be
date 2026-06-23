import { Request, Response } from "express";
import { reporteOrdenesQuerySchema, reporteOrdenesExportQuerySchema } from "./ordenes-report.schemas";
import { generarReporteOrdenes } from "./ordenes-report.service";
import { exportOrdenesPdf, exportOrdenesExcel } from "./ordenes-report.exporter";

export async function reporteOrdenesHandler(req: Request, res: Response) {
    try {
        const empresaId = req.auth!.empresaId;
        const query = reporteOrdenesQuerySchema.parse(req.query);

        const report = await generarReporteOrdenes(empresaId, {
            estado: query.estado,
            tipoOrden: query.tipoOrden,
            tecnicoId: query.tecnicoId,
            zonaId: query.zonaId,
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
        console.error("[reporteOrdenes]", error);
        return res.status(400).json({
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Error generando reporte de órdenes",
        });
    }
}

export async function exportOrdenesExcelHandler(req: Request, res: Response) {
    try {
        const empresaId = req.auth!.empresaId;
        const query = reporteOrdenesExportQuerySchema.parse(req.query);

        const report = await generarReporteOrdenes(empresaId, {
            estado: query.estado,
            tipoOrden: query.tipoOrden,
            tecnicoId: query.tecnicoId,
            zonaId: query.zonaId,
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
        console.error("[exportOrdenesExcel]", error);
        return res.status(400).json({
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Error exportando reporte de órdenes a Excel",
        });
    }
}

export async function exportOrdenesPdfHandler(req: Request, res: Response) {
    try {
        const empresaId = req.auth!.empresaId;
        const query = reporteOrdenesExportQuerySchema.parse(req.query);

        const report = await generarReporteOrdenes(empresaId, {
            estado: query.estado,
            tipoOrden: query.tipoOrden,
            tecnicoId: query.tecnicoId,
            zonaId: query.zonaId,
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
        console.error("[exportOrdenesPdf]", error);
        return res.status(400).json({
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Error exportando reporte de órdenes a PDF",
        });
    }
}
