-- Vincula cada detalle de ejecucion de generacion al cargo exacto que genero,
-- para que "cargos generados" ya no dependa de re-buscar por cuenta+periodo
-- (lo que traia de vuelta cargos ANULADO de ejecuciones anteriores o posteriores).
ALTER TABLE "ejecucion_generacion_cargo_detalle" ADD COLUMN "cargo_id" UUID;

CREATE INDEX "ejecucion_generacion_cargo_detalle_cargo_id_idx"
  ON "ejecucion_generacion_cargo_detalle"("cargo_id");

ALTER TABLE "ejecucion_generacion_cargo_detalle"
  ADD CONSTRAINT "ejecucion_generacion_cargo_detalle_cargo_id_fkey"
  FOREIGN KEY ("cargo_id") REFERENCES "cargo"("id") ON DELETE SET NULL ON UPDATE CASCADE;
