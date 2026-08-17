/*
  Warnings:

  - You are about to drop the column `nit` on the `cliente` table. All the data in the column will be lost.
  - You are about to drop the column `aldea` on the `cliente_ubicacion` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "cliente" DROP COLUMN "nit";

-- AlterTable
ALTER TABLE "cliente_ubicacion" DROP COLUMN "aldea";
