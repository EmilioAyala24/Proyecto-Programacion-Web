# Guia del proyecto Farmacia Inclusiva

Este documento explica como esta organizado y como funciona el proyecto carpeta por carpeta y archivo por archivo. El sistema es una aplicacion web para administrar una farmacia: usuarios, login, clientes, proveedores, medicamentos, lotes, ventas y estadisticas.

## Vision general

El proyecto esta dividido en tres partes principales:

- Frontend: vive en `src/` y esta hecho con React, Vite y React Router.
- Backend: vive en `backend/src/` y esta hecho con Express.
- Base de datos: vive en `BaseDeDatos/` y usa PostgreSQL.

Flujo basico:

1. El usuario entra al frontend.
2. `src/main.jsx` monta React y `src/App.jsx` define las rutas.
3. El login llama a `POST /api/auth/login`.
4. El backend recibe las peticiones en `backend/src/app.js`, las manda a `backend/src/routes/index.js` y de ahi a cada modulo.
5. Cada ruta llama a un controlador.
6. Cada controlador valida datos y llama a un modelo.
7. Cada modelo ejecuta SQL en PostgreSQL mediante `backend/src/config/database.js`.
8. El frontend recibe la respuesta, normaliza los datos en `src/services/` y los muestra en paginas y componentes.

## Archivos de raiz

### `.env.example`

Plantilla de variables de entorno. Sirve para saber que valores debe tener el proyecto localmente, como `PORT`, `VITE_API_URL` y datos de PostgreSQL.

### `.env.local`

Archivo local real con variables de entorno. El frontend lee `VITE_API_URL` para saber a que API llamar. El backend lee las variables de conexion a la base de datos.

### `.gitignore`

Indica que archivos o carpetas no se suben al repositorio, por ejemplo `node_modules`, archivos generados o variables locales.

### `docker-compose.yml`

Levanta PostgreSQL 16 en Docker. Crea el contenedor `farmacia_inclusiva_postgres`, expone la base en el puerto local `5433` y carga automaticamente:

- `BaseDeDatos/farmacia_inclusiva.sql`
- `BaseDeDatos/seeds/proveedores.sql`
- `BaseDeDatos/seeds/catalogo_inicial.sql`

Tambien define un volumen para conservar datos entre reinicios.

### `eslint.config.js`

Configuracion de ESLint. Sirve para revisar reglas de calidad y estilo en JavaScript y React.

### `index.html`

HTML base de Vite. Contiene el nodo `root` donde React monta toda la aplicacion.

### `package.json`

Define dependencias y comandos del proyecto.

Comandos importantes:

- `npm run dev`: inicia el frontend con Vite.
- `npm run dev:api`: inicia el backend Express.
- `npm run db:up`: levanta PostgreSQL con Docker.
- `npm run db:down`: apaga los servicios Docker.
- `npm run db:reset`: reinicia la base de datos desde cero.
- `npm run build`: genera la version de produccion del frontend.
- `npm run lint`: ejecuta ESLint.

Dependencias principales:

- `react`, `react-dom`: interfaz.
- `react-router-dom`: navegacion.
- `recharts`: graficas.
- `express`, `cors`: API.
- `pg`: conexion a PostgreSQL.
- `dotenv`: variables de entorno.

### `package-lock.json`

Archivo generado por npm que fija versiones exactas de dependencias.

### `README.md`

Documento inicial de Vite/React. Actualmente contiene informacion generica de la plantilla.

### `vite.config.js`

Configura Vite con el plugin de React.

### `prueba.txt`

Archivo de prueba sin participacion directa en la aplicacion.

## Carpeta `backend/`

Contiene la API del proyecto.

### `backend/src/app.js`

Crea la app de Express. Activa CORS, permite recibir JSON, registra un middleware simple de logs, monta todas las rutas bajo `/api` y usa el manejador global de errores.

### `backend/src/server.js`

