#!/bin/sh
set -e

echo "⏳ Esperando a que PostgreSQL esté listo..."
until node -e "
const net = require('net');
const s = net.createConnection(5432, 'db');
s.on('connect', () => { s.destroy(); process.exit(0); });
s.on('error', () => { s.destroy(); process.exit(1); });
" 2>/dev/null; do
  sleep 2
done

echo "✅ PostgreSQL listo. Ejecutando migraciones..."
npx prisma migrate deploy

echo "🌱 Ejecutando seed (idempotente, siempre seguro)..."
pnpm prisma db seed

echo "🚀 Iniciando aplicación..."
exec pnpm start