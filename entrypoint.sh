#!/bin/sh
set -e

echo "⏳ Esperando a que PostgreSQL esté listo..."
until npx prisma db execute --stdin <<< "SELECT 1" 2>/dev/null; do
  sleep 2
done

echo "✅ PostgreSQL listo. Ejecutando migraciones..."
npx prisma migrate deploy

echo "🌱 Ejecutando seed (idempotente, siempre seguro)..."
pnpm prisma db seed

echo "🚀 Iniciando aplicación..."
exec pnpm start