Punto de entrada del backend. Carga variables de entorno, prepara la base de datos con `prepararBaseDatos()` y luego escucha en el puerto configurado, por defecto `3001`.

## Carpeta `backend/src/config/`

Configuracion del backend.

### `backend/src/config/env.js`

Carga variables de entorno con `dotenv`. Por defecto usa `.env.local`, aunque se puede cambiar con `ENV_FILE`.

### `backend/src/config/database.js`

Crea el `Pool` de PostgreSQL usando `pg`.

Funciones principales:

- `verificarConexion()`: ejecuta `SELECT NOW()` para comprobar conexion.
- `prepararBaseDatos()`: aplica ajustes al esquema al iniciar, como agregar `password_hash`, `contenido`, `id_med`, normalizar roles, ajustar fechas y asegurar un usuario `admin`.

## Carpeta `backend/src/routes/`

Define endpoints de la API. Las rutas son delgadas: solo conectan URLs con controladores.

### `backend/src/routes/index.js`

Ruta central de la API.

- `GET /api/salud`: revisa que la API y la base funcionen.
- Monta `/clientes`, `/auth`, `/usuarios`, `/proveedores`, `/medicamentos`, `/lotes` y `/ventas`.

### `backend/src/routes/authRoutes.js`

Endpoints de autenticacion:

- `POST /api/auth/login`
- `POST /api/auth/logout`

### `backend/src/routes/clientesRoutes.js`

CRUD de clientes:

- `GET /api/clientes`
- `GET /api/clientes/:id`
- `POST /api/clientes`
- `PUT /api/clientes/:id`
- `DELETE /api/clientes/:id`

### `backend/src/routes/usuariosRoutes.js`

CRUD de usuarios:

- `GET /api/usuarios`
- `GET /api/usuarios/:id`
- `POST /api/usuarios`
- `PUT /api/usuarios/:id`
- `DELETE /api/usuarios/:id`

### `backend/src/routes/proveedoresRoutes.js`

CRUD de proveedores:

- `GET /api/proveedores`
- `POST /api/proveedores`
- `PUT /api/proveedores/:id`
- `DELETE /api/proveedores/:id`

### `backend/src/routes/medicamentosRoutes.js`

CRUD de medicamentos:

- `GET /api/medicamentos`
- `POST /api/medicamentos`
- `PUT /api/medicamentos/:id`
- `DELETE /api/medicamentos/:id`

### `backend/src/routes/lotesRoutes.js`

CRUD de lotes:

- `GET /api/lotes`
- `POST /api/lotes`
- `PUT /api/lotes/:id`
- `DELETE /api/lotes/:id`

### `backend/src/routes/ventasRoutes.js`

Rutas de ventas:

- `GET /api/ventas/opciones/metodos-pago`
- `GET /api/ventas/opciones/clientes`
- `GET /api/ventas/opciones/medicamentos`
- `GET /api/ventas`
- `GET /api/ventas/:id`
- `POST /api/ventas`

Las rutas de opciones van antes de `/:id` para evitar que Express interprete `opciones` como un ID.

## Carpeta `backend/src/controllers/`

Contiene la logica HTTP: recibe `req`, valida, llama modelos y responde JSON.

### `backend/src/controllers/authController.js`

Gestiona login y logout. Valida usuario/contrasena, busca el usuario por username, verifica el hash de contrasena y devuelve los datos de sesion. En logout registra la ultima conexion del usuario.

### `backend/src/controllers/clientesController.js`

Controla listar, obtener, crear, actualizar y eliminar clientes. Usa `validarCliente()` antes de guardar datos.

### `backend/src/controllers/usuariosController.js`

Controla listar, obtener, crear, actualizar y eliminar usuarios. Genera hash de contrasena al crear o cuando se actualiza una nueva contrasena.

### `backend/src/controllers/proveedoresController.js`

