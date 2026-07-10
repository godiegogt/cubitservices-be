import puppeteer from 'puppeteer';
import ExcelJS from 'exceljs';
import type { EstadoCuentaResponse } from './estado-cuenta.dto';
import { buildEstadoCuentaHtml } from './estado-cuenta.template';

const LABELS_TIPO: Record<string, string> = {
    CARGO: 'Cargo',
    APLICACION_PAGO: 'Aplicación de pago',
    MORA: 'Mora',
    AJUSTE: 'Ajuste',
    ANULACION: 'Anulación',
};

export async function generarPdf(data: EstadoCuentaResponse): Promise<Buffer> {
    const browser = await puppeteer.launch({
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    try {
    const page = await browser.newPage();
    await page.setContent(buildEstadoCuentaHtml(data), { waitUntil: 'domcontentloaded' });
    const pdf = await page.pdf({
        format: 'Letter',
        landscape: true,
        printBackground: true,
        margin: { top: '15mm', bottom: '15mm', left: '10mm', right: '10mm' },
    });
    return Buffer.from(pdf);
    } finally {
    await browser.close();
    }
}

export async function generarExcel(data: EstadoCuentaResponse): Promise<Buffer> {
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Estado de Cuenta');

    const { cuenta, resumen } = data;

    ws.addRow(['Estado de Cuenta']).font = { bold: true, size: 14 };
    ws.addRow([]);
    ws.addRow(['Cliente', `${cuenta.cliente.codigo} - ${cuenta.cliente.nombre}`]);
    ws.addRow(['Cuenta', `${cuenta.cuentaServicio.codigo} - ${cuenta.cuentaServicio.nombre}`]);
    ws.addRow(['Servicio', cuenta.servicio.nombre]);
    if (cuenta.ubicacion) {
    ws.addRow(['Ubicación', `${cuenta.ubicacion.nombre} - ${cuenta.ubicacion.direccion}`]);
    }
    if (cuenta.politicaCobro) {
    ws.addRow(['Política de cobro', cuenta.politicaCobro.nombre]);
    }
    ws.addRow([]);

    ws.addRow(['Resumen']).font = { bold: true };
    ws.addRow(['Saldo pendiente', resumen.saldoPendiente]);
    ws.addRow(['Total cargos', resumen.totalCargos]);
    ws.addRow(['Total aplicado', resumen.totalAplicado]);
    ws.addRow(['Saldo disponible del cliente', resumen.saldoDisponibleCliente]);
    ws.addRow([]);

    const headerRow = ws.addRow([
    'Fecha',
    'Tipo',
    'Descripción',
    'Débito',
    'Crédito',
    'Saldo Acumulado',
    'Referencia',
    'Estado',
    ]);
    headerRow.font = { bold: true };
    headerRow.eachCell((cell) => {
    cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' },
    };
    cell.border = {
        bottom: { style: 'thin' },
    };
    });

    for (const mov of data.movimientos) {
    ws.addRow([
        mov.fecha,
        LABELS_TIPO[mov.tipo] ?? mov.tipo,
        mov.descripcion,
        mov.debito,
        mov.credito,
        mov.saldoAcumulado,
        mov.referencia ?? '',
        mov.estado,
    ]);
    }

    ws.getColumn(1).width = 12;
    ws.getColumn(2).width = 18;
    ws.getColumn(3).width = 35;
    ws.getColumn(4).width = 12;
    ws.getColumn(5).width = 12;
    ws.getColumn(6).width = 14;
    ws.getColumn(7).width = 18;
    ws.getColumn(8).width = 12;

    const numberFmt = '#,##0.00';
    ws.getColumn(4).numFmt = numberFmt;
    ws.getColumn(5).numFmt = numberFmt;
    ws.getColumn(6).numFmt = numberFmt;

    const arrayBuffer = await wb.xlsx.writeBuffer();
    return Buffer.from(arrayBuffer);
}
