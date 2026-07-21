import ExcelJS from "exceljs";
import { CobranzaReportResponse } from "./cobranza-report.dto";
import { buildCobranzaReportHtml } from "./cobranza-report.template";

const MONEY_FMT = '"Q "#,##0.00';

export async function exportCobranzaPdf(
    report: CobranzaReportResponse,
): Promise<Buffer> {
    const html = buildCobranzaReportHtml(report);
    const { default: puppeteer } = await import("puppeteer");

    const browser = await puppeteer.launch({
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
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

export async function exportCobranzaExcel(
    report: CobranzaReportResponse,
): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();

    const sheet = workbook.addWorksheet("Reporte de Cobranza");

    sheet.columns = [
    { header: "Cliente", key: "cliente", width: 30 },
    { header: "Cuenta servicio", key: "cuentaServicio", width: 26 },
    { header: "Tipo servicio", key: "tipoServicio", width: 22 },
    { header: "Periodo", key: "periodo", width: 14 },
    { header: "Concepto", key: "concepto", width: 20 },
    { header: "Fecha vencimiento", key: "fechaVencimiento", width: 16 },
    { header: "Saldo pendiente", key: "saldoPendiente", width: 16 },
    { header: "Estado cargo", key: "estadoCargo", width: 14 },
    { header: "Estado servicio", key: "estadoServicio", width: 14 },
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

    for (const item of report.rows) {
    const row = sheet.addRow({
        cliente: item.clienteNombre,
        cuentaServicio: item.cuentaServicioNombre,
        tipoServicio: item.tipoServicio,
        periodo: item.periodo,
        concepto: item.concepto,
        fechaVencimiento: item.fechaVencimiento || "-",
        saldoPendiente: item.saldoPendiente,
        estadoCargo: item.estadoCargo,
        estadoServicio: item.estadoServicio,
    });
    row.getCell("saldoPendiente").numFmt = MONEY_FMT;
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
    ["Total pendiente", report.kpis.totalPendiente, true],
    ["Cuentas pendientes", report.kpis.cuentasPendientes, false],
    ];

    for (const [label, value, isMoneda] of indicadores) {
    const r = summarySheet.addRow([label, value]);
    if (isMoneda) r.getCell(2).numFmt = MONEY_FMT;
    }

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
}
