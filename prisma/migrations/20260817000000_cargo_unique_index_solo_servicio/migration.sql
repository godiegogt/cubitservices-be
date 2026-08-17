-- El indice unico previo aplicaba a cualquier tipo_cargo, bloqueando la creacion
-- de multiples cargos AJUSTE o EXTRAORDINARIO en el mismo periodo/cuenta.
-- Se restringe para que solo el tipo SERVICIO exija unicidad por periodo.
DROP INDEX "cargo_cuenta_servicio_id_periodo_referencia_tipo_cargo_key";

CREATE UNIQUE INDEX "cargo_cuenta_servicio_id_periodo_referencia_tipo_cargo_key"
  ON "cargo"("cuenta_servicio_id", "periodo_referencia", "tipo_cargo")
  WHERE "estado" != 'ANULADO' AND "tipo_cargo" = 'SERVICIO';
