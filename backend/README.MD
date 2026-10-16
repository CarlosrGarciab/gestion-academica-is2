# Estructura del propuesta para el BACK

Guía de organización de carpetas y convenciones de código para el backend 

## Estructura de carpetas

```
backend/src/
├── config/             # Configuración de BD, variables de entorno, etc.
│   ├── db.js
│   └── schema.sql
├── controllers/        # Reciben req/res, validan input HTTP y llaman a los services
│   ├── authController.js
│   ├── usuarioController.js
│   └── cursoController.js
├── services/           # Lógica de negocio (reglas, validaciones, orquestación)
│   ├── authService.js
│   ├── usuarioService.js
│   └── cursoService.js
├── models/             # Acceso a datos: queries SQL parametrizadas contra PostgreSQL
│   ├── usuarioModel.js
│   └── cursoModel.js
├── routes/             # Endpoints (Express Router), mapean URL -> controller
│   ├── authRoutes.js
│   ├── usuarioRoutes.js
│   └── cursoRoutes.js
├── middlewares/        # Autenticación (JWT), autorización por rol, manejo de errores
│   ├── authMiddleware.js
│   └── errorMiddleware.js
├── app.js              # Configuración de Express (middlewares globales, rutas)
├── scripts/            # Scripts de mantenimiento (p. ej. crear administrador)
└── test/               # Tests con el runner nativo de Node (node --test)
```

## Convención de nombres

- **camelCase** para todos los archivos y funciones: `usuarioController.js`, `obtenerPorId()`.
- Sufijo según la capa: `Controller`, `Service`, `Model`, `Routes`, `Middleware`.
- Nombre del dominio en minúscula al inicio: `usuario`, `curso`, `auth` (no llevan mayúscula inicial en el nombre de archivo, solo en las funciones exportadas si aplica).

## Responsabilidad de cada capa

| Capa | Responsabilidad | Qué NO debe tener |
|---|---|---|
| **routes** | Mapear URL + método HTTP a una función del controller. Aplicar middlewares (auth, roles). | Lógica de negocio, SQL |
| **controllers** | Leer `req`, validar input básico, llamar al service, devolver status + JSON. | SQL directo, reglas de negocio complejas |
| **services** | Reglas de negocio: validaciones, cálculos, armado de DTOs, JWT, hashing. Es el punto de entrada que usan **otros módulos**. | Acceso directo a `pg`/`pool` |
| **models** | Queries SQL parametrizadas (`$1, $2...`) contra PostgreSQL. Puras, sin reglas de negocio. | Validaciones de negocio, lógica condicional compleja |
| **middlewares** | Verificar JWT, chequear rol, manejo centralizado de errores. | Lógica específica de un módulo |

## Separación auth vs usuario

- **`auth`**: registro, login, generación/verificación de JWT. No tiene su propio `model` — usa `usuarioModel.js` para crear/buscar usuarios.
- **`usuario`**: perfil, listado, actualización de datos, activar/desactivar. No maneja password ni tokens.

Ambos comparten la tabla `usuario` a través de `usuarioModel.js`, que actúa como único punto de acceso a esos datos.

## Comunicación entre módulos

Un módulo **nunca** accede directamente al `model` de otro módulo. Si `cursos` necesita saber si un usuario es Docente, llama a `usuarioService.obtenerPorId(id)`, no a `usuarioModel` directamente.

```
routes → controller → service → model → PostgreSQL
                          ↑
              (otros services llaman acá, no al model)
```

## Reglas de acceso a datos

- Todas las queries usan parámetros posicionales (`$1`, `$2`...) vía `pool.query(texto, [valores])`. Nunca se concatena input del usuario directamente en el string SQL.
- Operaciones que requieren atomicidad entre varias tablas (ej. inscripción + pago) usan transacciones explícitas (`BEGIN` / `COMMIT` / `ROLLBACK`) con un cliente dedicado del pool.

## Registro de horas docentes

El módulo `horasDocente` permite que un docente registre sesiones dictadas. La
tarifa se obtiene según la asignación de categoría vigente en la fecha de la
sesión y se guarda como valor histórico en `registro_horas_docente`. El
subtotal lo calcula PostgreSQL como `horas_dictadas * tarifa_hora`.

Endpoints:

- `POST /api/horas-docentes`: registra una sesión; requiere rol `Docente`.
- `GET /api/horas-docentes/mias`: lista las sesiones del docente autenticado.
- `GET /api/horas-docentes/pendientes`: lista los registros en estado `pendiente` con el docente asociado; requiere rol `Administrador` y es la fuente del `id` para aprobar o rechazar.
- `GET /api/horas-docentes/reporte?desde=YYYY-MM-DD&hasta=YYYY-MM-DD`: devuelve la liquidación consolidada de registros aprobados; requiere rol `Administrador`.
- `GET /api/horas-docentes/reporte?...&estado=pendiente`: permite revisar otros estados.
- `PATCH /api/horas-docentes/:id/estado`: aprueba o rechaza un registro pendiente.

Una cohorte puede tener varias sesiones en la misma fecha; no existe una
restricción `UNIQUE` por docente, cohorte y fecha.