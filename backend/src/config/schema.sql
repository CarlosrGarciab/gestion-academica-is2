CREATE TABLE IF NOT EXISTS rol (
    id_rol SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion TEXT,
    activo BOOLEAN DEFAULT TRUE
);

INSERT INTO rol (nombre, descripcion) VALUES
    ('Estudiante', 'Perfil de estudiante'),
    ('Docente', 'Perfil de docente'),
    ('Administrador', 'Perfil de administrador')
ON CONFLICT (nombre) DO NOTHING;

CREATE TABLE IF NOT EXISTS usuario (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    id_rol INT NOT NULL REFERENCES rol(id_rol),
    fecha_registro DATE DEFAULT CURRENT_DATE,
    activo BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS nivel_curso (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(30) NOT NULL CHECK (nombre IN ('principiante', 'intermedio', 'avanzado')),
    precio_inscripcion NUMERIC(10,2) NOT NULL CHECK (precio_inscripcion >= 0),
    vigencia_desde DATE NOT NULL,
    vigencia_hasta DATE CHECK (vigencia_hasta IS NULL OR vigencia_hasta >= vigencia_desde)
);

ALTER TABLE nivel_curso DROP CONSTRAINT IF EXISTS nivel_curso_nombre_key;
ALTER TABLE nivel_curso DROP COLUMN IF EXISTS costo_cuota_mensual;

INSERT INTO nivel_curso (nombre, precio_inscripcion, vigencia_desde, vigencia_hasta)
SELECT nombre, precio_inscripcion, vigencia_desde::date, vigencia_hasta::date
FROM (VALUES
    ('principiante', 150000, '2026-01-01', NULL),
    ('intermedio', 250000, '2026-01-01', NULL),
    ('avanzado', 350000, '2026-01-01', NULL)
) AS v(nombre, precio_inscripcion, vigencia_desde, vigencia_hasta)
WHERE NOT EXISTS (SELECT 1 FROM nivel_curso n2 WHERE n2.nombre = v.nombre);

CREATE TABLE IF NOT EXISTS categoria_docente (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(30) NOT NULL CHECK (nombre IN ('principiante', 'intermedio', 'avanzado')),
    tarifa_hora NUMERIC(10,2) NOT NULL CHECK (tarifa_hora >= 0),
    vigencia_desde DATE NOT NULL,
    vigencia_hasta DATE CHECK (vigencia_hasta IS NULL OR vigencia_hasta >= vigencia_desde)
);

ALTER TABLE categoria_docente DROP CONSTRAINT IF EXISTS categoria_docente_nombre_key;

INSERT INTO categoria_docente (nombre, tarifa_hora, vigencia_desde, vigencia_hasta)
SELECT nombre, tarifa_hora, vigencia_desde::date, vigencia_hasta::date
FROM (VALUES
    ('principiante', 40000, '2026-01-01', NULL),
    ('intermedio', 60000, '2026-01-01', NULL),
    ('avanzado', 80000, '2026-01-01', NULL)
) AS v(nombre, tarifa_hora, vigencia_desde, vigencia_hasta)
WHERE NOT EXISTS (SELECT 1 FROM categoria_docente c2 WHERE c2.nombre = v.nombre);

CREATE TABLE IF NOT EXISTS docente_categoria (
    id SERIAL PRIMARY KEY,
    id_usuario INT NOT NULL REFERENCES usuario(id),
    id_categoria INT NOT NULL REFERENCES categoria_docente(id),
    desde DATE NOT NULL,
    hasta DATE CHECK (hasta IS NULL OR hasta >= desde)
);

CREATE TABLE IF NOT EXISTS curso (
    id SERIAL PRIMARY KEY,
    id_usuario INT NOT NULL REFERENCES usuario(id),
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    area_conocimiento VARCHAR(100) NOT NULL,
    nivel VARCHAR(30) NOT NULL DEFAULT 'principiante'
        CHECK (nivel IN ('principiante', 'intermedio', 'avanzado')),
    activo BOOLEAN DEFAULT TRUE
);

ALTER TABLE curso ADD COLUMN IF NOT EXISTS nivel VARCHAR(30) NOT NULL DEFAULT 'principiante'
    CHECK (nivel IN ('principiante', 'intermedio', 'avanzado'));

CREATE TABLE IF NOT EXISTS cohorte (
    id SERIAL PRIMARY KEY,
    id_curso INT NOT NULL REFERENCES curso(id),
    id_docente INT NOT NULL REFERENCES usuario(id),
    nombre VARCHAR(150),
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    modalidad VARCHAR(20) NOT NULL CHECK (modalidad IN ('presencial', 'virtual', 'hibrida')),
    cupo_fisico INT CHECK (cupo_fisico IS NULL OR cupo_fisico > 0),
    link_acceso VARCHAR(255),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE
);

ALTER TABLE cohorte DROP COLUMN IF EXISTS costo_inscripcion;
ALTER TABLE cohorte DROP COLUMN IF EXISTS tarifa_hora_docente;

CREATE TABLE IF NOT EXISTS inscripcion (
    id SERIAL PRIMARY KEY,
    id_estudiante INT NOT NULL REFERENCES usuario(id),
    id_cohorte INT NOT NULL REFERENCES cohorte(id),
    estado VARCHAR(20) NOT NULL DEFAULT 'pendiente'
        CHECK (estado IN ('pendiente', 'confirmada', 'rechazada', 'cancelada')),
    fecha_solicitud TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_confirmacion TIMESTAMP,
    UNIQUE (id_estudiante, id_cohorte)
);

CREATE TABLE IF NOT EXISTS pago (
    id SERIAL PRIMARY KEY,
    numero_comprobante BIGSERIAL NOT NULL UNIQUE,
    id_inscripcion INT NOT NULL UNIQUE REFERENCES inscripcion(id),
    monto NUMERIC(12,2) NOT NULL CHECK (monto > 0),
    fecha_pago TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE pago DROP COLUMN IF EXISTS tipo;

CREATE TABLE IF NOT EXISTS registro_horas_docente (
    id SERIAL PRIMARY KEY,
    id_docente INT NOT NULL REFERENCES usuario(id),
    id_cohorte INT NOT NULL REFERENCES cohorte(id),
    fecha DATE NOT NULL,
    horas_dictadas NUMERIC(5,2) NOT NULL CHECK (horas_dictadas > 0),
    tarifa_hora NUMERIC(10,2) NOT NULL CHECK (tarifa_hora >= 0),
    subtotal NUMERIC(12,2) GENERATED ALWAYS AS
        (horas_dictadas * tarifa_hora) STORED,
    observaciones TEXT,
    estado VARCHAR(20) NOT NULL DEFAULT 'pendiente'
        CHECK (estado IN ('pendiente', 'aprobado', 'rechazado')),
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);