Controla proveedores. Valida datos con `validarProveedor()` y responde con mensajes de error si el proveedor no existe o los datos son invalidos.

### `backend/src/controllers/medicamentosController.js`

Controla medicamentos. Valida nombre, presentacion, concentracion, contenido y si requiere receta. Luego llama al modelo para crear, actualizar, listar o eliminar.

### `backend/src/controllers/lotesController.js`

Controla lotes. Limpia datos recibidos desde el frontend, valida proveedor, medicamento, numero de lote, fechas, stock y precios. Tambien decide si una fecha de caducidad es valida comparandola con fabricacion e ingreso.

### `backend/src/controllers/ventasController.js`

Controla ventas. Permite listar ventas, ver detalle, crear una venta y obtener opciones para formularios: metodos de pago, clientes y medicamentos disponibles.

## Carpeta `backend/src/models/`

Contiene consultas SQL. Aqui esta la comunicacion directa con PostgreSQL.

### `backend/src/models/clientesModel.js`

Consulta, crea, actualiza y elimina clientes. Formatea fechas como `DD-MM-YYYY | HH24:MI:SS` y crea fechas ajustadas a horario Mexico centro.

### `backend/src/models/usuariosModel.js`

Consulta, crea, actualiza y elimina usuarios. Tambien busca usuario por username para login y actualiza `ultima_conexion` en logout.

### `backend/src/models/proveedoresModel.js`

Consulta, crea, actualiza y elimina proveedores en la tabla `proveedor`.

### `backend/src/models/medicamentosModel.js`

Consulta medicamentos junto con informacion agregada de sus lotes: stock total, precio, total de lotes, lotes vigentes, proximos y caducados. Tambien crea, actualiza y elimina medicamentos.

### `backend/src/models/lotesModel.js`

Consulta lotes junto con proveedor y medicamento. Calcula estado del lote:

- `Caducado`: fecha menor a hoy.
- `Proximo`: caduca dentro de 60 dias.
- `Vigente`: no esta caducado ni proximo.

Tambien crea, actualiza y elimina lotes, y marca `activo` segun stock.

### `backend/src/models/ventasModel.js`

Maneja ventas con transacciones SQL. Al crear una venta:

1. Inicia `BEGIN`.
2. Inserta la venta con total temporal en cero.
3. Revisa y bloquea cada lote con `FOR UPDATE`.
4. Valida stock y caducidad.
5. Inserta cada detalle.
6. Descuenta stock del lote.
7. Actualiza el total de la venta.
8. Hace `COMMIT` o `ROLLBACK` si hay error.

Tambien obtiene historial, detalle, metodos de pago, clientes y medicamentos disponibles.

## Carpeta `backend/src/validators/`

Valida datos antes de guardar.

### `backend/src/validators/authValidator.js`

Valida que login reciba usuario y password.

### `backend/src/validators/clientesValidator.js`

Valida campos de cliente como nombre, apellidos, telefono y correo.

### `backend/src/validators/usuariosValidator.js`

Valida usuario, rol, nombre, telefono y contrasena. Distingue cuando la contrasena es obligatoria al crear y opcional al editar.

### `backend/src/validators/proveedoresValidator.js`

Valida nombre, telefono, correo y direccion del proveedor.

### `backend/src/validators/medicamentosValidator.js`

Valida datos de medicamento y normaliza nombres de campos recibidos desde el frontend.

### `backend/src/validators/ventasValidator.js`

Valida que una venta tenga usuario, metodo de pago y detalles validos.

## Carpeta `backend/src/middleware/`

### `backend/src/middleware/errorHandler.js`

Manejador global de errores. Registra el error en consola y responde `500` con un mensaje generico.

## Carpeta `backend/src/utils/`

### `backend/src/utils/password.js`

Gestiona contrasenas con `crypto.pbkdf2Sync`.

- `generarPasswordHash(password)`: crea salt y hash.
- `verificarPassword(password, passwordHash)`: compara hashes con `timingSafeEqual`.

