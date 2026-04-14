# CubitServices Backend

API backend para la gestión de operaciones de CubitServices. El proyecto está construido con `Node.js`, `TypeScript`, `Express`, `Prisma` y `PostgreSQL`.

## Tecnologías

- `Node.js`
- `TypeScript`
- `Express`
- `Prisma ORM`
- `PostgreSQL`
- `Zod`
- `JWT`

## Requisitos

- `Node.js` 20 o superior
- `pnpm`
- `PostgreSQL` disponible local o remoto

## Instalación

1. Instala dependencias:

```bash
pnpm install
```

2. Configura las variables de entorno creando o ajustando el archivo `.env`.

3. Genera el cliente de Prisma:

```bash
pnpm prisma:generate
```

## Variables de entorno

Ejemplo base:

```env
DATABASE_URL="postgresql://postgres:admin@localhost:5432/cubitservicesdb"
JWT_SECRET="cubitservices-dev-secret"
PORT=4000
CLIENT_ORIGIN="http://localhost:3000"
NODE_ENV="development"
AUTH_COOKIE_NAME="access_token"
```

Descripción:

- `DATABASE_URL`: cadena de conexión a PostgreSQL.
- `JWT_SECRET`: secreto usado para firmar y validar tokens JWT.
- `PORT`: puerto en el que corre la API.
- `CLIENT_ORIGIN`: origen permitido por CORS para el frontend.
- `NODE_ENV`: entorno de ejecución. En `production` la cookie se marca como `secure`.
- `AUTH_COOKIE_NAME`: nombre de la cookie donde se guarda el token de acceso.

## Cómo correr el backend

Modo desarrollo:

```bash
pnpm dev
```

Esto levanta el servidor con `tsx watch` usando el archivo `src/server.ts`.

El backend quedará disponible en:

```txt
http://localhost:4000
```

Si cambias `PORT` en `.env`, la URL cambia en consecuencia.

## Scripts disponibles

- `pnpm dev`: inicia el servidor en modo desarrollo.
- `pnpm prisma:generate`: genera el cliente de Prisma.
- `pnpm seed`: ejecuta el seed de Prisma si aplica.
- `pnpm start`: ejecuta `dist/server.js`.

Nota: actualmente el proyecto no tiene un script de `build`, así que para usar `pnpm start` primero debes compilar el proyecto con TypeScript dentro de tu flujo de despliegue.

## Estructura principal

```txt
src/
  app.ts
  server.ts
  config/
  common/
  modules/
prisma/
  schema.prisma
```

## Autenticación

El backend usa autenticación con JWT.

### Login

Endpoint:

```http
POST /auth/login
```

Body:

```json
{
  "email": "usuario@empresa.com",
  "password": "123456"
}
```

Respuesta:

- Devuelve el token en `data.token`.
- También guarda el token en una cookie `HttpOnly`.

### Cookie de autenticación

Después del login, el backend puede autenticar al usuario de dos maneras:

- Por header `Authorization: Bearer <token>`
- Por cookie HTTP con el nombre configurado en `AUTH_COOKIE_NAME`

### Logout

Endpoint:

```http
POST /auth/logout
```

Limpia la cookie de autenticación.

### Sesión actual

Endpoint:

```http
GET /auth/me
```

Devuelve los datos básicos del usuario autenticado, su empresa y su rol.

## CORS y cookies

El backend está configurado con:

- `credentials: true`
- origen controlado por `CLIENT_ORIGIN`

Si el frontend consume esta API desde navegador, debe enviar credenciales:

Con `fetch`:

```ts
fetch("http://localhost:4000/auth/me", {
  method: "GET",
  credentials: "include",
});
```

Con `axios`:

```ts
axios.get("http://localhost:4000/auth/me", {
  withCredentials: true,
});
```

## Endpoints disponibles

### Salud y utilidades

- `GET /health`
- `GET /test-db`

### Auth

- `POST /auth/login`
- `POST /auth/logout`
- `GET /auth/me`

### Roles

- `GET /roles`
- `POST /roles`
- `PATCH /roles/:id`
- `PATCH /roles/:id/estado`

### Usuarios

- `GET /usuarios`
- `POST /usuarios`
- `PATCH /usuarios/:id`
- `PATCH /usuarios/:id/estado`

### Tipos de servicio

- `GET /tipos-servicio`
- `POST /tipos-servicio`
- `PATCH /tipos-servicio/:id`
- `PATCH /tipos-servicio/:id/estado`

### Métodos de pago

- `GET /metodos-pago`
- `POST /metodos-pago`
- `PATCH /metodos-pago/:id`
- `PATCH /metodos-pago/:id/estado`

### Clientes

- `GET /clientes`
- `GET /clientes/:id`
- `POST /clientes`
- `PATCH /clientes/:id`
- `PATCH /clientes/:id/estado`

## Validación y modelo de datos

- Los requests se validan con `Zod`.
- El modelo de datos principal está definido en `prisma/schema.prisma`.
- La entidad de autenticación principal es `Usuario`, relacionada con `Empresa` y `Rol`.

## Base de datos

El proyecto usa Prisma sobre PostgreSQL. El schema se encuentra en:

- [prisma/schema.prisma](./prisma/schema.prisma)

Entidades principales:

- `Empresa`
- `Rol`
- `Usuario`
- `Cliente`
- `TipoServicio`
- `MetodoPago`
- `CuentaServicio`
- `OrdenServicio`
- `Cargo`
- `Pago`
- `Historial`

## Desarrollo

Puntos importantes del proyecto:

- `src/app.ts` configura middlewares, CORS y rutas.
- `src/server.ts` levanta el servidor HTTP.
- `src/modules/auth` contiene login, logout y sesión.
- `src/common/middleware/auth.middleware.ts` protege rutas autenticadas.

## Estado actual

El backend ya soporta:

- autenticación con JWT
- autenticación por cookie `HttpOnly`
- CORS con credenciales
- separación modular por dominio

