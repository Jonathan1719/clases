# Nexo - frontend

Aplicación Angular para administrar usuarios y categorías mediante el API de
NestJS. Angular no accede directamente a PostgreSQL.

## Requisitos

- Node.js compatible con Angular CLI 20
- Backend NestJS iniciado en `http://localhost:3000`
- PostgreSQL configurado y migraciones aplicadas desde la raíz del proyecto

## Iniciar

```bash
npm install
npm start
```

Abre `http://localhost:4200`. Durante el desarrollo, `proxy.conf.json` reenvía
las solicitudes de `/auth`, `/users` y `/categoria` a `http://localhost:3000`
para evitar problemas de CORS.

## Funcionalidades

- Registro e inicio de sesión con JWT.
- Panel con resumen de usuarios y categorías.
- Crear, editar y eliminar usuarios y categorías.
- Las solicitudes protegidas envían automáticamente el token de sesión.
