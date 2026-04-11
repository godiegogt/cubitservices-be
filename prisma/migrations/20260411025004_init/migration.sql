-- CreateEnum
CREATE TYPE "EstadoRegistroBasico" AS ENUM ('ACTIVO', 'INACTIVO');

-- CreateEnum
CREATE TYPE "EstadoUsuario" AS ENUM ('ACTIVO', 'INACTIVO', 'BLOQUEADO');

-- CreateEnum
CREATE TYPE "TipoCliente" AS ENUM ('INDIVIDUAL', 'EMPRESA');

-- CreateEnum
CREATE TYPE "EstadoUbicacion" AS ENUM ('ACTIVA', 'INACTIVA');

-- CreateEnum
CREATE TYPE "EstadoArchivo" AS ENUM ('ACTIVO', 'OCULTO', 'ANULADO');

-- CreateEnum
CREATE TYPE "ModalidadServicio" AS ENUM ('PUNTUAL', 'RECURRENTE');

-- CreateEnum
CREATE TYPE "FrecuenciaServicio" AS ENUM ('SEMANAL', 'QUINCENAL', 'MENSUAL', 'BIMESTRAL', 'TRIMESTRAL', 'SEMESTRAL', 'ANUAL');

-- CreateEnum
CREATE TYPE "EstadoCuentaServicio" AS ENUM ('ACTIVA', 'SUSPENDIDA', 'FINALIZADA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "TipoVencimiento" AS ENUM ('FIN_MES', 'FECHA_FIJA', 'DIAS_DESPUES');

-- CreateEnum
CREATE TYPE "TipoMora" AS ENUM ('FIJA', 'DIARIA', 'PORCENTAJE');

-- CreateEnum
CREATE TYPE "OrigenOrden" AS ENUM ('PROGRAMADA', 'MANUAL', 'INCIDENCIA');

-- CreateEnum
CREATE TYPE "PrioridadOrden" AS ENUM ('BAJA', 'MEDIA', 'ALTA', 'URGENTE');

-- CreateEnum
CREATE TYPE "EstadoOrdenServicio" AS ENUM ('PENDIENTE', 'PROGRAMADA', 'EN_PROCESO', 'PAUSADA', 'FINALIZADA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "EstadoAsignacionOrden" AS ENUM ('ACTIVA', 'REMOVIDA', 'FINALIZADA');

-- CreateEnum
CREATE TYPE "TipoEventoOrden" AS ENUM ('COMENTARIO', 'VISITA', 'LLAMADA', 'INCIDENTE', 'NOTA_TECNICA', 'CIERRE');

-- CreateEnum
CREATE TYPE "TipoCargo" AS ENUM ('SERVICIO', 'MORA', 'AJUSTE', 'EXTRAORDINARIO');

-- CreateEnum
CREATE TYPE "EstadoCargo" AS ENUM ('PENDIENTE', 'PARCIAL', 'PAGADO', 'VENCIDO', 'ANULADO');

-- CreateEnum
CREATE TYPE "EstadoMora" AS ENUM ('ACTIVA', 'APLICADA', 'ANULADA');

-- CreateEnum
CREATE TYPE "EstadoPago" AS ENUM ('REGISTRADO', 'CONFIRMADO', 'ANULADO');

-- CreateEnum
CREATE TYPE "ModuloHistorial" AS ENUM ('EMPRESAS', 'ROLES', 'USUARIOS', 'CLIENTES', 'UBICACIONES', 'CUENTAS_SERVICIO', 'ORDENES', 'CARGOS', 'MORAS', 'PAGOS', 'ARCHIVOS', 'CONFIGURACION');

-- CreateEnum
CREATE TYPE "AccionHistorial" AS ENUM ('CREAR', 'EDITAR', 'CAMBIAR_ESTADO', 'REGISTRAR_PAGO', 'APLICAR_PAGO', 'ANULAR', 'ASIGNAR', 'REMOVER', 'SUBIR_ARCHIVO', 'CALCULAR_MORA', 'EMITIR_CARGO');

-- CreateTable
CREATE TABLE "empresa" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "nombre" VARCHAR(150) NOT NULL,
    "nit" VARCHAR(30),
    "telefono" VARCHAR(30),
    "direccion" TEXT,
    "estado" "EstadoRegistroBasico" NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "empresa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rol" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "empresa_id" UUID NOT NULL,
    "nombre" VARCHAR(80) NOT NULL,
    "descripcion" TEXT,
    "estado" "EstadoRegistroBasico" NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "rol_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuario" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "empresa_id" UUID NOT NULL,
    "rol_id" UUID NOT NULL,
    "nombres" VARCHAR(120) NOT NULL,
    "apellidos" VARCHAR(120),
    "email" VARCHAR(180) NOT NULL,
    "password_hash" TEXT NOT NULL,
    "telefono" VARCHAR(30),
    "estado" "EstadoUsuario" NOT NULL,
    "ultimo_acceso" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cliente" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "empresa_id" UUID NOT NULL,
    "codigo" VARCHAR(50) NOT NULL,
    "tipo_cliente" "TipoCliente" NOT NULL,
    "nombre_razon_social" VARCHAR(180) NOT NULL,
    "nombre_comercial" VARCHAR(180),
    "identificacion" VARCHAR(60),
    "telefono" VARCHAR(30),
    "email" VARCHAR(180),
    "estado" "EstadoRegistroBasico" NOT NULL,
    "observaciones" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "cliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cliente_ubicacion" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "cliente_id" UUID NOT NULL,
    "nombre" VARCHAR(120) NOT NULL,
    "direccion" TEXT NOT NULL,
    "referencia" TEXT,
    "latitud" DECIMAL(10,7),
    "longitud" DECIMAL(10,7),
    "es_principal" BOOLEAN NOT NULL DEFAULT false,
    "estado" "EstadoUbicacion" NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "cliente_ubicacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cliente_archivo" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "cliente_id" UUID NOT NULL,
    "subido_por" UUID NOT NULL,
    "nombre" VARCHAR(255) NOT NULL,
    "categoria" VARCHAR(50) NOT NULL,
    "mime_type" VARCHAR(120) NOT NULL,
    "extension" VARCHAR(20),
    "tamano_bytes" INTEGER,
    "storage_key" TEXT NOT NULL,
    "url" TEXT,
    "estado" "EstadoArchivo" NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "cliente_archivo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tipo_servicio" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "empresa_id" UUID NOT NULL,
    "nombre" VARCHAR(120) NOT NULL,
    "descripcion" TEXT,
    "precio_base" DECIMAL(12,2) NOT NULL,
    "estado" "EstadoRegistroBasico" NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "tipo_servicio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "politica_cobro" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "empresa_id" UUID NOT NULL,
    "nombre" VARCHAR(120) NOT NULL,
    "tipo_vencimiento" "TipoVencimiento" NOT NULL,
    "dia_corte" INTEGER,
    "dia_vencimiento" INTEGER,
    "dias_gracia" INTEGER NOT NULL,
    "tipo_mora" "TipoMora",
    "valor_mora" DECIMAL(12,2),
    "aplica_mora" BOOLEAN NOT NULL DEFAULT false,
    "estado" "EstadoRegistroBasico" NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "politica_cobro_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cuenta_servicio" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "empresa_id" UUID NOT NULL,
    "cliente_id" UUID NOT NULL,
    "ubicacion_id" UUID,
    "tipo_servicio_id" UUID NOT NULL,
    "politica_cobro_id" UUID,
    "codigo" VARCHAR(50) NOT NULL,
    "nombre" VARCHAR(180) NOT NULL,
    "descripcion" TEXT,
    "modalidad" "ModalidadServicio" NOT NULL,
    "frecuencia" "FrecuenciaServicio",
    "fecha_inicio" DATE,
    "fecha_fin" DATE,
    "monto_base" DECIMAL(12,2) NOT NULL,
    "dia_corte" INTEGER,
    "dia_pago" INTEGER,
    "estado" "EstadoCuentaServicio" NOT NULL,
    "observaciones" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "cuenta_servicio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cuenta_servicio_archivo" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "cuenta_servicio_id" UUID NOT NULL,
    "subido_por" UUID NOT NULL,
    "nombre" VARCHAR(255) NOT NULL,
    "categoria" VARCHAR(50) NOT NULL,
    "mime_type" VARCHAR(120) NOT NULL,
    "extension" VARCHAR(20),
    "tamano_bytes" INTEGER,
    "storage_key" TEXT NOT NULL,
    "url" TEXT,
    "estado" "EstadoArchivo" NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "cuenta_servicio_archivo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orden_servicio" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "empresa_id" UUID NOT NULL,
    "cuenta_servicio_id" UUID NOT NULL,
    "cliente_id" UUID NOT NULL,
    "ubicacion_id" UUID NOT NULL,
    "tipo_servicio_id" UUID NOT NULL,
    "numero_orden" VARCHAR(50) NOT NULL,
    "titulo" VARCHAR(180) NOT NULL,
    "descripcion" TEXT,
    "origen" "OrigenOrden" NOT NULL,
    "prioridad" "PrioridadOrden" NOT NULL,
    "estado" "EstadoOrdenServicio" NOT NULL,
    "fecha_programada" TIMESTAMPTZ(6),
    "fecha_inicio" TIMESTAMPTZ(6),
    "fecha_cierre" TIMESTAMPTZ(6),
    "requiere_evidencia_final" BOOLEAN NOT NULL DEFAULT false,
    "motivo_cancelacion" TEXT,
    "observaciones_generales" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "orden_servicio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orden_servicio_asignacion" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "orden_servicio_id" UUID NOT NULL,
    "usuario_id" UUID NOT NULL,
    "rol_en_orden" VARCHAR(50) NOT NULL,
    "estado" "EstadoAsignacionOrden" NOT NULL,
    "asignado_por" UUID NOT NULL,
    "fecha_asignacion" TIMESTAMPTZ(6) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "orden_servicio_asignacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orden_servicio_evento" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "orden_servicio_id" UUID NOT NULL,
    "usuario_id" UUID NOT NULL,
    "tipo_evento" "TipoEventoOrden" NOT NULL,
    "titulo" VARCHAR(180),
    "detalle" TEXT NOT NULL,
    "visible_cliente" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "orden_servicio_evento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orden_servicio_archivo" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "orden_servicio_id" UUID NOT NULL,
    "usuario_id" UUID NOT NULL,
    "nombre" VARCHAR(255) NOT NULL,
    "categoria" VARCHAR(50) NOT NULL,
    "mime_type" VARCHAR(120) NOT NULL,
    "extension" VARCHAR(20),
    "tamano_bytes" INTEGER,
    "storage_key" TEXT NOT NULL,
    "url" TEXT,
    "estado" "EstadoArchivo" NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "orden_servicio_archivo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orden_servicio_estado" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "orden_servicio_id" UUID NOT NULL,
    "estado_anterior" "EstadoOrdenServicio",
    "estado_nuevo" "EstadoOrdenServicio" NOT NULL,
    "motivo" TEXT,
    "usuario_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "orden_servicio_estado_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "metodo_pago" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "empresa_id" UUID NOT NULL,
    "nombre" VARCHAR(80) NOT NULL,
    "descripcion" TEXT,
    "estado" "EstadoRegistroBasico" NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "metodo_pago_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cargo" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "empresa_id" UUID NOT NULL,
    "cliente_id" UUID NOT NULL,
    "cuenta_servicio_id" UUID NOT NULL,
    "orden_servicio_id" UUID,
    "politica_cobro_id" UUID,
    "cargo_origen_id" UUID,
    "tipo_cargo" "TipoCargo" NOT NULL,
    "concepto" VARCHAR(255) NOT NULL,
    "periodo_referencia" VARCHAR(50),
    "monto" DECIMAL(12,2) NOT NULL,
    "saldo" DECIMAL(12,2) NOT NULL,
    "fecha_emision" DATE NOT NULL,
    "fecha_vencimiento" DATE,
    "dias_gracia_aplicados" INTEGER,
    "tipo_mora_aplicada" "TipoMora",
    "valor_mora_aplicado" DECIMAL(12,2),
    "fecha_ultima_mora_calculada" DATE,
    "estado" "EstadoCargo" NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "cargo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mora" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "empresa_id" UUID NOT NULL,
    "cargo_id" UUID NOT NULL,
    "cargo_mora_id" UUID,
    "tipo_mora" "TipoMora" NOT NULL,
    "valor_base" DECIMAL(12,2) NOT NULL,
    "dias_atraso" INTEGER NOT NULL,
    "monto_generado" DECIMAL(12,2) NOT NULL,
    "fecha_calculo" DATE NOT NULL,
    "estado" "EstadoMora" NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "mora_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pago" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "empresa_id" UUID NOT NULL,
    "cliente_id" UUID NOT NULL,
    "metodo_pago_id" UUID NOT NULL,
    "registrado_por" UUID NOT NULL,
    "monto_total" DECIMAL(12,2) NOT NULL,
    "referencia" VARCHAR(120),
    "fecha_pago" DATE NOT NULL,
    "fecha_registro" TIMESTAMPTZ(6) NOT NULL,
    "estado" "EstadoPago" NOT NULL,
    "observaciones" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "pago_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aplicacion_pago" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "pago_id" UUID NOT NULL,
    "cargo_id" UUID NOT NULL,
    "monto_aplicado" DECIMAL(12,2) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "aplicacion_pago_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "historial" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "empresa_id" UUID NOT NULL,
    "usuario_id" UUID NOT NULL,
    "modulo" "ModuloHistorial" NOT NULL,
    "accion" "AccionHistorial" NOT NULL,
    "entidad" VARCHAR(50) NOT NULL,
    "entidad_id" UUID NOT NULL,
    "detalle" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "historial_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "rol_empresa_id_idx" ON "rol"("empresa_id");

-- CreateIndex
CREATE UNIQUE INDEX "rol_empresa_id_nombre_key" ON "rol"("empresa_id", "nombre");

-- CreateIndex
CREATE INDEX "usuario_empresa_id_idx" ON "usuario"("empresa_id");

-- CreateIndex
CREATE INDEX "usuario_rol_id_idx" ON "usuario"("rol_id");

-- CreateIndex
CREATE UNIQUE INDEX "usuario_empresa_id_email_key" ON "usuario"("empresa_id", "email");

-- CreateIndex
CREATE INDEX "cliente_empresa_id_idx" ON "cliente"("empresa_id");

-- CreateIndex
CREATE INDEX "cliente_nombre_razon_social_idx" ON "cliente"("nombre_razon_social");

-- CreateIndex
CREATE INDEX "cliente_telefono_idx" ON "cliente"("telefono");

-- CreateIndex
CREATE UNIQUE INDEX "cliente_empresa_id_codigo_key" ON "cliente"("empresa_id", "codigo");

-- CreateIndex
CREATE INDEX "cliente_ubicacion_cliente_id_idx" ON "cliente_ubicacion"("cliente_id");

-- CreateIndex
CREATE INDEX "cliente_ubicacion_cliente_id_es_principal_idx" ON "cliente_ubicacion"("cliente_id", "es_principal");

-- CreateIndex
CREATE INDEX "cliente_archivo_cliente_id_idx" ON "cliente_archivo"("cliente_id");

-- CreateIndex
CREATE INDEX "cliente_archivo_subido_por_idx" ON "cliente_archivo"("subido_por");

-- CreateIndex
CREATE INDEX "tipo_servicio_empresa_id_idx" ON "tipo_servicio"("empresa_id");

-- CreateIndex
CREATE UNIQUE INDEX "tipo_servicio_empresa_id_nombre_key" ON "tipo_servicio"("empresa_id", "nombre");

-- CreateIndex
CREATE INDEX "politica_cobro_empresa_id_idx" ON "politica_cobro"("empresa_id");

-- CreateIndex
CREATE UNIQUE INDEX "politica_cobro_empresa_id_nombre_key" ON "politica_cobro"("empresa_id", "nombre");

-- CreateIndex
CREATE INDEX "cuenta_servicio_empresa_id_idx" ON "cuenta_servicio"("empresa_id");

-- CreateIndex
CREATE INDEX "cuenta_servicio_cliente_id_idx" ON "cuenta_servicio"("cliente_id");

-- CreateIndex
CREATE INDEX "cuenta_servicio_ubicacion_id_idx" ON "cuenta_servicio"("ubicacion_id");

-- CreateIndex
CREATE INDEX "cuenta_servicio_tipo_servicio_id_idx" ON "cuenta_servicio"("tipo_servicio_id");

-- CreateIndex
CREATE INDEX "cuenta_servicio_politica_cobro_id_idx" ON "cuenta_servicio"("politica_cobro_id");

-- CreateIndex
CREATE UNIQUE INDEX "cuenta_servicio_empresa_id_codigo_key" ON "cuenta_servicio"("empresa_id", "codigo");

-- CreateIndex
CREATE INDEX "cuenta_servicio_archivo_cuenta_servicio_id_idx" ON "cuenta_servicio_archivo"("cuenta_servicio_id");

-- CreateIndex
CREATE INDEX "cuenta_servicio_archivo_subido_por_idx" ON "cuenta_servicio_archivo"("subido_por");

-- CreateIndex
CREATE INDEX "orden_servicio_empresa_id_idx" ON "orden_servicio"("empresa_id");

-- CreateIndex
CREATE INDEX "orden_servicio_cuenta_servicio_id_idx" ON "orden_servicio"("cuenta_servicio_id");

-- CreateIndex
CREATE INDEX "orden_servicio_cliente_id_idx" ON "orden_servicio"("cliente_id");

-- CreateIndex
CREATE INDEX "orden_servicio_ubicacion_id_idx" ON "orden_servicio"("ubicacion_id");

-- CreateIndex
CREATE INDEX "orden_servicio_tipo_servicio_id_idx" ON "orden_servicio"("tipo_servicio_id");

-- CreateIndex
CREATE INDEX "orden_servicio_estado_idx" ON "orden_servicio"("estado");

-- CreateIndex
CREATE UNIQUE INDEX "orden_servicio_empresa_id_numero_orden_key" ON "orden_servicio"("empresa_id", "numero_orden");

-- CreateIndex
CREATE INDEX "orden_servicio_asignacion_orden_servicio_id_idx" ON "orden_servicio_asignacion"("orden_servicio_id");

-- CreateIndex
CREATE INDEX "orden_servicio_asignacion_usuario_id_idx" ON "orden_servicio_asignacion"("usuario_id");

-- CreateIndex
CREATE INDEX "orden_servicio_asignacion_asignado_por_idx" ON "orden_servicio_asignacion"("asignado_por");

-- CreateIndex
CREATE INDEX "orden_servicio_asignacion_orden_servicio_id_estado_idx" ON "orden_servicio_asignacion"("orden_servicio_id", "estado");

-- CreateIndex
CREATE INDEX "orden_servicio_evento_orden_servicio_id_idx" ON "orden_servicio_evento"("orden_servicio_id");

-- CreateIndex
CREATE INDEX "orden_servicio_evento_usuario_id_idx" ON "orden_servicio_evento"("usuario_id");

-- CreateIndex
CREATE INDEX "orden_servicio_evento_tipo_evento_idx" ON "orden_servicio_evento"("tipo_evento");

-- CreateIndex
CREATE INDEX "orden_servicio_archivo_orden_servicio_id_idx" ON "orden_servicio_archivo"("orden_servicio_id");

-- CreateIndex
CREATE INDEX "orden_servicio_archivo_usuario_id_idx" ON "orden_servicio_archivo"("usuario_id");

-- CreateIndex
CREATE INDEX "orden_servicio_estado_orden_servicio_id_idx" ON "orden_servicio_estado"("orden_servicio_id");

-- CreateIndex
CREATE INDEX "orden_servicio_estado_usuario_id_idx" ON "orden_servicio_estado"("usuario_id");

-- CreateIndex
CREATE INDEX "orden_servicio_estado_estado_nuevo_idx" ON "orden_servicio_estado"("estado_nuevo");

-- CreateIndex
CREATE INDEX "metodo_pago_empresa_id_idx" ON "metodo_pago"("empresa_id");

-- CreateIndex
CREATE UNIQUE INDEX "metodo_pago_empresa_id_nombre_key" ON "metodo_pago"("empresa_id", "nombre");

-- CreateIndex
CREATE INDEX "cargo_empresa_id_idx" ON "cargo"("empresa_id");

-- CreateIndex
CREATE INDEX "cargo_cliente_id_idx" ON "cargo"("cliente_id");

-- CreateIndex
CREATE INDEX "cargo_cuenta_servicio_id_idx" ON "cargo"("cuenta_servicio_id");

-- CreateIndex
CREATE INDEX "cargo_orden_servicio_id_idx" ON "cargo"("orden_servicio_id");

-- CreateIndex
CREATE INDEX "cargo_politica_cobro_id_idx" ON "cargo"("politica_cobro_id");

-- CreateIndex
CREATE INDEX "cargo_cargo_origen_id_idx" ON "cargo"("cargo_origen_id");

-- CreateIndex
CREATE INDEX "cargo_estado_idx" ON "cargo"("estado");

-- CreateIndex
CREATE INDEX "cargo_tipo_cargo_idx" ON "cargo"("tipo_cargo");

-- CreateIndex
CREATE INDEX "cargo_fecha_vencimiento_idx" ON "cargo"("fecha_vencimiento");

-- CreateIndex
CREATE INDEX "cargo_cliente_id_estado_idx" ON "cargo"("cliente_id", "estado");

-- CreateIndex
CREATE INDEX "cargo_cuenta_servicio_id_periodo_referencia_idx" ON "cargo"("cuenta_servicio_id", "periodo_referencia");

-- CreateIndex
CREATE INDEX "mora_empresa_id_idx" ON "mora"("empresa_id");

-- CreateIndex
CREATE INDEX "mora_cargo_id_idx" ON "mora"("cargo_id");

-- CreateIndex
CREATE INDEX "mora_cargo_mora_id_idx" ON "mora"("cargo_mora_id");

-- CreateIndex
CREATE INDEX "mora_fecha_calculo_idx" ON "mora"("fecha_calculo");

-- CreateIndex
CREATE INDEX "mora_estado_idx" ON "mora"("estado");

-- CreateIndex
CREATE INDEX "pago_empresa_id_idx" ON "pago"("empresa_id");

-- CreateIndex
CREATE INDEX "pago_cliente_id_idx" ON "pago"("cliente_id");

-- CreateIndex
CREATE INDEX "pago_metodo_pago_id_idx" ON "pago"("metodo_pago_id");

-- CreateIndex
CREATE INDEX "pago_registrado_por_idx" ON "pago"("registrado_por");

-- CreateIndex
CREATE INDEX "pago_estado_idx" ON "pago"("estado");

-- CreateIndex
CREATE INDEX "pago_fecha_pago_idx" ON "pago"("fecha_pago");

-- CreateIndex
CREATE INDEX "aplicacion_pago_pago_id_idx" ON "aplicacion_pago"("pago_id");

-- CreateIndex
CREATE INDEX "aplicacion_pago_cargo_id_idx" ON "aplicacion_pago"("cargo_id");

-- CreateIndex
CREATE UNIQUE INDEX "aplicacion_pago_pago_id_cargo_id_key" ON "aplicacion_pago"("pago_id", "cargo_id");

-- CreateIndex
CREATE INDEX "historial_empresa_id_idx" ON "historial"("empresa_id");

-- CreateIndex
CREATE INDEX "historial_usuario_id_idx" ON "historial"("usuario_id");

-- CreateIndex
CREATE INDEX "historial_entidad_entidad_id_idx" ON "historial"("entidad", "entidad_id");

-- CreateIndex
CREATE INDEX "historial_modulo_accion_idx" ON "historial"("modulo", "accion");

-- AddForeignKey
ALTER TABLE "rol" ADD CONSTRAINT "rol_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuario" ADD CONSTRAINT "usuario_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuario" ADD CONSTRAINT "usuario_rol_id_fkey" FOREIGN KEY ("rol_id") REFERENCES "rol"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cliente" ADD CONSTRAINT "cliente_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cliente_ubicacion" ADD CONSTRAINT "cliente_ubicacion_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cliente_archivo" ADD CONSTRAINT "cliente_archivo_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cliente_archivo" ADD CONSTRAINT "cliente_archivo_subido_por_fkey" FOREIGN KEY ("subido_por") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tipo_servicio" ADD CONSTRAINT "tipo_servicio_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "politica_cobro" ADD CONSTRAINT "politica_cobro_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cuenta_servicio" ADD CONSTRAINT "cuenta_servicio_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cuenta_servicio" ADD CONSTRAINT "cuenta_servicio_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cuenta_servicio" ADD CONSTRAINT "cuenta_servicio_ubicacion_id_fkey" FOREIGN KEY ("ubicacion_id") REFERENCES "cliente_ubicacion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cuenta_servicio" ADD CONSTRAINT "cuenta_servicio_tipo_servicio_id_fkey" FOREIGN KEY ("tipo_servicio_id") REFERENCES "tipo_servicio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cuenta_servicio" ADD CONSTRAINT "cuenta_servicio_politica_cobro_id_fkey" FOREIGN KEY ("politica_cobro_id") REFERENCES "politica_cobro"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cuenta_servicio_archivo" ADD CONSTRAINT "cuenta_servicio_archivo_cuenta_servicio_id_fkey" FOREIGN KEY ("cuenta_servicio_id") REFERENCES "cuenta_servicio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cuenta_servicio_archivo" ADD CONSTRAINT "cuenta_servicio_archivo_subido_por_fkey" FOREIGN KEY ("subido_por") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orden_servicio" ADD CONSTRAINT "orden_servicio_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orden_servicio" ADD CONSTRAINT "orden_servicio_cuenta_servicio_id_fkey" FOREIGN KEY ("cuenta_servicio_id") REFERENCES "cuenta_servicio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orden_servicio" ADD CONSTRAINT "orden_servicio_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orden_servicio" ADD CONSTRAINT "orden_servicio_ubicacion_id_fkey" FOREIGN KEY ("ubicacion_id") REFERENCES "cliente_ubicacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orden_servicio" ADD CONSTRAINT "orden_servicio_tipo_servicio_id_fkey" FOREIGN KEY ("tipo_servicio_id") REFERENCES "tipo_servicio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orden_servicio_asignacion" ADD CONSTRAINT "orden_servicio_asignacion_orden_servicio_id_fkey" FOREIGN KEY ("orden_servicio_id") REFERENCES "orden_servicio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orden_servicio_asignacion" ADD CONSTRAINT "orden_servicio_asignacion_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orden_servicio_asignacion" ADD CONSTRAINT "orden_servicio_asignacion_asignado_por_fkey" FOREIGN KEY ("asignado_por") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orden_servicio_evento" ADD CONSTRAINT "orden_servicio_evento_orden_servicio_id_fkey" FOREIGN KEY ("orden_servicio_id") REFERENCES "orden_servicio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orden_servicio_evento" ADD CONSTRAINT "orden_servicio_evento_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orden_servicio_archivo" ADD CONSTRAINT "orden_servicio_archivo_orden_servicio_id_fkey" FOREIGN KEY ("orden_servicio_id") REFERENCES "orden_servicio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orden_servicio_archivo" ADD CONSTRAINT "orden_servicio_archivo_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orden_servicio_estado" ADD CONSTRAINT "orden_servicio_estado_orden_servicio_id_fkey" FOREIGN KEY ("orden_servicio_id") REFERENCES "orden_servicio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orden_servicio_estado" ADD CONSTRAINT "orden_servicio_estado_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "metodo_pago" ADD CONSTRAINT "metodo_pago_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cargo" ADD CONSTRAINT "cargo_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cargo" ADD CONSTRAINT "cargo_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cargo" ADD CONSTRAINT "cargo_cuenta_servicio_id_fkey" FOREIGN KEY ("cuenta_servicio_id") REFERENCES "cuenta_servicio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cargo" ADD CONSTRAINT "cargo_orden_servicio_id_fkey" FOREIGN KEY ("orden_servicio_id") REFERENCES "orden_servicio"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cargo" ADD CONSTRAINT "cargo_politica_cobro_id_fkey" FOREIGN KEY ("politica_cobro_id") REFERENCES "politica_cobro"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cargo" ADD CONSTRAINT "cargo_cargo_origen_id_fkey" FOREIGN KEY ("cargo_origen_id") REFERENCES "cargo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mora" ADD CONSTRAINT "mora_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mora" ADD CONSTRAINT "mora_cargo_id_fkey" FOREIGN KEY ("cargo_id") REFERENCES "cargo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mora" ADD CONSTRAINT "mora_cargo_mora_id_fkey" FOREIGN KEY ("cargo_mora_id") REFERENCES "cargo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pago" ADD CONSTRAINT "pago_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pago" ADD CONSTRAINT "pago_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pago" ADD CONSTRAINT "pago_metodo_pago_id_fkey" FOREIGN KEY ("metodo_pago_id") REFERENCES "metodo_pago"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pago" ADD CONSTRAINT "pago_registrado_por_fkey" FOREIGN KEY ("registrado_por") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aplicacion_pago" ADD CONSTRAINT "aplicacion_pago_pago_id_fkey" FOREIGN KEY ("pago_id") REFERENCES "pago"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aplicacion_pago" ADD CONSTRAINT "aplicacion_pago_cargo_id_fkey" FOREIGN KEY ("cargo_id") REFERENCES "cargo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historial" ADD CONSTRAINT "historial_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historial" ADD CONSTRAINT "historial_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
