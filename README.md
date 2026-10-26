# CCGB - Plataforma de Gestión Académica para Institutos de Formación

Aplicación web responsive para centralizar la gestión académica y financiera de institutos de formación continua: cursos, cohortes, modalidades de cursado, inscripciones, pagos de estudiantes y liquidación de pagos a docentes.

**Materia:** Ingeniería de Software II - FP-UNA
**Estado actual:** HU06, HU07 y HU08 implementadas

## Integrantes del equipo

* Carlos García
* Nicolás Colman
* Juan Coronel
* Yanina Benítez

## Problema que resuelve

Los institutos de formación continua gestionan hoy sus cursos, docentes, estudiantes, inscripciones y pagos mediante planillas y correos electrónicos, lo que genera duplicación de datos, errores en el cálculo de pagos y rigidez para cambiar tarifas o modalidades. Esta plataforma centraliza esa gestión con reglas y parámetros configurables.

## Alcance del semestre

1. Gestión de usuarios (estudiante, docente, administrador) con registro directo y autenticación JWT.
2. Gestión académica: cursos y cohortes en modalidad presencial, virtual o híbrida.
3. Inscripciones con control automático de cupos y estados (`pendiente`, `confirmada`, `rechazada`, `cancelada`).
4. Pago único de inscripción, confirmación de la inscripción y emisión de comprobante correlativo.
5. Registro, aprobación, rechazo e historial de horas docentes, con liquidación por período.
6. Dashboard administrativo con KPIs de ingresos, alumnos inscritos y ocupación por cohorte.

**Fuera de alcance:** facturación electrónica/timbrado fiscal, integración con pasarelas de pago reales, notificaciones push/SMS y apps móviles nativas.

## Arquitectura

Monolito modular organizado por capas técnicas: rutas, controladores, servicios, modelos, middlewares y configuración. Actualmente están implementados los módulos de autenticación, usuarios, cursos, cohortes, inscripciones, pagos, horas docentes y dashboard.

## Estructura del repositorio

```text
gestion-academica-is2/
├── backend/          # API REST Node.js/Express y conexión PostgreSQL
├── frontend/         # SPA React/Vite
├── .gitignore
└── README.md
```

## Stack tecnológico

* **Frontend:** React
* **Backend:** Node.js/Express
* **Base de datos:** PostgreSQL
* **Autenticación:** JWT
* **Gestión de tareas:** Jira

## Cómo levantar el proyecto localmente

### Requisitos previos

* Node.js 18+
* PostgreSQL 14+
* npm

### Backend

```bash
cd backend
npm install
npm run dev
```

El backend queda disponible en `http://localhost:3000`. La comprobación de PostgreSQL está en `http://localhost:3000/health/db`.

Para ejecutar el backend sin recarga automática:

```bash
npm start
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

El frontend queda disponible en la URL que muestre Vite, normalmente `http://localhost:5173`.

### Base de datos

Configurá las credenciales en `backend/.env` y ejecutá `backend/src/config/schema.sql` en la base `gestion_academica` antes de utilizar los endpoints que consultan datos.

Variables esperadas en `backend/.env`:

```text
PORT=3000
JWT_SECRET=una-clave-local-segura
DB_HOST=localhost
DB_PORT=5432
DB_NAME=gestion_academica
DB_USER=postgres
DB_PASSWORD=tu-contraseña
```

### Funcionalidades disponibles

El frontend permite registrar usuarios (siempre como Estudiante), iniciar sesión y mostrar un panel según el rol. El Administrador dispone de paneles para administrar usuarios, cursos, cohortes, niveles de precios, categorías y asignaciones docentes, pagos, horas docentes y el dashboard. El docente puede consultar sus cohortes, registrar horas dictadas y consultar su historial. El estudiante puede consultar cohortes disponibles, solicitar inscripciones y consultar sus comprobantes. El rol Docente no se elige en el registro: debe asignarlo el Administrador. El registro público de Administrador está bloqueado; para desarrollo se utiliza el script indicado más abajo.

Endpoints disponibles:

| Método | Ruta | Requiere autenticación |
|---|---|---|
| `GET` | `/` | No |
| `GET` | `/health` | No |
| `GET` | `/health/db` | No |
| `POST` | `/api/auth/register` | No |
| `POST` | `/api/auth/login` | No |
| `GET` | `/api/usuarios/:id` | JWT |
| `GET` | `/api/usuarios/activos` | JWT + Administrador |
| `PUT` | `/api/usuarios/:id` | JWT |
| `PATCH` | `/api/usuarios/:id/activo` | JWT + Administrador |
| `PATCH` | `/api/usuarios/:id/rol` | JWT + Administrador |
| `GET` | `/api/cursos` | JWT + Administrador |
| `POST` | `/api/cursos` | JWT + Administrador |
| `PUT` | `/api/cursos/:id` | JWT + Administrador |
| `PATCH` | `/api/cursos/:id/activo` | JWT + Administrador |
| `GET` | `/api/cohortes` | JWT + Administrador |
| `POST` | `/api/cohortes` | JWT + Administrador |
| `GET` | `/api/cohortes/disponibilidad` | JWT + Estudiante |
| `POST` | `/api/inscripciones` | JWT + Estudiante |
| `GET` | `/api/inscripciones/mias` | JWT + Estudiante |
| `GET` | `/api/niveles` | JWT + Administrador |
| `POST` | `/api/niveles` | JWT + Administrador |
| `GET` | `/api/categorias-docente` | JWT + Administrador |
| `POST` | `/api/categorias-docente` | JWT + Administrador |
| `GET` | `/api/docentes/categorias` | JWT + Administrador |
| `POST` | `/api/docentes/:id/categoria` | JWT + Administrador |
| `GET` | `/api/docentes/:id/historial` | JWT + Administrador |
| `POST` | `/api/horas-docentes` | JWT + Docente |
| `GET` | `/api/horas-docentes/mias` | JWT + Docente |
| `GET` | `/api/horas-docentes/cohortes` | JWT + Docente |
| `GET` | `/api/horas-docentes/pendientes` | JWT + Administrador |
| `GET` | `/api/horas-docentes/historial` | JWT + Administrador |
| `GET` | `/api/horas-docentes/reporte` | JWT + Administrador |
| `PATCH` | `/api/horas-docentes/:id/estado` | JWT + Administrador |
| `GET` | `/api/pagos/pendientes` | JWT + Administrador |
| `POST` | `/api/pagos` | JWT + Administrador |
| `GET` | `/api/pagos/mios` | JWT + Estudiante |
| `GET` | `/api/dashboard` | JWT + Administrador |

La administración de cursos permite crear, listar, editar y desactivar cursos. La administración de usuarios permite al Administrador asignar o quitar los roles Docente y Administrador a un usuario. Las operaciones requieren un JWT de Administrador. El registro público crea cuentas con rol Estudiante; el rol Docente solo puede otorgarse desde el panel de Administrador vía `PATCH /api/usuarios/:id/rol`.

El endpoint de login está protegido con un límite de 20 intentos por dirección IP cada 15 minutos. El JWT se firma con el nombre del rol y tiene una vigencia de 8 horas; si un Administrador cambia el rol de un usuario, ese usuario ve el rol actualizado la próxima vez que carga la aplicación (el frontend refresca el perfil desde la API).

### Reglas financieras actuales

- El sistema maneja un único pago por inscripción; no existen cuotas mensuales.
- La inscripción se crea como `pendiente` y pasa a `confirmada` cuando el
  Administrador registra el pago.
- El monto debe coincidir con el precio de inscripción vigente del nivel del
  curso.
- El comprobante recibe un número correlativo único.
- La liquidación docente actual se calcula únicamente por horas aprobadas:
  `horas dictadas × tarifa hora`.

### Dashboard

El dashboard administrativo muestra:

- Total de ingresos registrados y cantidad de comprobantes.
- Total de alumnos con inscripciones confirmadas.
- Ocupación por cohorte presencial o híbrida con cupo físico.
- Gráfico de ingresos de los últimos seis meses.

Las funcionalidades de sesiones académicas, asistencia, calificaciones,
certificados y pagos docentes por módulos todavía no forman parte del alcance
implementado.

### Usuario administrador de desarrollo

Para probar las funciones administrativas sin habilitar el registro público de administradores, ejecutá desde `backend`:

```powershell
$env:ADMIN_NAME = "Admin"
$env:ADMIN_LASTNAME = "Sistema"
$env:ADMIN_EMAIL = "admin@ccgb.local"
$env:ADMIN_PASSWORD = "Admin123!"
npm run create-admin
```

Credenciales de desarrollo:

- Nombre: `Admin Sistema`
- Correo: `admin@ccgb.local`
- Contraseña: `Admin123!`
- Rol: `Administrador`

Estas credenciales son únicamente para la base local de desarrollo. No deben utilizarse en producción.