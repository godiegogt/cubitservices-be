import puppeteer from "puppeteer";
import ExcelJS from "exceljs";
import { OrdenesReportResultDto } from "./ordenes-report.dto";
import { buildOrdenesReportHtml } from "./ordenes-report.template";
import { formatDate } from "../../../common/utils/datetime";
import { formatUbicacionDireccion } from "./ordenes-report.mapper";

export async function exportOrdenesExcel(
    report: OrdenesReportResultDto
): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "CubitServices";
    workbook.created = new Date();

    const sheet = workbook.addWorksheet("Reporte de Órdenes");

    const COL_COUNT = 13;

    const titleRow = sheet.addRow(["Reporte de Órdenes de Servicio"]);
    titleRow.font = { bold: true, size: 14 };
    sheet.mergeCells(titleRow.number, 1, titleRow.number, COL_COUNT);

    const dateRange =
        report.filters.fechaInicio && report.filters.fechaFin
            ? `Del ${report.filters.fechaInicio} al ${report.filters.fechaFin}`
            : report.filters.fechaInicio
            ? `Desde ${report.filters.fechaInicio}`
            : report.filters.fechaFin
            ? `Hasta ${report.filters.fechaFin}`
            : "Todas las fechas";

    const subtitleRow = sheet.addRow([dateRange]);
    subtitleRow.font = { color: { argb: "FF6B7280" }, size: 10 };
    sheet.mergeCells(subtitleRow.number, 1, subtitleRow.number, COL_COUNT);

    sheet.addRow([]);

    const kpiHeaderRow = sheet.addRow([
        "Total Órdenes",
        "Pendientes",
        "En Proceso",
        "Completadas",
        "Vencidas",
    ]);
    kpiHeaderRow.font = { bold: true, size: 10, color: { argb: "FF6B7280" } };

    const kpiValueRow = sheet.addRow([
        report.summary.totalOrdenes,
        report.summary.pendientes,
        report.summary.enProceso,
        report.summary.completadas,
        report.summary.vencidas,
    ]);
    kpiValueRow.font = { bold: true, size: 14 };

    sheet.addRow([]);
    sheet.addRow([]);

    const dataHeaders = [
        "N° Orden",
        "Título",
        "Estado",
        "Prioridad",
        "Origen",
        "Código Cliente",
        "Cliente",
        "Tipo Servicio",
        "Ubicación",
        "Técnico",
        "Fecha Programada",
        "Fecha Inicio",
        "Fecha Cierre",
    ];

    const headerRow = sheet.addRow(dataHeaders);
    headerRow.font = { bold: true, size: 10 };
    headerRow.eachCell((cell) => {
        cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFF3F4F6" },
        };
        cell.border = {
            bottom: { style: "thin", color: { argb: "FFD1D5DB" } },
        };
    });

    for (const item of report.data) {
        sheet.addRow([
            item.numeroOrden,
            item.titulo,
            item.estado,
            item.prioridad,
            item.origen,
            item.cliente.codigo,
            item.cliente.nombre,
            item.tipoServicio.nombre,
            formatUbicacionDireccion(item.ubicacion),
            item.tecnico?.nombre ?? "",
            item.fechaProgramada ? formatDate(new Date(item.fechaProgramada)) : "",
            item.fechaInicio ? formatDate(new Date(item.fechaInicio)) : "",
            item.fechaCierre ? formatDate(new Date(item.fechaCierre)) : "",
        ]);
    }

    [14, 30, 14, 12, 12, 14, 28, 22, 32, 24, 16, 14, 14].forEach(
        (width, i) => { sheet.getColumn(i + 1).width = width; }
    );

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
}

export async function exportOrdenesPdf(
    report: OrdenesReportResultDto
): Promise<Buffer> {
    const html = buildOrdenesReportHtml(report);
    const browser = await puppeteer.launch({
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    try {
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: "domcontentloaded" });
        const pdf = await page.pdf({
            format: "A4",
            landscape: true,
            printBackground: true,
            margin: { top: "15mm", bottom: "15mm", left: "12mm", right: "12mm" },
        });
        return Buffer.from(pdf);
    } finally {
        await browser.close();
    }
}
