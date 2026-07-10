import type { EstadoCuentaResponse } from './estado-cuenta.dto';

const LABELS_TIPO: Record<string, string> = {
    CARGO: 'Cargo',
    APLICACION_PAGO: 'Aplicación de pago',
    MORA: 'Mora',
    AJUSTE: 'Ajuste',
    ANULACION: 'Anulación',
};

function escapeHtml(str: string): string {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function fmt(n: number): string {
    return n.toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function buildEstadoCuentaHtml(data: EstadoCuentaResponse): string {
    const { cuenta, resumen, movimientos } = data;

    const ubicacionText = cuenta.ubicacion
        ? `${escapeHtml(cuenta.ubicacion.nombre)} — ${escapeHtml(cuenta.ubicacion.direccion)}`
        : '—';

    const politicaText = cuenta.politicaCobro
        ? escapeHtml(cuenta.politicaCobro.nombre)
        : '—';

    const rows = movimientos
        .map(
            (m) => `
        <tr>
            <td>${escapeHtml(m.fecha)}</td>
            <td>${escapeHtml(LABELS_TIPO[m.tipo] ?? m.tipo)}</td>
            <td>${escapeHtml(m.descripcion)}</td>
            <td class="num">${m.debito > 0 ? fmt(m.debito) : ''}</td>
            <td class="num">${m.credito > 0 ? fmt(m.credito) : ''}</td>
            <td class="num">${fmt(m.saldoAcumulado)}</td>
            <td>${escapeHtml(m.referencia ?? '')}</td>
            <td>${escapeHtml(m.estado)}</td>
        </tr>`,
        )
        .join('');

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

      .info-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 4px 24px;
        margin-bottom: 20px;
        font-size: 11px;
      }

      .info-grid span {
        color: #6b7280;
      }

      .summary {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
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

      .card-value.highlight {
        color: #2563eb;
      }

      .section-title {
        font-size: 15px;
        font-weight: bold;
        margin-top: 24px;
        margin-bottom: 8px;
      }

      table {
        width: 100%;
        border-collapse: collapse;
      }

      th {
        background: #f3f4f6;
        text-align: left;
        font-size: 11px;
        padding: 8px;
        border: 1px solid #d1d5db;
      }

      th.num {
        text-align: right;
      }

      td {
        padding: 7px;
        border: 1px solid #e5e7eb;
        font-size: 11px;
      }

      td.num {
        text-align: right;
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
        <div class="title">Estado de Cuenta</div>
        <div class="subtitle">${escapeHtml(cuenta.cuentaServicio.codigo)} — ${escapeHtml(cuenta.cuentaServicio.nombre)}</div>
      </div>
      <div>
        <strong>Cubitservices</strong><br />
        Generado automáticamente
      </div>
    </div>

    <div class="info-grid">
      <div><span>Cliente:</span> ${escapeHtml(cuenta.cliente.codigo)} — ${escapeHtml(cuenta.cliente.nombre)}</div>
      <div><span>Servicio:</span> ${escapeHtml(cuenta.servicio.nombre)}</div>
      <div><span>Ubicación:</span> ${ubicacionText}</div>
      <div><span>Política de cobro:</span> ${politicaText}</div>
      <div><span>Estado cuenta:</span> ${escapeHtml(cuenta.cuentaServicio.estado)}</div>
      <div><span>Monto base:</span> Q ${fmt(cuenta.cuentaServicio.montoBase)}</div>
    </div>

    <div class="summary">
      <div class="card">
        <div class="card-label">Saldo pendiente</div>
        <div class="card-value">Q ${fmt(resumen.saldoPendiente)}</div>
      </div>
      <div class="card">
        <div class="card-label">Total cargos</div>
        <div class="card-value">Q ${fmt(resumen.totalCargos)}</div>
      </div>
      <div class="card">
        <div class="card-label">Total aplicado</div>
        <div class="card-value">Q ${fmt(resumen.totalAplicado)}</div>
      </div>
      <div class="card">
        <div class="card-label">Saldo disponible cliente</div>
        <div class="card-value highlight">Q ${fmt(resumen.saldoDisponibleCliente)}</div>
      </div>
    </div>

    <div class="section-title">Timeline de movimientos</div>

    <table>
      <thead>
        <tr>
          <th>Fecha</th>
          <th>Tipo</th>
          <th>Descripción</th>
          <th class="num">Débito</th>
          <th class="num">Crédito</th>
          <th class="num">Saldo</th>
          <th>Referencia</th>
          <th>Estado</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>

    <div class="footer">
      Reporte generado desde Cubitservices. Documento para control administrativo.
      &nbsp;|&nbsp; ${movimientos.length} movimientos
    </div>
  </body>
</html>`;
}
