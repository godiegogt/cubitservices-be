/*
  Warnings:

  - The `observaciones` column on the `cuenta_servicio` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "cuenta_servicio" DROP COLUMN "observaciones",
ADD COLUMN     "observaciones" JSONB DEFAULT '[]';
