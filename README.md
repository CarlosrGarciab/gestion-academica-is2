# CCGB - Plataforma de Gestión Académica para Institutos de Formación

Aplicación web responsive para centralizar la gestión académica y financiera de institutos de formación continua: cursos, cohortes, modalidades de cursado, inscripciones, pagos de estudiantes y liquidación de pagos a docentes.

**Materia:** Ingeniería de Software II - FP-UNA
**Sprint actual:** Sprint 2

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
3. Inscripciones con control automático de cupos y estados (Pendiente, Confirmada, Cancelada).
4. Módulo financiero: registro/simulación de pagos de estudiantes y cálculo de pagos a docentes por horas dictadas.
5. Dashboard con KPIs de inscripciones, ingresos y ocupación.

**Fuera de alcance:** facturación electrónica/timbrado fiscal, integración con pasarelas de pago reales, notificaciones push/SMS y apps móviles nativas.

## Arquitectura

Monolito modular organizado en capas (presentación, aplicación, dominio, infraestructura), con los módulos Usuarios, Académico, Inscripciones y Financiero separados internamente por responsabilidad.

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

El frontend permite registrar usuarios como Estudiante o Docente, iniciar sesión y mostrar un panel básico según el rol. El registro público de Administrador está bloqueado; para desarrollo se utiliza el script indicado más abajo.

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

La administración de cursos todavía no está disponible: aún faltan `cursoRoutes`, `cursoService` y `cursoModel`.

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
