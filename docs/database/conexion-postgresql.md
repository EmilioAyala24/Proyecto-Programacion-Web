# Conexion local con PostgreSQL usando Docker

Estos pasos conectan la pagina web con PostgreSQL sin instalar PostgreSQL directamente en la laptop.

## 1. Requisito

Instala y abre Docker Desktop.

## 2. Levantar PostgreSQL

Desde la carpeta del proyecto ejecuta:

```bash
npm run db:up
```

Docker descarga PostgreSQL 16, crea un contenedor llamado `farmacia_inclusiva_postgres` y usa estos datos:

```txt
Host: localhost
Puerto: 5433
Base de datos: farmacia_inclusiva
Usuario: postgres
Contrasena: postgres
```

La primera vez tambien ejecuta automaticamente:

```txt
BaseDeDatos/farmacia_inclusiva.sql
BaseDeDatos/seeds/proveedores.sql
```

## 3. Revisar variables de entorno

El archivo `.env.local` debe tener:

```env
PORT=3001
VITE_API_URL=http://localhost:3001/api
DB_HOST=localhost
DB_PORT=5433
DB_NAME=farmacia_inclusiva
DB_USER=postgres
DB_PASSWORD=postgres
```

## 4. Levantar backend y frontend

En una terminal:

```bash
npm run dev:api
```

En otra terminal:

```bash
npm run dev
```

La pagina queda en:

```txt
http://localhost:5173
```

La API queda en:

```txt
http://localhost:3001/api
```

Para revisar la conexion con PostgreSQL abre:

```txt
http://localhost:3001/api/salud
```

Si responde `baseDatos: "conectada"`, la conexion esta lista.

## Comandos utiles

Apagar la base de datos sin borrar datos:

```bash
npm run db:down
```

Ver logs de PostgreSQL:

```bash
npm run db:logs
```

Insertar o reinsertar datos iniciales sin borrar la base:

```bash
npm run db:seed
```

Reiniciar la base desde cero y volver a ejecutar los SQL iniciales:

```bash
npm run db:reset
```

Usa `db:reset` solo cuando quieras borrar todos los datos locales de Docker.

## Usar HeidiSQL

HeidiSQL puede conectarse al PostgreSQL de Docker con estos datos:

```txt
Tipo de red: PostgreSQL
Host: 127.0.0.1
Puerto: 5433
Usuario: postgres
Contrasena: postgres
Base de datos: farmacia_inclusiva
```
