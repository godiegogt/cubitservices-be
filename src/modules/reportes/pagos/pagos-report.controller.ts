import { Request, Response } from "express";
import {
  reportePagosQuerySchema,
  reportePagosExportSchema,
  ReportePagosQuery,
  ReportePagosExportQuery,
} from "./pagos-report.schemas";
import { ReportePagosFilters } from "./pagos-report.dto";
import {
  generarReportePagos,
  generarReportePagosCompleto,
} from "./pagos-report.service";
import { exportPagosPdf, exportPagosExcel } from "./pagos-report.exporter";

function toReportePagosFilters(
  parsed: ReportePagosQuery | ReportePagosExportQuery,
): ReportePagosFilters {
  return {
    fechaInicio: parsed.fechaInicio,
    fechaFin: parsed.fechaFin,
    clienteId: parsed.clienteId,
    codigoCliente: parsed.codigoCliente,
    nombreCliente: parsed.nombreCliente,
    zona: parsed.zona,
    metodoPagoId: parsed.metodoPagoId,
    estado: parsed.estado,
    usuarioRegistradorId: parsed.usuarioRegistradorId,
    referencia: parsed.referencia,
  };
}

export async function reportePagosHandler(req: Request, res: Response) {
  try {
    const empresaId = req.auth!.empresaId;
    const query = reportePagosQuerySchema.parse(req.query);
    const filters = toReportePagosFilters(query);

    const report = await generarReportePagos(
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
    console.error("[reportePagos]", error);
    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Error generando reporte de pagos",
    });
  }
}

export async function exportPdfHandler(req: Request, res: Response) {
  try {
    const empresaId = req.auth!.empresaId;
    const filters = toReportePagosFilters(
      reportePagosExportSchema.parse(req.query),
    );

    const report = await generarReportePagosCompleto(empresaId, filters);
    const pdfBuffer = await exportPagosPdf(report);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="reporte-pagos-${filters.fechaInicio}-${filters.fechaFin}.pdf"`,
    );

    return res.send(pdfBuffer);
  } catch (error) {
    console.error("[exportPagosPdf]", error);
    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Error exportando reporte de pagos a PDF",
    });
  }
}

export async function exportExcelHandler(req: Request, res: Response) {
  try {
    const empresaId = req.auth!.empresaId;
    const filters = toReportePagosFilters(
      reportePagosExportSchema.parse(req.query),
    );

    const report = await generarReportePagosCompleto(empresaId, filters);
    const excelBuffer = await exportPagosExcel(report);

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="reporte-pagos-${filters.fechaInicio}-${filters.fechaFin}.xlsx"`,
    );

    return res.send(excelBuffer);
  } catch (error) {
    console.error("[exportPagosExcel]", error);
    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Error exportando reporte de pagos a Excel",
    });
  }
}
