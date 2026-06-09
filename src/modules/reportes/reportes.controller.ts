import { Request, Response } from "express";
import { reportePagosQuerySchema } from "./reportes.schemas";
import { generarReportePagos } from "./pagos/pagos-report.service";
import { exportPagosPdf, exportPagosExcel } from "./pagos/pagos-export.service";

export async function reportePagosHandler(req: Request, res: Response) {
    try {
    const empresaId = req.auth!.empresaId;
    const query = reportePagosQuerySchema.parse(req.query);

    const report = await generarReportePagos(
        empresaId,
        {
        fechaInicio: query.fechaInicio,
        fechaFin: query.fechaFin,
        clienteId: query.clienteId,
        metodoPagoId: query.metodoPagoId,
        estado: query.estado,
        usuarioRegistradorId: query.usuarioRegistradorId,
        referencia: query.referencia,
        page: query.page,
        pageSize: query.pageSize,
        },
        query.formato
    );

    if (query.formato === "pdf") {
        const pdfBuffer = await exportPagosPdf(report);

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
        "Content-Disposition",
        `attachment; filename="reporte-pagos-${query.fechaInicio}-${query.fechaFin}.pdf"`
        );

        return res.send(pdfBuffer);
    }

    if (query.formato === "xlsx") {
        const excelBuffer = await exportPagosExcel(report);

        res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        res.setHeader(
        "Content-Disposition",
        `attachment; filename="reporte-pagos-${query.fechaInicio}-${query.fechaFin}.xlsx"`
        );

        return res.send(excelBuffer);
    }

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
