ALTER TABLE "cuenta_servicio"
ALTER COLUMN "observaciones" TYPE JSONB
USING CASE
WHEN "observaciones" IS NULL THEN '[]'::jsonb
ELSE jsonb_build_array(
    jsonb_build_object(
    'texto', "observaciones",
    'fecha', now(),
    'estado', 'MIGRACIÓN'
    )
)
END;

ALTER TABLE "cuenta_servicio"
ALTER COLUMN "observaciones" SET DEFAULT '[]'::jsonb;