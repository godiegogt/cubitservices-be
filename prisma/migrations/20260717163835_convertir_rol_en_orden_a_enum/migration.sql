-- CreateEnum
CREATE TYPE "RolEnOrden" AS ENUM ('TECNICO', 'AYUDANTE', 'SUPERVISOR');

-- Normalizar valores heredados que no calzan con el enum antes de convertir la columna
-- 'responsable' se usaba como filtro de "responsable de la orden" -> equivale a TECNICO
UPDATE "orden_servicio_asignacion"
SET "rol_en_orden" = 'TECNICO'
WHERE "rol_en_orden" = 'responsable';

-- Normalizar el antiguo default "ENCARGADO" -> equivale a TECNICO
UPDATE "orden_servicio_asignacion"
SET "rol_en_orden" = 'TECNICO'
WHERE "rol_en_orden" = 'ENCARGADO';

-- AlterTable: convertir la columna existente usando cast explícito (preserva los datos)
ALTER TABLE "orden_servicio_asignacion"
  ALTER COLUMN "rol_en_orden" TYPE "RolEnOrden"
  USING ("rol_en_orden"::"RolEnOrden");
