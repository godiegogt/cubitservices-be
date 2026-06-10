import ExcelJS from "exceljs";
import { ReportePagosResultDto } from "../common/reportes.dto";
import { buildPagosReportHtml } from "./pagos-report.template";
import { buildPagosExcelRows } from "./pagos-export.mapper";

const MONEY_FMT = '"Q "#,##0.00';

export async function exportPagosPdf(
    report: ReportePagosResultDto
): Promise<Buffer> {
    const html = buildPagosReportHtml(report);

    const { default: puppeteer } = await import("puppeteer");

    const browser = await puppeteer.launch({
    headless: "shell",
    args: ["--no-sandbox"],
    });

    try {
    const page = await browser.newPage();

    await page.setContent(html, { waitUntil: "load" });

    const pdf = await page.pdf({
        format: "A4",
        printBackground: true,
        margin: { top: "20mm", right: "12mm", bottom: "18mm", left: "12mm" },
    });

    return Buffer.from(pdf);
    } finally {
    await browser.close();
    }
}

export async function exportPagosExcel(
    report: ReportePagosResultDto
): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();

    // ── Hoja principal ──────────────────────────────────────────────────────────

    const sheet = workbook.addWorksheet("Reporte de Pagos");

    sheet.columns = [
    { header: "Fecha", key: "fecha", width: 14 },
    { header: "Código", key: "codigo", width: 14 },
    { header: "Cliente", key: "cliente", width: 30 },
    { header: "Método de pago", key: "metodoPago", width: 20 },
    { header: "Referencia", key: "referencia", width: 18 },
    { header: "Estado", key: "estado", width: 14 },
    { header: "Monto total", key: "montoTotal", width: 14 },
    { header: "Aplicado", key: "montoAplicado",  width: 14 },
    { header: "No aplicado", key: "montoNoAplicado",width: 14 },
    { header: "Registrado por", key: "registradoPor",  width: 24 },
    ];

    sheet.getRow(1).eachCell((cell) => {
    cell.font = { bold: true };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF3F4F6" } };
    cell.border = { bottom: { style: "thin", color: { argb: "FFD1D5DB" } } };
    });

    for (const rowData of buildPagosExcelRows(report)) {
    const row = sheet.addRow(rowData);
    row.getCell("montoTotal").numFmt     = MONEY_FMT;
    row.getCell("montoAplicado").numFmt  = MONEY_FMT;
    row.getCell("montoNoAplicado").numFmt = MONEY_FMT;
    }

    // ── Hoja resumen ────────────────────────────────────────────────────────────

    const summary = workbook.addWorksheet("Resumen");

    summary.columns = [{ width: 26 }, { width: 14 }, { width: 14 }];

    const titleRow = summary.addRow(["Resumen del reporte"]);
    titleRow.getCell(1).font = { bold: true, size: 13 };

    summary.addRow([]);

    const indicadoresHeader = summary.addRow(["Indicador", "Valor"]);
    indicadoresHeader.eachCell((cell) => { cell.font = { bold: true }; });

    const indicadores: [string, number, boolean][] = [
    ["Cantidad de pagos", report.resumen.totalPagos, false],
    ["Total cobrado", report.resumen.totalCobrado, true],
    ["Total aplicado", report.resumen.totalAplicado, true],
    ["No aplicado", report.resumen.totalNoAplicado, true],
    ];

    for (const [label, value, isMoneda] of indicadores) {
    const r = summary.addRow([label, value]);
    if (isMoneda) r.getCell(2).numFmt = MONEY_FMT;
    }

    summary.addRow([]);

    const metodosTitle = summary.addRow(["Por método de pago"]);
    metodosTitle.getCell(1).font = { bold: true };

    const metodosHeader = summary.addRow(["Método", "Cantidad", "Total"]);
    metodosHeader.eachCell((cell) => { cell.font = { bold: true }; });

    for (const item of report.porMetodoPago) {
    const r = summary.addRow([item.metodoPago, item.cantidad, item.total]);
    r.getCell(3).numFmt = MONEY_FMT;
    }

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
}
