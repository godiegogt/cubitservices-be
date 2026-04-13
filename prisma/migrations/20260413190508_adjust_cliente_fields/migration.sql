-- CreateEnum
CREATE TYPE "TipoIdentificacion" AS ENUM ('DPI', 'NIT', 'PASAPORTE', 'OTRO');

-- AlterTable
ALTER TABLE "cliente" ADD COLUMN     "direccion_fiscal" TEXT,
ADD COLUMN     "primer_apellido" VARCHAR(80),
ADD COLUMN     "primer_nombre" VARCHAR(80),
ADD COLUMN     "segundo_apellido" VARCHAR(80),
ADD COLUMN     "segundo_nombre" VARCHAR(80),
ADD COLUMN     "tipo_identificacion" "TipoIdentificacion";
