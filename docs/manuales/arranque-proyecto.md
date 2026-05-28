# Manual de arranque desde cero

Este manual sirve para apagar y encender el proyecto completo desde consola en Windows PowerShell.

## 1. Entrar a la carpeta del proyecto

```powershell
cd C:\Users\Colibecas\Downloads\Proyecto-Programacion-Web
```

## 2. Revisar el archivo `.env.local`

```env
VITE_API_URL=http://localhost:3001/api

PORT=3001
DB_HOST=localhost
DB_PORT=5433
DB_NAME=farmacia_inclusiva
DB_USER=postgres
DB_PASSWORD=postgres
```

## 3. Encender PostgreSQL

```powershell
docker compose up -d postgres
```

Verificar que el contenedor este arriba:

```powershell
docker compose ps
```

Ver logs de PostgreSQL si algo falla:

```powershell
docker compose logs -f postgres
```

## 4. Instalar dependencias si hace falta

Solo se hace la primera vez o si borraron `node_modules`:

```powershell
npm install
```

## 5. Encender backend y frontend

Este proyecto usa dos terminales durante desarrollo.

Terminal 1, backend/API:

```powershell
npm run dev:api
```

La API queda en:

```txt
http://localhost:3001/api/salud
```

Terminal 2, frontend React/Vite:

```powershell
npm run dev
```

La aplicacion queda en:

```txt
http://localhost:5173
```

El frontend consume la API en `http://localhost:3001/api`.

## 6. Apagar todo

Cerrar el servidor Node/Vite si esta en primer plano:

```txt
Ctrl + C
```

Si quedo corriendo en segundo plano, buscar procesos en los puertos:

```powershell
netstat -ano | Select-String ':5173|:3001|:5433'
```

Cerrar Node por ID de proceso:

```powershell
Stop-Process -Id ID_DEL_PROCESO -Force
```

Apagar PostgreSQL:

```powershell
docker compose down
```

## 7. Reinicio completo recomendado

```powershell
cd C:\Users\Colibecas\Downloads\Proyecto-Programacion-Web
docker compose up -d postgres
npm run dev:api
```

En otra terminal:

```powershell
cd C:\Users\Colibecas\Downloads\Proyecto-Programacion-Web
npm run dev
```

## 8. Resetear base de datos

Esto borra los datos actuales y vuelve a crear la base desde los SQL iniciales:

```powershell
docker compose down -v
docker compose up -d postgres
```

Usarlo solo si el profesor pide empezar con base limpia.

## 9. Credenciales de prueba

```txt
Usuario: admin
Contrasena: Admin12345!
```

## 10. Comandos utiles

Verificar errores de codigo:

```powershell
npm run lint
```

Crear build de produccion:

```powershell
npm run build
```

Probar salud de la API:

```powershell
Invoke-RestMethod http://localhost:3001/api/salud
```

## 11. Modo API solamente

Si se necesita levantar solo backend:

```powershell
npm run dev:api
```

Eso deja la API en:

```txt
http://localhost:3001/api
```

Para este modo, `PORT` debe ser `3001` y `VITE_API_URL` debe apuntar a `http://localhost:3001/api`.
