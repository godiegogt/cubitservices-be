import { ClientesReportResultDto } from "./clientes-report.dto";
import { formatZonasServicios } from "./clientes-report.mapper";
import { escapeHtml } from "../../../common/utils/utils";

export function buildClientesReportHtml(report: ClientesReportResultDto): string {
  const rows = report.data
    .map((item) => {
      const zonaServicio = formatZonasServicios(item.zonas);
      const cuentas = item.cuentas.join(", ");

      return `
    <tr>
      <td>${escapeHtml(item.codigo)}</td>
      <td>${escapeHtml(item.nombre)}</td>
      <td>${escapeHtml(item.tipoCliente)}</td>
      <td>${item.identificacion ? escapeHtml(item.identificacion) : "-"}</td>
      <td>${item.telefono ? escapeHtml(item.telefono) : "-"}</td>
      <td>${zonaServicio ? escapeHtml(zonaServicio) : "-"}</td>
      <td>${item.email ? escapeHtml(item.email) : "-"}</td>
      <td>${escapeHtml(item.estado)}</td>
      <td class="text-right">${item.totalCuentas}</td>
      <td>${cuentas ? escapeHtml(cuentas) : "-"}</td>
      <td>${item.fechaRegistro}</td>
    </tr>
  `;
    })
    .join("");

  const filtroTexto = [
    report.filters.estado ? `Estado: ${report.filters.estado}` : null,
    report.filters.zonaId !== undefined ? `Zona: ${report.filters.zonaId}` : null,
    report.filters.aldea !== undefined ? `Aldea: ${report.filters.aldea}` : null,
    report.filters.fechaInicio ? `Desde: ${report.filters.fechaInicio}` : null,
    report.filters.fechaFin ? `Hasta: ${report.filters.fechaFin}` : null,
  ]
    .filter(Boolean)
    .join(" &nbsp;|&nbsp; ");

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
            grid-template-columns: repeat(3, 1fr);
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
            <div class="title">Reporte de Clientes</div>
            <div class="subtitle">
              ${filtroTexto || "Sin filtros aplicados"}
            </div>
          </div>

          <div>
            <strong>Cubitservices</strong><br />
            Generado automáticamente
          </div>
        </div>

        <div class="summary">
          <div class="card">
            <div class="card-label">Total clientes</div>
            <div class="card-value">${report.summary.totalClientes}</div>
          </div>

          <div class="card">
            <div class="card-label">Activos</div>
            <div class="card-value">${report.summary.activos}</div>
          </div>

          <div class="card">
            <div class="card-label">Inactivos</div>
            <div class="card-value">${report.summary.inactivos}</div>
          </div>
        </div>

        <div class="section-title">Detalle de clientes</div>

        <table>
          <thead>
            <tr>
              <th>Código</th>
              <th>Nombre / Razón Social</th>
              <th>Tipo</th>
              <th>Identificación</th>
              <th>Teléfono</th>
              <th>Zona / Servicio</th>
              <th>Email</th>
              <th>Estado</th>
              <th class="text-right">Cuentas</th>
              <th>Nombres de Cuentas</th>
              <th>Registro</th>
            </tr>
          </thead>
          <tbody>
            ${rows || "<tr><td colspan='11' style='text-align:center;color:#9ca3af;padding:16px'>Sin resultados</td></tr>"}
          </tbody>
        </table>

        <div class="footer">
          ${report.pagination.total} registros en total.
          Reporte generado desde Cubitservices. Documento para control administrativo.
        </div>
      </body>
    </html>
  `;
}
