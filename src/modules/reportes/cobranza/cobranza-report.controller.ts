import { Request, Response } from "express";
import { ZodError } from "zod";
import {
    cobranzaReportQuerySchema,
    cobranzaReportExportSchema,
    CobranzaReportQuery,
    CobranzaReportExportQuery,
} from "./cobranza-report.schemas";
import { CobranzaReportFilters } from "./cobranza-report.dto";
import {
    getCobranzaReport,
    getCobranzaReportCompleto,
} from "./cobranza-report.service";
import {
    exportCobranzaPdf,
    exportCobranzaExcel,
} from "./cobranza-report.exporter";

function handleCobranzaReportError(
    error: unknown,
    res: Response,
    logTag: string,
    fallbackMessage: string,
) {
    console.error(logTag, error);

    if (error instanceof ZodError) {
    return res.status(400).json({
        success: false,
        message: error.issues.map((issue) => issue.message).join(", "),
    });
    }

    return res.status(500).json({
    success: false,
    message: fallbackMessage,
    });
}

function toCobranzaReportFilters(
    parsed: CobranzaReportQuery | CobranzaReportExportQuery,
): CobranzaReportFilters {
    return {
    codigoCliente: parsed.codigoCliente,
    nombreCliente: parsed.nombreCliente,
    estadoCargo: parsed.estadoCargo,
    estadoServicio: parsed.estadoServicio,
    tipoServicioId: parsed.tipoServicioId,
    zona: parsed.zona,
    };
}

export async function cobranzaReportHandler(req: Request, res: Response) {
    try {
    const empresaId = req.auth!.empresaId;
    const query = cobranzaReportQuerySchema.parse(req.query);
    const filters = toCobranzaReportFilters(query);

    const report = await getCobranzaReport(
        empresaId,
        filters,
        query.page,
        query.pageSize,
    );

    return res.json({
        success: true,
        message: "Reporte generado correctamente",
        data: report,
    });
    } catch (error) {
    return handleCobranzaReportError(
        error,
        res,
        "[reporteCobranza]",
        "Error generando reporte de cobranza",
    );
    }
}

export async function exportPdfHandler(req: Request, res: Response) {
    try {
    const empresaId = req.auth!.empresaId;
    const filters = toCobranzaReportFilters(
        cobranzaReportExportSchema.parse(req.query),
    );

    const report = await getCobranzaReportCompleto(empresaId, filters);
    const pdfBuffer = await exportCobranzaPdf(report);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
        "Content-Disposition",
        `attachment; filename="reporte-cobranza.pdf"`,
    );

    return res.send(pdfBuffer);
    } catch (error) {
    return handleCobranzaReportError(
        error,
        res,
        "[exportCobranzaPdf]",
        "Error exportando reporte de cobranza a PDF",
    );
    }
}

export async function exportExcelHandler(req: Request, res: Response) {
    try {
    const empresaId = req.auth!.empresaId;
    const filters = toCobranzaReportFilters(
        cobranzaReportExportSchema.parse(req.query),
    );

    const report = await getCobranzaReportCompleto(empresaId, filters);
    const excelBuffer = await exportCobranzaExcel(report);

    res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
        "Content-Disposition",
        `attachment; filename="reporte-cobranza.xlsx"`,
    );

    return res.send(excelBuffer);
    } catch (error) {
    return handleCobranzaReportError(
        error,
        res,
        "[exportCobranzaExcel]",
        "Error exportando reporte de cobranza a Excel",
    );
    }
}
