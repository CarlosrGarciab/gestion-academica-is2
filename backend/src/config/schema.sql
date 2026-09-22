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

CREATE TABLE IF NOT EXISTS curso (
    id SERIAL PRIMARY KEY,
    id_usuario INT NOT NULL REFERENCES usuario(id),
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    area_conocimiento VARCHAR(100) NOT NULL,
    activo BOOLEAN DEFAULT TRUE
);

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
    costo_inscripcion NUMERIC(10,2) NOT NULL CHECK (costo_inscripcion > 0),
    costo_cuota_mensual NUMERIC(10,2) NOT NULL CHECK (costo_cuota_mensual > 0),
    tarifa_hora_docente NUMERIC(10,2) NOT NULL CHECK (tarifa_hora_docente > 0),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE
);