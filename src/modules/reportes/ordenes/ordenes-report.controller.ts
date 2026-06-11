import { Request, Response } from "express";
import { reporteOrdenesQuerySchema } from "../reportes.schemas";
import {
    generarReporteOrdenes,
    exportOrdenesPdf,
    exportOrdenesExcel,
} from "./ordenes-report.service";

export async function reporteOrdenesHandler(req: Request, res: Response) {
    try {
        const empresaId = req.auth!.empresaId;
        const query = reporteOrdenesQuerySchema.parse(req.query);

        const isExport = query.formato === "pdf" || query.formato === "xlsx";

        const report = await generarReporteOrdenes(empresaId, {
            estado: query.estado,
            tipoOrden: query.tipoOrden,
            tecnicoId: query.tecnicoId,
            zonaId: query.zonaId,
            fechaInicio: query.fechaInicio,
            fechaFin: query.fechaFin,
            search: query.search,
            page: isExport ? undefined : query.page,
            pageSize: isExport ? undefined : query.pageSize,
        });

        if (query.formato === "pdf") {
            const pdfBuffer = await exportOrdenesPdf(report);
            res.setHeader("Content-Type", "application/pdf");
            res.setHeader(
                "Content-Disposition",
                `attachment; filename="reporte-ordenes-${query.fechaInicio ?? "all"}-${query.fechaFin ?? "all"}.pdf"`
            );
            return res.send(pdfBuffer);
        }

        if (query.formato === "xlsx") {
            const excelBuffer = await exportOrdenesExcel(report);
            res.setHeader(
                "Content-Type",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            );
            res.setHeader(
                "Content-Disposition",
                `attachment; filename="reporte-ordenes-${query.fechaInicio ?? "all"}-${query.fechaFin ?? "all"}.xlsx"`
            );
            return res.send(excelBuffer);
        }

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
