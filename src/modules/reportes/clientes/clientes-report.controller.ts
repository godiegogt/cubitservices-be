import { Request, Response } from "express";
import { formatDate } from "../../../common/utils/datetime";
import {
    clientesReportQuerySchema,
    clientesExportQuerySchema,
} from "./clientes-report.schemas";
import { generarReporteClientes } from "./clientes-report.service";
import {
    exportClientesPdf,
    exportClientesExcel,
} from "./clientes-report.exporter";

export async function reporteClientesHandler(req: Request, res: Response) {
    try {
        const empresaId = req.auth!.empresaId;
        const query = clientesReportQuerySchema.parse(req.query);

        const report = await generarReporteClientes(empresaId, {
            estado: query.estado,
            zonaId: query.zonaId,
            servicioId: query.servicioId,
            search: query.search,
            fechaInicio: query.fechaInicio,
            fechaFin: query.fechaFin,
            page: query.page,
            pageSize: query.pageSize,
        });

        return res.json({
            success: true,
            message: "Reporte generado correctamente",
            data: report,
        });
    } catch (error) {
        console.error("[reporteClientes]", error);
        return res.status(400).json({
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Error generando reporte de clientes",
        });
    }
}

export async function exportClientesPdfHandler(req: Request, res: Response) {
    try {
        const empresaId = req.auth!.empresaId;
        const query = clientesExportQuerySchema.parse(req.query);

        const report = await generarReporteClientes(empresaId, {
            ...query,
            fetchAll: true,
        });

        const pdfBuffer = await exportClientesPdf(report);

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
            "Content-Disposition",
            `attachment; filename="reporte-clientes-${formatDate(new Date())}.pdf"`,
        );

        return res.send(pdfBuffer);
    } catch (error) {
        console.error("[exportClientesPdf]", error);
        return res.status(400).json({
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Error exportando reporte de clientes a PDF",
        });
    }
}

export async function exportClientesExcelHandler(req: Request, res: Response) {
    try {
        const empresaId = req.auth!.empresaId;
        const query = clientesExportQuerySchema.parse(req.query);

        const report = await generarReporteClientes(empresaId, {
            ...query,
            fetchAll: true,
        });

        const excelBuffer = await exportClientesExcel(report);

        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        );
        res.setHeader(
            "Content-Disposition",
            `attachment; filename="reporte-clientes-${formatDate(new Date())}.xlsx"`,
        );

        return res.send(excelBuffer);
    } catch (error) {
        console.error("[exportClientesExcel]", error);
        return res.status(400).json({
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Error exportando reporte de clientes a Excel",
        });
    }
}
