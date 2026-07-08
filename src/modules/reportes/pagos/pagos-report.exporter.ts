import ExcelJS from "exceljs";
import { ReportePagosResponse } from "./pagos-report.dto";
import { buildPagosReportHtml } from "./pagos-report.template";

const MONEY_FMT = '"Q "#,##0.00';

export async function exportPagosPdf(
    report: ReportePagosResponse,
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
    report: ReportePagosResponse,
): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();

    const sheet = workbook.addWorksheet("Reporte de Pagos");

    sheet.columns = [
    { header: "Fecha", key: "fechaPago", width: 14 },
    { header: "Código", key: "codigo", width: 14 },
    { header: "Cliente", key: "cliente", width: 30 },
    { header: "Método de pago", key: "metodoPago", width: 20 },
    { header: "Referencia", key: "referencia", width: 18 },
    { header: "Estado", key: "estado", width: 14 },
    { header: "Monto recibido", key: "montoRecibido", width: 16 },
    { header: "Aplicado", key: "montoAplicado", width: 14 },
    { header: "Monto disponible", key: "montoDisponible", width: 16 },
    { header: "Registrado por", key: "registradoPor", width: 24 },
    ];

    sheet.getRow(1).eachCell((cell) => {
    cell.font = { bold: true };
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
    const row = sheet.addRow({
        fechaPago: item.fechaPago,
        codigo: item.cliente.codigo,
        cliente: item.cliente.nombre,
        metodoPago: item.metodoPago.nombre,
        referencia: item.referencia ?? "-",
        estado: item.estado,
        montoRecibido: item.montoRecibido,
        montoAplicado: item.montoAplicado,
        montoDisponible: item.montoDisponible,
        registradoPor: item.registradoPor.nombre,
    });
    row.getCell("montoRecibido").numFmt = MONEY_FMT;
    row.getCell("montoAplicado").numFmt = MONEY_FMT;
    row.getCell("montoDisponible").numFmt = MONEY_FMT;
    }

    const summarySheet = workbook.addWorksheet("Resumen");
    summarySheet.columns = [{ width: 26 }, { width: 14 }];

    const titleRow = summarySheet.addRow(["Resumen del reporte"]);
    titleRow.getCell(1).font = { bold: true, size: 13 };
    summarySheet.addRow([]);

    const indicadoresHeader = summarySheet.addRow(["Indicador", "Valor"]);
    indicadoresHeader.eachCell((cell) => {
    cell.font = { bold: true };
    });

    const indicadores: [string, number, boolean][] = [
    ["Cantidad de pagos", report.summary.cantidadPagos, false],
    ["Pagos anulados", report.summary.pagosAnulados, false],
    ["Total recibido", report.summary.totalRecibido, true],
    ["Total aplicado", report.summary.totalAplicado, true],
    ["Total disponible", report.summary.totalDisponible, true],
    ];

    for (const [label, value, isMoneda] of indicadores) {
    const r = summarySheet.addRow([label, value]);
    if (isMoneda) r.getCell(2).numFmt = MONEY_FMT;
    }

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
}
