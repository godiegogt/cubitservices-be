import puppeteer from "puppeteer";
import ExcelJS from "exceljs";
import { ClientesReportResultDto } from "./clientes-report.dto";
import { buildClientesReportHtml } from "./clientes-report.template";
import { formatZonasServicios } from "./clientes-report.mapper";

export async function exportClientesPdf(
    report: ClientesReportResultDto,
): Promise<Buffer> {
    const html = buildClientesReportHtml(report);

    const browser = await puppeteer.launch({
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
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

    const COL_COUNT = 11;

    const titleRow = sheet.addRow(["Reporte de Clientes"]);
    titleRow.font = { bold: true, size: 14 };
    sheet.mergeCells(titleRow.number, 1, titleRow.number, COL_COUNT);

    const filtroTexto = [
    report.filters.estado ? `Estado: ${report.filters.estado}` : null,
    report.filters.zonaId !== undefined
        ? `Zona: ${report.filters.zonaId}`
        : null,
    report.filters.servicioId
        ? `Código de servicio: ${report.filters.servicioId}`
        : null,
    report.filters.search ? `Búsqueda: ${report.filters.search}` : null,
    report.filters.fechaInicio ? `Desde: ${report.filters.fechaInicio}` : null,
    report.filters.fechaFin ? `Hasta: ${report.filters.fechaFin}` : null,
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
    report.summary.totalClientes,
    report.summary.activos,
    report.summary.inactivos,
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
    "Zona / Servicio",
    "Email",
    "Estado",
    "Cuentas Servicio",
    "Nombres de Cuentas",
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

    for (const item of report.data) {
    sheet.addRow([
        item.codigo,
        item.nombre,
        item.tipoCliente,
        item.identificacion ?? "",
        item.telefono ?? "",
        formatZonasServicios(item.zonas),
        item.email ?? "",
        item.estado,
        item.totalCuentas,
        item.cuentas.join(", "),
        item.fechaRegistro,
    ]);
    }

    [14, 38, 16, 18, 16, 40, 28, 12, 16, 32, 16].forEach((width, i) => {
    sheet.getColumn(i + 1).width = width;
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer as ArrayBuffer);
}
