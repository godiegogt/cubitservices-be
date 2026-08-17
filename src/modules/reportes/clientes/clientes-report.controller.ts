import { Request, Response } from "express";
import { ZodError } from "zod";
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

function handleReportError(error: unknown, res: Response, fallbackMessage: string) {
    if (error instanceof ZodError) {
        return res.status(400).json({
            success: false,
            message: "Parámetros de consulta inválidos",
            errors: error.issues.map((issue) => ({
                path: issue.path.join("."),
                message: issue.message,
            })),
        });
    }

    console.error(fallbackMessage, error);
    return res.status(500).json({
        success: false,
        message: fallbackMessage,
    });
}

export async function reporteClientesHandler(req: Request, res: Response) {
    try {
        const empresaId = req.auth!.empresaId;
        const query = clientesReportQuerySchema.parse(req.query);

        const report = await generarReporteClientes(empresaId, {
            estado: query.estado,
            zonaId: query.zonaId,
            aldea: query.aldea,
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
        return handleReportError(error, res, "Error generando reporte de clientes");
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
        return handleReportError(error, res, "Error exportando reporte de clientes a PDF");
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
        return handleReportError(error, res, "Error exportando reporte de clientes a Excel");
    }
}
