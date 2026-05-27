# Manual de arranque desde cero

Este manual sirve para apagar y encender el proyecto completo desde consola en Windows PowerShell.

## 1. Entrar a la carpeta del proyecto

```powershell
cd C:\Users\Colibecas\Downloads\Proyecto-Programacion-Web
```

## 2. Revisar el archivo `.env.local`

Para trabajar local sin ngrok:

```env
PORT=5173
VITE_API_URL=/api
VITE_PUBLIC_URL=http://localhost:5173
APP_PUBLIC_URL=http://localhost:5173

DB_HOST=localhost
DB_PORT=5433
DB_NAME=farmacia_inclusiva
DB_USER=postgres
DB_PASSWORD=postgres
```

Para exponer con ngrok, cambiar las dos URL públicas por el dominio de ngrok:

```env
VITE_PUBLIC_URL=https://flagship-hacking-amino.ngrok-free.dev
APP_PUBLIC_URL=https://flagship-hacking-amino.ngrok-free.dev
```

## 3. Encender PostgreSQL

```powershell
docker compose up -d postgres
```

Verificar que el contenedor esté arriba:

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

## 5. Encender frontend y backend juntos

Este proyecto usa un servidor integrado. Con un solo comando se levanta:

- Frontend React/Vite
- Backend Express
- API en `/api`

```powershell
npm run dev
```

La aplicación queda en:

```txt
http://localhost:5173
```

La API queda en:

```txt
http://localhost:5173/api/salud
```

## 6. Encender ngrok

En otra terminal PowerShell:

```powershell
C:\Users\Colibecas\Proyecto_Software\tools\ngrok\ngrok.exe http 5173 --log=false
```

El link público queda en el panel de ngrok. En este equipo normalmente es:

```txt
https://flagship-hacking-amino.ngrok-free.dev
```

Verificar el túnel:

```powershell
Invoke-RestMethod http://127.0.0.1:4040/api/tunnels
```

Probar la API por ngrok:

```powershell
Invoke-RestMethod https://flagship-hacking-amino.ngrok-free.dev/api/salud -Headers @{ "ngrok-skip-browser-warning" = "true" }
```

## 7. Apagar todo

Cerrar el servidor Node/Vite si está en primer plano:

```txt
Ctrl + C
```

Si quedó corriendo en segundo plano, buscar procesos en los puertos:

```powershell
netstat -ano | Select-String ':5173|:4040|:5433'
```

Cerrar Node o ngrok por ID de proceso:

```powershell
Stop-Process -Id ID_DEL_PROCESO -Force
```

Apagar PostgreSQL:

```powershell
docker compose down
```

## 8. Reinicio completo recomendado

```powershell
cd C:\Users\Colibecas\Downloads\Proyecto-Programacion-Web
docker compose up -d postgres
npm run dev
```

En otra terminal:

```powershell
C:\Users\Colibecas\Proyecto_Software\tools\ngrok\ngrok.exe http 5173 --log=false
```

## 9. Resetear base de datos

Esto borra los datos actuales y vuelve a crear la base desde los SQL iniciales:

```powershell
docker compose down -v
docker compose up -d postgres
```

Usarlo solo si el profesor pide empezar con base limpia.

## 10. Credenciales de prueba

```txt
Usuario: admin
Contraseña: Admin12345!
```

## 11. Comandos útiles

Verificar errores de código:

```powershell
npm run lint
```

Crear build de producción:

```powershell
npm run build
```

Probar salud de la API:

```powershell
Invoke-RestMethod http://localhost:5173/api/salud
```

## 12. Modo API solamente

Normalmente no se usa porque `npm run dev` ya levanta todo en `5173`.

Si se necesita levantar solo backend:

```powershell
npm run dev:api
```

Eso deja la API en:

```txt
http://localhost:3001/api
```

Para este modo, `PORT` debe ser `3001` y `VITE_API_URL` debe apuntar a `http://localhost:3001/api`.