## Carpeta `backend/src/services/`

Actualmente solo contiene `.gitkeep`. Esta preparada para agregar servicios de backend si despues se separa logica que no pertenece directamente al controlador ni al modelo.

## Carpeta `BaseDeDatos/`

Contiene el esquema, migraciones y datos iniciales.

### `BaseDeDatos/farmacia_inclusiva.sql`

Script principal de la base de datos. Crea tablas como:

- `metodo_pago`
- `usuario`
- `cliente`
- `proveedor`
- `lote`
- `medicamento`
- `codigos_qr`
- `ventas`
- `detalle_ventas_medicamento`

Tambien define relaciones entre ventas, usuarios, clientes, metodos de pago, medicamentos y lotes.

### `BaseDeDatos/migrations/20260524_medicamento_catalogo_lotes.sql`

Migracion que separa mejor catalogo de medicamentos y lotes. Agrega `id_med` a `lote`, permite que `medicamento.id_lote` no sea obligatorio y crea la llave foranea `fk_lote_med`.

### `BaseDeDatos/seeds/proveedores.sql`

Datos iniciales de proveedores.

### `BaseDeDatos/seeds/catalogo_inicial.sql`

Datos iniciales de catalogo, lotes y registros base necesarios para probar el sistema.

### `.gitkeep` en subcarpetas

Archivos vacios para mantener carpetas en Git aunque no tengan mas contenido.

## Carpeta `docs/`

Documentacion del proyecto.

### `docs/api/proveedores.md`

Documenta endpoints del modulo proveedores.

### `docs/api/ventas.md`

Documenta el modulo de ventas, rutas, estructura de archivos, validaciones y tablas relacionadas.

### `docs/database/conexion-postgresql.md`

Explica como levantar PostgreSQL con Docker, configurar `.env.local`, iniciar backend/frontend y revisar `/api/salud`.

### `docs/manuales/guia-proyecto.md`

Este documento.

## Carpeta `public/`

Archivos publicos servidos directamente por Vite.

### `public/favicon.svg`

Icono del sitio.

### `public/icons.svg`

Archivo SVG con iconos reutilizables.

## Carpeta `src/`

Contiene el frontend React.

### `src/main.jsx`

Entrada del frontend. Monta React en `#root`, envuelve la aplicacion en `BrowserRouter` y activa `StrictMode`.

### `src/App.jsx`

Define rutas principales:

- `/login`
- `/inicio`
- `/dashboard`
- `/medicamentos`
- `/medicamentos/:id`
- `/lotes`
- `/proveedores`
- `/ventas`
- `/clientes`
- `/usuarios`

Tambien envuelve la app con `AuthProvider` y protege rutas internas con `ProtectedRoute`.

### `src/App.css`

Estilos principales de la aplicacion: layout, sidebar, encabezados, tablas, modales, botones, tarjetas, estados visuales y paginas.

### `src/index.css`

Estilos globales base aplicados por Vite/React.

## Carpeta `src/context/`

Maneja contexto global de autenticacion.

### `src/context/auth-context.js`

Crea el contexto React `AuthContext`.

### `src/context/AuthContext.jsx`

Proveedor del contexto. Guarda el usuario actual, expone `estaAutenticado`, `iniciarSesion` y `cerrarSesion`. Usa `authService` para persistir la sesion en `localStorage`.

## Carpeta `src/hooks/`

Hooks reutilizables.

### `src/hooks/useAuth.js`

Hook para consumir `AuthContext`. Lanza error si se usa fuera de `AuthProvider`.

## Carpeta `src/utils/`

Funciones auxiliares del frontend.

### `src/utils/permisos.js`

Define modulos disponibles y roles permitidos. Roles usados:

- `admin`: acceso completo.
- `cajero`: acceso a inicio, medicamentos, clientes y ventas.

Tambien normaliza alias como `administrador` y `vendedor`.

### `src/utils/validaciones.js`

Contiene reglas de sanitizacion y validacion para formularios: usuarios, contrasenas, nombres, telefonos, correos, direcciones, medicamentos, lotes, stock, precios y fechas.

## Carpeta `src/services/`

Servicios que conectan el frontend con la API. Tambien normalizan datos para que los componentes usen nombres consistentes.

### `src/services/authService.js`

Llama a login/logout, guarda sesion en `localStorage`, recupera sesion al recargar y normaliza el rol.

### `src/services/clientesService.js`

Consume `/clientes`. Normaliza nombres de campos de base de datos (`ap_pat`, `fecha_registro`) a campos del frontend (`apPat`, `fechaRegistro`).

### `src/services/usuariosService.js`

Consume `/usuarios`. Crea, actualiza, obtiene y elimina usuarios. Formatea fechas de creacion y ultima conexion.

### `src/services/proveedoresService.js`

Consume `/proveedores`. Si no existe `VITE_API_URL`, usa datos iniciales de `src/data/proveedores.js`.

### `src/services/medicamentosService.js`

Consume `/medicamentos`. Normaliza stock, precios, conteo de lotes y estado de caducidad. Tiene fallback a `src/data/medicamentos.js`.

### `src/services/lotesService.js`

Consume `/lotes`. Normaliza fechas, proveedor, medicamento, stock y estado del lote. Serializa los datos antes de enviarlos al backend.

### `src/services/ventasService.js`

Consume `/ventas`. Normaliza fechas a horario Mexico, obtiene historial, detalle de venta, metodos de pago, clientes, medicamentos disponibles y crea ventas.

### `src/services/estadisticasService.js`

Calcula metricas del dia a partir de ventas y clientes:

- ingresos totales
- numero de ventas
- venta promedio
- clientes totales
- ventas por hora
- metodos de pago
- tendencia semanal
- clientes nuevos

## Carpeta `src/pages/`

Paginas completas de la aplicacion. Cada pagina une estado, filtros, servicios y componentes visuales.

### `src/pages/Login.jsx`

Pantalla de acceso. Si el usuario ya esta autenticado, redirige a la ruta inicial segun su rol.

### `src/pages/Inicio.jsx`

Panel de estadisticas. Carga datos con `obtenerEstadisticasDelDia()` y muestra tarjetas metricas y graficas.

### `src/pages/Dashboard.jsx`

Panel sencillo de avance funcional con accesos a modulos. Parece una pantalla inicial de demostracion.

### `src/pages/Medicamentos.jsx`

Modulo de medicamentos. Lista, filtra, pagina, crea, edita, elimina y abre detalle de medicamento.

### `src/pages/MedicamentoDetalle.jsx`

Detalle de un medicamento. Muestra informacion del catalogo y los lotes asociados, con resumen de vigentes, proximos y caducados.

### `src/pages/Lotes.jsx`

Modulo de lotes. Carga lotes, proveedores y medicamentos. Permite filtrar, crear, editar, eliminar y ver detalle.

### `src/pages/Proveedores.jsx`

Modulo de proveedores. Permite listar, filtrar, crear, editar, eliminar y ver detalle.

### `src/pages/Ventas.jsx`

Modulo de ventas. Muestra historial, indicadores, formulario para registrar venta y modal de detalle. Al crear venta recarga el historial.

### `src/pages/Clientes.jsx`

Modulo de clientes. Permite listar, filtrar, crear, editar, eliminar y ver detalle. Calcula clientes nuevos de los ultimos 7 dias.

### `src/pages/Usuarios.jsx`

Modulo de usuarios. Permite listar, filtrar por usuario/rol, crear, editar, eliminar y ver detalle.

### `src/pages/ModuloPendiente.jsx`

Componente de pagina para modulos aun no implementados. Actualmente no se usa en `App.jsx`.

