-- Normalizar nombres de roles existentes a mayusculas para que coincidan con el seed actualizado
-- (Administrador -> ADMINISTRADOR)
-- Se excluyen filas que ya estan en mayusculas para no violar el unique (empresa_id, nombre)
UPDATE "rol"
SET "nombre" = 'ADMINISTRADOR'
WHERE "nombre" <> 'ADMINISTRADOR' AND UPPER("nombre") = 'ADMINISTRADOR';
