import { PrismaClient, EstadoRegistroBasico, EstadoUsuario } from "@prisma/client";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  const empresa = await prisma.empresa.upsert({
    where: {
      id: "11111111-1111-1111-1111-111111111111",
    },
    update: {},
    create: {
      id: "11111111-1111-1111-1111-111111111111",
      nombre: "Cubitservices Demo",
      nit: "CF",
      telefono: "00000000",
      direccion: "Guatemala",
      estado: EstadoRegistroBasico.ACTIVO,
    },
  });

  const rolAdmin = await prisma.rol.upsert({
    where: {
      empresaId_nombre: {
        empresaId: empresa.id,
        nombre: "Administrador",
      },
    },
    update: {},
    create: {
      empresaId: empresa.id,
      nombre: "Administrador",
      descripcion: "Rol administrador inicial del sistema",
      estado: EstadoRegistroBasico.ACTIVO,
    },
  });

  const passwordHash = await bcrypt.hash("Admin123*", 10);

  await prisma.usuario.upsert({
    where: {
      empresaId_email: {
        empresaId: empresa.id,
        email: "admin@cubitservices.com",
      },
    },
    update: {},
    create: {
      empresaId: empresa.id,
      rolId: rolAdmin.id,
      nombres: "Admin",
      apellidos: "Sistema",
      email: "admin@cubitservices.com",
      passwordHash,
      telefono: "00000000",
      estado: EstadoUsuario.ACTIVO,
    },
  });

  console.log("Seed ejecutado correctamente");
  console.log({
    empresa: empresa.nombre,
    rol: rolAdmin.nombre,
    usuario: "admin@cubitservices.com",
    password: "Admin123*",
  });
}

main()
  .catch((error) => {
    console.error("Error ejecutando seed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });