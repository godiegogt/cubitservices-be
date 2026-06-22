import { ReportePagosResponse } from "./pagos-report.dto";

function money(value: number): string {
  return `Q ${value.toFixed(2)}`;
}

export function buildPagosReportHtml(report: ReportePagosResponse): string {
  const rows = report.data
    .map(
      (item) => `
    <tr>
      <td>${item.fechaPago}</td>
      <td>${item.cliente.codigo}</td>
      <td>${item.cliente.nombre}</td>
      <td>${item.metodoPago.nombre}</td>
      <td>${item.referencia ?? "-"}</td>
      <td>${item.estado}</td>
      <td class="text-right">${money(item.montoRecibido)}</td>
      <td class="text-right">${money(item.montoAplicado)}</td>
      <td class="text-right">${money(item.montoDisponible)}</td>
      <td>${item.registradoPor.nombre}</td>
    </tr>
  `,
    )
    .join("");

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />

        <style>
          body {
            font-family: Arial, sans-serif;
            font-size: 12px;
            color: #111827;
            padding: 32px;
          }

          .header {
            display: flex;
            justify-content: space-between;
            border-bottom: 2px solid #111827;
            padding-bottom: 12px;
            margin-bottom: 24px;
          }

          .title {
            font-size: 22px;
            font-weight: bold;
          }

          .subtitle {
            color: #6b7280;
            margin-top: 4px;
          }

          .summary {
            display: grid;
            grid-template-columns: repeat(5, 1fr);
            gap: 12px;
            margin-bottom: 24px;
          }

          .card {
            border: 1px solid #d1d5db;
            border-radius: 8px;
            padding: 12px;
          }

          .card-label {
            font-size: 11px;
            color: #6b7280;
          }

          .card-value {
            font-size: 16px;
            font-weight: bold;
            margin-top: 4px;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 12px;
          }

          th {
            background: #f3f4f6;
            text-align: left;
            font-size: 11px;
            padding: 8px;
            border: 1px solid #d1d5db;
          }

          td {
            padding: 7px;
            border: 1px solid #e5e7eb;
          }

          .text-right {
            text-align: right;
          }

          .section-title {
            font-size: 15px;
            font-weight: bold;
            margin-top: 24px;
          }

          .footer {
            margin-top: 32px;
            font-size: 10px;
            color: #6b7280;
            text-align: center;
          }
        </style>
      </head>

      <body>
        <div class="header">
          <div>
            <div class="title">Reporte de Pagos</div>
            <div class="subtitle">
              Del ${report.filters.fechaInicio} al ${report.filters.fechaFin}
            </div>
          </div>

          <div>
            <strong>Cubitservices</strong><br />
            Generado automáticamente
          </div>
        </div>

        <div class="summary">
          <div class="card">
            <div class="card-label">Cantidad de pagos</div>
            <div class="card-value">${report.summary.cantidadPagos}</div>
          </div>

          <div class="card">
            <div class="card-label">Pagos anulados</div>
            <div class="card-value">${report.summary.pagosAnulados}</div>
          </div>

          <div class="card">
            <div class="card-label">Total recibido</div>
            <div class="card-value">${money(report.summary.totalRecibido)}</div>
          </div>

          <div class="card">
            <div class="card-label">Total aplicado</div>
            <div class="card-value">${money(report.summary.totalAplicado)}</div>
          </div>

          <div class="card">
            <div class="card-label">Total disponible</div>
            <div class="card-value">${money(report.summary.totalDisponible)}</div>
          </div>
        </div>

        <div class="section-title">Detalle de pagos</div>

        <table>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Código</th>
              <th>Cliente</th>
              <th>Método</th>
              <th>Referencia</th>
              <th>Estado</th>
              <th class="text-right">Recibido</th>
              <th class="text-right">Aplicado</th>
              <th class="text-right">Disponible</th>
              <th>Registrado por</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>

        <div class="footer">
          Reporte generado desde Cubitservices. Documento para control administrativo.
        </div>
      </body>
    </html>
  `;
}