## Carpeta `src/layouts/`

### `src/layouts/AppLayout.jsx`

Layout principal despues del login. Muestra barra lateral con modulos permitidos por rol, barra superior con usuario activo y boton de cerrar sesion. Usa `Outlet` para renderizar la pagina actual.

## Carpeta `src/components/`

Componentes reutilizables o propios de cada modulo.

### Componentes generales

#### `src/components/BannerEstado.jsx`

Componente visual para mostrar estados o mensajes destacados.

#### `src/components/Encabezado.jsx`

Encabezado reutilizable.

#### `src/components/SeccionAudio.jsx`

Seccion relacionada con audio o lectura, posiblemente pensada para accesibilidad.

#### `src/components/TarjetaFechas.jsx`

Tarjeta para mostrar fechas relevantes.

#### `src/components/TarjetaMedicamento.jsx`

Tarjeta visual para informacion de medicamento.

#### `src/components/TarjetaVenta.jsx`

Tarjeta visual para informacion de venta.

### `src/components/auth/`

#### `src/components/auth/LoginForm.jsx`

Formulario de login. Captura usuario y contrasena, llama a `iniciarSesion` desde `useAuth` y maneja errores visuales.

### `src/components/common/`

#### `src/components/common/AddButton.jsx`

Boton reutilizable para agregar registros.

#### `src/components/common/AddButton.css`

Estilos del boton de agregar.

#### `src/components/common/DetalleRegistro.jsx`

Componente para mostrar campos de detalle en modales.

#### `src/components/common/Modal.jsx`

Modal reutilizable para formularios y detalles.

#### `src/components/common/Modal.css`

Estilos de modal.

#### `src/components/common/Paginacion.jsx`

Controles de paginacion usados en tablas.

#### `src/components/common/ProtectedRoute.jsx`

Protege rutas internas. Si no hay sesion redirige a `/login`; si el rol no tiene permiso, redirige a la ruta inicial del rol.

#### `src/components/common/SearchBar.jsx`

Barra de busqueda reutilizable.

#### `src/components/common/SearchBar.css`

Estilos de barra de busqueda.

### `src/components/clientes/`

#### `src/components/clientes/ClienteForm.jsx`

Formulario para crear o editar cliente. Usa validaciones y sanitizacion del frontend.

#### `src/components/clientes/ClientesTable.jsx`

Tabla de clientes con acciones de ver, editar y eliminar.

### `src/components/usuarios/`

#### `src/components/usuarios/UsuarioForm.jsx`

Formulario para crear o editar usuarios, incluyendo rol y contrasena.

#### `src/components/usuarios/UsuariosTable.jsx`

Tabla de usuarios con acciones.

### `src/components/proveedores/`

#### `src/components/proveedores/ProveedorForm.jsx`

Formulario de proveedores.

#### `src/components/proveedores/ProveedoresTable.jsx`

Tabla de proveedores con acciones.

### `src/components/medicamentos/`

#### `src/components/medicamentos/MedicamentoForm.jsx`

Formulario para registrar o editar medicamento.

#### `src/components/medicamentos/MedicamentosTable.jsx`

Tabla de medicamentos con stock, receta, lotes y acciones.

### `src/components/lotes/`

#### `src/components/lotes/LoteForm.jsx`

Formulario para registrar o editar lotes. Usa listas de medicamentos y proveedores.

#### `src/components/lotes/LotesTable.jsx`

Tabla de lotes con estado de caducidad, stock, precios y acciones.

### `src/components/ventas/`

#### `src/components/ventas/VentaForm.jsx`

Formulario para registrar ventas. Carga metodos de pago, clientes y medicamentos disponibles. Permite agregar detalles y calcula total.

#### `src/components/ventas/VentasTable.jsx`

Tabla del historial de ventas.

### `src/components/filtros/`

Componentes de filtros por modulo:

- `FiltrosClientes.jsx`: filtra clientes.
- `FiltrosLotes.jsx`: filtra lotes.
- `FiltrosMedicamentos.jsx`: filtra medicamentos.
- `FiltrosProveedores.jsx`: filtra proveedores.
- `FiltrosUsuarios.jsx`: filtra usuarios.
- `FiltrosVentas.jsx`: filtra ventas.
- `FiltrosModulo.css`: estilos comunes para filtros.

### `src/components/graficos/`

Componentes de graficas y metricas del inicio:

- `GraficoClientesNuevos.jsx`
- `GraficoMetodosPago.jsx`
- `GraficoTendenciaSemanal.jsx`
- `GraficoVentasDelDia.jsx`
- `TarjetaMetrica.jsx`
- `Graficos.css`

Usan `recharts` para visualizar datos calculados en `estadisticasService`.

## Carpeta `src/data/`

Datos iniciales o fallback para desarrollo cuando no hay API configurada.

### `src/data/medicamentos.js`

Medicamentos iniciales.

### `src/data/lotes.js`

Lotes iniciales.

### `src/data/proveedores.js`

Proveedores iniciales.

### `src/data/ventas.js`

Ventas iniciales o datos de apoyo.

## Carpeta `src/assets/`

Recursos del frontend.

### `src/assets/hero.png`

Imagen principal usada por la interfaz.

### `src/assets/react.svg`

Logo de React incluido por la plantilla.

### `src/assets/vite.svg`

Logo de Vite incluido por la plantilla.

## Carpetas generadas

### `node_modules/`

Dependencias instaladas por npm. No se edita manualmente.

### `dist/`

Salida generada por `npm run build`. Contiene archivos listos para produccion. No es fuente principal.

## Flujo de autenticacion

1. `Login.jsx` muestra `LoginForm`.
2. `LoginForm` llama a `iniciarSesion`.
3. `AuthContext.jsx` llama a `authService.login`.
4. `authService.js` manda `POST /api/auth/login`.
5. `authController.js` valida datos y revisa contrasena con `password.js`.
6. Si es correcto, devuelve datos del usuario.
7. El frontend guarda la sesion en `localStorage`.
8. `ProtectedRoute.jsx` permite o bloquea rutas segun rol.

## Flujo de una venta

1. `Ventas.jsx` abre `VentaForm`.
2. `VentaForm` carga clientes, metodos de pago y medicamentos disponibles.
3. El usuario arma detalles de venta.
4. `ventasService.crearVenta()` manda `POST /api/ventas`.
5. `ventasController.crearVenta()` valida la venta.
6. `ventasModel.crearVenta()` usa una transaccion:
   - inserta venta,
   - valida lote,
   - inserta detalles,
   - descuenta stock,
   - actualiza total.
7. El frontend recarga el historial.

## Flujo de inventario

Medicamentos y lotes estan relacionados, pero cumplen funciones distintas:

- Medicamento: catalogo general del producto.
- Lote: existencia real, proveedor, fechas, stock y precios.

Por eso el stock mostrado en medicamentos se calcula sumando lotes asociados.

## Roles y permisos

Los permisos estan en `src/utils/permisos.js`.

- Administrador: puede entrar a inicio, medicamentos, lotes, proveedores, clientes, usuarios y ventas.
- Cajero: puede entrar a inicio, medicamentos, clientes y ventas.

El backend actualmente no aplica middleware de autorizacion por rol; la restriccion esta principalmente en el frontend.

## Como ejecutar el proyecto localmente

1. Instalar dependencias:

```bash
npm install
```

2. Levantar PostgreSQL:

```bash
npm run db:up
```

3. Iniciar backend:

```bash
npm run dev:api
```

4. Iniciar frontend:

```bash
npm run dev
```

5. Abrir:

```txt
http://localhost:5173
```

6. Revisar API:

```txt
http://localhost:3001/api/salud
```

