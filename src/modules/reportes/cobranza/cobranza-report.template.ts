import { CobranzaReportResponse } from "./cobranza-report.dto";

function money(value: number): string {
    return `Q ${value.toFixed(2)}`;
}

function escapeHtml(value: string): string {
    return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function buildCobranzaReportHtml(report: CobranzaReportResponse): string {
    const rows = report.rows
    .map(
        (item) => `
    <tr>
        <td>${escapeHtml(item.clienteNombre)}</td>
        <td>${escapeHtml(item.cuentaServicioNombre)}</td>
        <td>${escapeHtml(item.tipoServicio)}</td>
        <td>${escapeHtml(item.periodo)}</td>
        <td>${escapeHtml(item.concepto)}</td>
        <td>${item.fechaVencimiento || "-"}</td>
        <td class="text-right">${money(item.saldoPendiente)}</td>
        <td>${escapeHtml(item.estadoCargo)}</td>
        <td>${escapeHtml(item.estadoServicio)}</td>
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
            grid-template-columns: repeat(2, 1fr);
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
            <div class="title">Reporte de Cobranza</div>
            <div class="subtitle">Cargos pendientes de cobro</div>
            </div>

            <div>
            <strong>Cubitservices</strong><br />
            Generado automáticamente
            </div>
        </div>

        <div class="summary">
            <div class="card">
            <div class="card-label">Total pendiente</div>
            <div class="card-value">${money(report.kpis.totalPendiente)}</div>
            </div>

            <div class="card">
            <div class="card-label">Cuentas pendientes</div>
            <div class="card-value">${report.kpis.cuentasPendientes}</div>
            </div>
        </div>

        <div class="section-title">Detalle de cargos</div>

        <table>
            <thead>
            <tr>
                <th>Cliente</th>
                <th>Cuenta servicio</th>
                <th>Tipo servicio</th>
                <th>Periodo</th>
                <th>Concepto</th>
                <th>Fecha vencimiento</th>
                <th class="text-right">Saldo pendiente</th>
                <th>Estado cargo</th>
                <th>Estado servicio</th>
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
