import puppeteer from 'puppeteer';
import { PagoDiaRow } from '../common/dashboard.dto';
import { toDateString } from '../common/dashboard.mapper';

function formatMonto(monto: number): string {
    return monto.toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function generarHTML(pagosDia: PagoDiaRow[], desde: Date, hasta: Date): string {
    const fechaDesde = toDateString(desde);
    const fechaHasta = toDateString(hasta);
    const titulo = fechaDesde === fechaHasta
        ? `Reporte de Pagos — ${fechaDesde}`
        : `Reporte de Pagos — ${fechaDesde} al ${fechaHasta}`;

    const totalMonto = pagosDia.reduce((acc, p) => acc + p.monto, 0);

    const filas = pagosDia.length
        ? pagosDia.map((p, i) => `
            <tr>
                <td class="center">${i + 1}</td>
                <td>${p.fecha}</td>
                <td>${p.cliente}</td>
                <td>${p.metodoPago}</td>
                <td class="right">${formatMonto(p.monto)}</td>
                <td>${p.usuario}</td>
            </tr>`).join('')
        : '<tr><td colspan="6" class="empty">Sin registros para este periodo</td></tr>';

    return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Arial, sans-serif; font-size: 12px; color: #222; padding: 32px; }
  .header { margin-bottom: 24px; }
  .header h1 { font-size: 17px; font-weight: 700; }
  .header p { color: #666; font-size: 11px; margin-top: 4px; }
  table { width: 100%; border-collapse: collapse; }
  thead th {
    background: #1e293b; color: #fff;
    padding: 9px 12px; text-align: left;
    font-size: 10px; text-transform: uppercase; letter-spacing: 0.6px;
  }
  thead th.right { text-align: right; }
  tbody td { padding: 8px 12px; border-bottom: 1px solid #e5e7eb; }
  tbody tr:nth-child(even) td { background: #f8fafc; }
  tfoot td {
    padding: 9px 12px; border-top: 2px solid #1e293b;
    font-weight: 700; background: #f1f5f9;
  }
  .center { text-align: center; }
  .right  { text-align: right; }
  .empty  { text-align: center; color: #999; padding: 20px; }
  .footer { margin-top: 16px; font-size: 10px; color: #999; }
</style>
</head>
<body>
  <div class="header">
    <h1>${titulo}</h1>
    <p>Generado el ${new Date().toLocaleString('es-GT')} &nbsp;·&nbsp; ${pagosDia.length} registro(s)</p>
  </div>

  <table>
    <thead>
      <tr>
        <th class="center">#</th>
        <th>Fecha</th>
        <th>Cliente</th>
        <th>Método de Pago</th>
        <th class="right">Monto</th>
        <th>Registrado por</th>
      </tr>
    </thead>
    <tbody>${filas}</tbody>
    <tfoot>
      <tr>
        <td colspan="4" class="right">Total</td>
        <td class="right">${formatMonto(totalMonto)}</td>
        <td></td>
      </tr>
    </tfoot>
  </table>
</body>
</html>`;
}

export async function generarPdfPagosDia(
    pagosDia: PagoDiaRow[],
    desde: Date,
    hasta: Date,
): Promise<Buffer> {
    const browser = await puppeteer.launch({
        headless: true,
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    try {
        const page = await browser.newPage();
        await page.setContent(generarHTML(pagosDia, desde, hasta), { waitUntil: 'load' });
        const pdf = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: { top: '10mm', bottom: '10mm', left: '10mm', right: '10mm' },
        });
        return Buffer.from(pdf);
    } finally {
        await browser.close();
    }
}
