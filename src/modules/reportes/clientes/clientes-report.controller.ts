    import { Request, Response } from "express";
import { clientesReportQuerySchema } from "./clientes-report.query";
import { generarReporteClientes, exportClientesPdf, exportClientesExcel } from "./clientes-report.service";

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
            fetchAll: query.formato !== "json",
        });

        if (query.formato === "pdf") {
            const pdfBuffer = await exportClientesPdf(report);

            res.setHeader("Content-Type", "application/pdf");
            res.setHeader(
                "Content-Disposition",
                `attachment; filename="reporte-clientes-${new Date().toISOString().slice(0, 10)}.pdf"`
            );

            return res.send(pdfBuffer);
        }

        if (query.formato === "xlsx") {
            const excelBuffer = await exportClientesExcel(report);

            res.setHeader(
                "Content-Type",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            );
            res.setHeader(
                "Content-Disposition",
                `attachment; filename="reporte-clientes-${new Date().toISOString().slice(0, 10)}.xlsx"`
            );

            return res.send(excelBuffer);
        }

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
