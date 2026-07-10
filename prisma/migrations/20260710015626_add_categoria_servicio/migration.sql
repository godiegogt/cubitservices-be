/*
  Warnings:

  - Added the required column `categoria_servicio` to the `tipo_servicio` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
-- CreateEnum
CREATE TYPE "CategoriaServicio" AS ENUM ('MANTENIMIENTO', 'SERVICIO');

-- AlterTable: agregar columna nullable primero
ALTER TABLE "tipo_servicio" ADD COLUMN "categoria_servicio" "CategoriaServicio";

-- Poblar filas existentes
UPDATE "tipo_servicio" SET "categoria_servicio" = 'SERVICIO' WHERE "categoria_servicio" IS NULL;

-- Hacerla obligatoria
ALTER TABLE "tipo_servicio" ALTER COLUMN "categoria_servicio" SET NOT NULL;
