# Habit Tracker — API

Backend del proyecto Habit Tracker, una aplicación para crear, gestionar y dar seguimiento a hábitos y metas personales.

## Tecnologías

- **NestJS** — framework del backend
- **Prisma** — ORM
- **MongoDB** — base de datos
- **JWT** (`jsonwebtoken`) — autenticación
- **class-validator** — validación de DTOs

## Arquitectura

API REST organizada en módulos: `auth`, `users`, `habits`, `records` y `statistics`. Cada endpoint protegido requiere un token JWT enviado en el header `Authorization: Bearer <token>`, validado por un guard global (`JwtAuthGuard`). Toda entrada de datos pasa por un `ValidationPipe` global que valida los DTOs antes de llegar a los controllers.

## Requisitos previos

- Node.js 
- Una base de datos MongoDB 

## Instalación

1. Clona el repositorio y entra a la carpeta:
```bash
   cd habit-api
```

2. Instala las dependencias:
```bash
   npm install
```

3. Crea un archivo `.env` en la raíz, copiando `.env.example`:
```bash
   cp .env.example .env
```

4. Completa las variables en `.env`:
 Para generar un `JWT_SECRET` seguro:
```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

5. Genera el cliente de Prisma y sincroniza el schema con la base de datos:
```bash
   npx prisma generate
   npx prisma db push
```

## Ejecución

```bash
pnpm run start:dev
```

La API queda disponible en `http://localhost:3000`.

## Módulos principales

| Módulo | Endpoints |
|---|---|
| `auth` | `POST /auth/register`, `POST /auth/login` |
| `users` | `GET /users/me` |
| `habits` | CRUD completo + filtros (`?search=&category=&active=&sort=`) |
| `records` | Registro diario de hábitos (`PUT /records`), historial, progreso |
| `statistics` | `GET /statistics/dashboard`, `/overview`, `/heatmap` |
