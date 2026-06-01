/*
  Warnings:

  - The `avenida` column on the `cliente_ubicacion` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `calle` column on the `cliente_ubicacion` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "cliente_ubicacion" DROP COLUMN "avenida",
ADD COLUMN     "avenida" INTEGER,
DROP COLUMN "calle",
ADD COLUMN     "calle" INTEGER;
