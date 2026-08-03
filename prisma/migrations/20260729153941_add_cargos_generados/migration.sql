/*
  Warnings:

  - A unique constraint covering the columns `[cuenta_servicio_id,periodo_referencia,tipo_cargo]` on the table `cargo` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "estado_ejecucion_generacion" AS ENUM ('PROCESANDO', 'COMPLETADA', 'COMPLETADA_CON_ERRORES', 'FALLIDA');

-- CreateEnum
CREATE TYPE "resultado_generacion" AS ENUM ('GENERADO', 'OMITIDO', 'ERROR');

-- CreateEnum
CREATE TYPE "origen_ejecucion" AS ENUM ('MANUAL', 'JOB');

-- CreateEnum
CREATE TYPE "origen_cargo" AS ENUM ('MANUAL', 'GENERACION_AUTOMATICA');

-- AlterTable
ALTER TABLE "cargo" ADD COLUMN     "origen" "origen_cargo" NOT NULL DEFAULT 'MANUAL';

-- CreateTable
CREATE TABLE "ejecucion_generacion_cargo" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "empresa_id" UUID NOT NULL,
    "usuario_id" UUID,
    "periodo" VARCHAR(7) NOT NULL,
    "origen" "origen_ejecucion" NOT NULL,
    "estado" "estado_ejecucion_generacion" NOT NULL,
    "fecha_inicio" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_fin" TIMESTAMPTZ(6),
    "cantidad_procesadas" INTEGER NOT NULL DEFAULT 0,
    "cantidad_generadas" INTEGER NOT NULL DEFAULT 0,
    "cantidad_omitidas" INTEGER NOT NULL DEFAULT 0,
    "cantidad_errores" INTEGER NOT NULL DEFAULT 0,
    "monto_generado" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "mensaje_error" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "ejecucion_generacion_cargo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ejecucion_generacion_cargo_detalle" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "ejecucion_id" UUID NOT NULL,
    "cuenta_servicio_id" UUID NOT NULL,
    "cliente_id" UUID NOT NULL,
    "resultado" "resultado_generacion" NOT NULL,
    "mensaje" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ejecucion_generacion_cargo_detalle_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ejecucion_generacion_cargo_empresa_id_idx" ON "ejecucion_generacion_cargo"("empresa_id");

-- CreateIndex
CREATE INDEX "ejecucion_generacion_cargo_estado_idx" ON "ejecucion_generacion_cargo"("estado");

-- CreateIndex
CREATE INDEX "ejecucion_generacion_cargo_periodo_idx" ON "ejecucion_generacion_cargo"("periodo");

-- CreateIndex
CREATE INDEX "ejecucion_generacion_cargo_detalle_ejecucion_id_idx" ON "ejecucion_generacion_cargo_detalle"("ejecucion_id");

-- CreateIndex
CREATE INDEX "ejecucion_generacion_cargo_detalle_resultado_idx" ON "ejecucion_generacion_cargo_detalle"("resultado");

-- CreateIndex
CREATE INDEX "ejecucion_generacion_cargo_detalle_cuenta_servicio_id_idx" ON "ejecucion_generacion_cargo_detalle"("cuenta_servicio_id");

-- CreateIndex
CREATE INDEX "ejecucion_generacion_cargo_detalle_ejecucion_id_resultado_idx" ON "ejecucion_generacion_cargo_detalle"("ejecucion_id", "resultado");

-- CreateIndex
CREATE UNIQUE INDEX "cargo_cuenta_servicio_id_periodo_referencia_tipo_cargo_key" ON "cargo"("cuenta_servicio_id", "periodo_referencia", "tipo_cargo");

-- AddForeignKey
ALTER TABLE "ejecucion_generacion_cargo" ADD CONSTRAINT "ejecucion_generacion_cargo_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ejecucion_generacion_cargo" ADD CONSTRAINT "ejecucion_generacion_cargo_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ejecucion_generacion_cargo_detalle" ADD CONSTRAINT "ejecucion_generacion_cargo_detalle_ejecucion_id_fkey" FOREIGN KEY ("ejecucion_id") REFERENCES "ejecucion_generacion_cargo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ejecucion_generacion_cargo_detalle" ADD CONSTRAINT "ejecucion_generacion_cargo_detalle_cuenta_servicio_id_fkey" FOREIGN KEY ("cuenta_servicio_id") REFERENCES "cuenta_servicio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ejecucion_generacion_cargo_detalle" ADD CONSTRAINT "ejecucion_generacion_cargo_detalle_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
