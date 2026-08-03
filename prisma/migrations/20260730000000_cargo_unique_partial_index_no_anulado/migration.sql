-- Reemplaza el indice unico de "cargo" por uno parcial que ignora los cargos ANULADO,
-- para permitir volver a generar un cargo SERVICIO cuando el anterior fue anulado.
DROP INDEX "cargo_cuenta_servicio_id_periodo_referencia_tipo_cargo_key";

CREATE UNIQUE INDEX "cargo_cuenta_servicio_id_periodo_referencia_tipo_cargo_key"
  ON "cargo"("cuenta_servicio_id", "periodo_referencia", "tipo_cargo")
  WHERE "estado" != 'ANULADO';
