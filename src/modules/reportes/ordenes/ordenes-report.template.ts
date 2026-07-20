import { OrdenesReportResultDto } from "./ordenes-report.dto";
import { formatDate } from "../../../common/utils/datetime";
import { formatUbicacionDireccion } from "./ordenes-report.mapper";

function escapeHtml(str: string): string {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

export function buildOrdenesReportHtml(report: OrdenesReportResultDto): string {
    const { summary, data, pagination, filters } = report;

    const dateRange =
        filters.fechaInicio && filters.fechaFin
            ? `Del ${filters.fechaInicio} al ${filters.fechaFin}`
            : filters.fechaInicio
            ? `Desde ${filters.fechaInicio}`
            : filters.fechaFin
            ? `Hasta ${filters.fechaFin}`
            : "Todas las fechas";

    const rows = data
        .map(
            (item) => `
        <tr>
            <td>${escapeHtml(item.numeroOrden)}</td>
            <td>${item.estado}</td>
            <td>${item.prioridad}</td>
            <td>${item.origen}</td>
            <td>${escapeHtml(item.cliente.codigo)}</td>
            <td>${escapeHtml(item.cliente.nombre)}</td>
            <td>${escapeHtml(item.tipoServicio.nombre)}</td>
            <td>${escapeHtml(formatUbicacionDireccion(item.ubicacion))}</td>
            <td>${
                item.asignados.length
                    ? escapeHtml(
                          item.asignados
                              .map((a) => `${a.nombre} (${a.rol})`)
                              .join(", ")
                      )
                    : "-"
            }</td>
            <td>${item.fechaProgramada ? formatDate(new Date(item.fechaProgramada)) : "-"}</td>
            <td>${item.fechaInicio ? formatDate(new Date(item.fechaInicio)) : "-"}</td>
            <td>${item.fechaCierre ? formatDate(new Date(item.fechaCierre)) : "-"}</td>
        </tr>`
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

          .card-value.danger {
            color: #dc2626;
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
            <div class="title">Reporte de Órdenes de Servicio</div>
            <div class="subtitle">${dateRange}</div>
          </div>
          <div>
            <strong>Cubitservices</strong><br />
            Generado automáticamente
          </div>
        </div>

        <div class="summary">
          <div class="card">
            <div class="card-label">Total órdenes</div>
            <div class="card-value">${summary.totalOrdenes}</div>
          </div>
          <div class="card">
            <div class="card-label">Pendientes</div>
            <div class="card-value">${summary.pendientes}</div>
          </div>
          <div class="card">
            <div class="card-label">En proceso</div>
            <div class="card-value">${summary.enProceso}</div>
          </div>
          <div class="card">
            <div class="card-label">Completadas</div>
            <div class="card-value">${summary.completadas}</div>
          </div>
          <div class="card">
            <div class="card-label">Vencidas</div>
            <div class="card-value danger">${summary.vencidas}</div>
          </div>
        </div>

        <div class="section-title">Detalle de órdenes</div>

        <table>
          <thead>
            <tr>
              <th>N° Orden</th>
              <th>Estado</th>
              <th>Prioridad</th>
              <th>Origen</th>
              <th>Código</th>
              <th>Cliente</th>
              <th>Tipo Servicio</th>
              <th>Ubicación</th>
              <th>Asignados</th>
              <th>F. Programada</th>
              <th>F. Inicio</th>
              <th>F. Cierre</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>

        <div class="footer">
          Reporte generado desde Cubitservices. Documento para control administrativo.
          &nbsp;|&nbsp; ${pagination.total} registros
        </div>
      </body>
    </html>
  `;
}
