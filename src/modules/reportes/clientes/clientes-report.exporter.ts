import puppeteer from "puppeteer";
import ExcelJS from "exceljs";
import { ClientesReportResultDto } from "./clientes-report.dto";
import { buildClientesReportHtml } from "./clientes-report.template";

export async function exportClientesPdf(
    report: ClientesReportResultDto,
): Promise<Buffer> {
    const html = buildClientesReportHtml(report);

    const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "load" });
    const pdfBuffer = await page.pdf({
        format: "A4",
        landscape: true,
        margin: { top: "15mm", right: "15mm", bottom: "15mm", left: "15mm" },
        printBackground: true,
    });
    return Buffer.from(pdfBuffer);
    } finally {
    await browser.close();
    }
}

export async function exportClientesExcel(
    report: ClientesReportResultDto,
): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "CubitServices";
    workbook.created = new Date();

    const sheet = workbook.addWorksheet("Reporte de Clientes");

    const COL_COUNT = 9;

    const titleRow = sheet.addRow(["Reporte de Clientes"]);
    titleRow.font = { bold: true, size: 14 };
    sheet.mergeCells(titleRow.number, 1, titleRow.number, COL_COUNT);

    const filtroTexto = [
    report.filtros.estado ? `Estado: ${report.filtros.estado}` : null,
    report.filtros.zonaId !== undefined
        ? `Zona: ${report.filtros.zonaId}`
        : null,
    report.filtros.search ? `Búsqueda: ${report.filtros.search}` : null,
    report.filtros.fechaInicio ? `Desde: ${report.filtros.fechaInicio}` : null,
    report.filtros.fechaFin ? `Hasta: ${report.filtros.fechaFin}` : null,
    ]
    .filter(Boolean)
    .join("  |  ");

    const subtitleRow = sheet.addRow([filtroTexto || "Sin filtros aplicados"]);
    subtitleRow.font = { color: { argb: "FF6B7280" }, size: 10 };
    sheet.mergeCells(subtitleRow.number, 1, subtitleRow.number, COL_COUNT);

    sheet.addRow([]);

    const kpiHeaderRow = sheet.addRow(["Total Clientes", "Activos", "Inactivos"]);
    kpiHeaderRow.font = { bold: true, size: 10, color: { argb: "FF6B7280" } };

    const kpiValueRow = sheet.addRow([
    report.resumen.totalClientes,
    report.resumen.activos,
    report.resumen.inactivos,
    ]);
    kpiValueRow.font = { bold: true, size: 14 };

    sheet.addRow([]);
    sheet.addRow([]);

    const dataHeaders = [
    "Código",
    "Nombre / Razón Social",
    "Tipo Cliente",
    "Identificación",
    "Teléfono",
    "Email",
    "Estado",
    "Cuentas Servicio",
    "Fecha Registro",
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

    for (const item of report.items) {
    sheet.addRow([
        item.codigo,
        item.nombre,
        item.tipoCliente,
        item.identificacion ?? "",
        item.telefono ?? "",
        item.email ?? "",
        item.estado,
        item.totalCuentas,
        item.fechaRegistro,
    ]);
    }

    [14, 38, 16, 18, 16, 28, 12, 16, 16].forEach((width, i) => {
    sheet.getColumn(i + 1).width = width;
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer as ArrayBuffer);
}
