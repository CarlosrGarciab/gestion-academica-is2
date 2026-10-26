const pool = require("../config/db");

const obtenerResumen = async () => {
    const [ingresos, alumnos, ocupacion, ingresosMensuales, estadosInscripcion] = await Promise.all([
        pool.query(
            `SELECT COALESCE(SUM(monto), 0) AS total_ingresos,
                    COUNT(*)::int AS cantidad_pagos
             FROM pago`
        ),
        pool.query(
            `SELECT COUNT(DISTINCT id_estudiante)::int AS total_alumnos
             FROM inscripcion
             WHERE estado = 'confirmada'`
        ),
        pool.query(
            `SELECT c.id, COALESCE(c.nombre, 'Cohorte #' || c.id) AS cohorte_nombre,
                    cu.nombre AS curso_nombre, c.modalidad, c.cupo_fisico,
                    COUNT(i.id) FILTER (WHERE i.estado = 'confirmada')::int AS alumnos_inscritos
             FROM cohorte c
             JOIN curso cu ON cu.id = c.id_curso
             LEFT JOIN inscripcion i ON i.id_cohorte = c.id
             WHERE c.modalidad IN ('presencial', 'hibrida')
               AND c.cupo_fisico IS NOT NULL
             GROUP BY c.id, c.nombre, cu.nombre, c.modalidad, c.cupo_fisico
             ORDER BY c.fecha_inicio DESC, c.id DESC`
        ),
        pool.query(
            `SELECT TO_CHAR(DATE_TRUNC('month', fecha_pago), 'YYYY-MM') AS periodo,
                    COALESCE(SUM(monto), 0) AS total
             FROM pago
             WHERE fecha_pago >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '5 months'
             GROUP BY DATE_TRUNC('month', fecha_pago)
             ORDER BY DATE_TRUNC('month', fecha_pago)`
        ),
        pool.query(
            `SELECT estado, COUNT(*)::int AS cantidad
             FROM inscripcion
             GROUP BY estado
             ORDER BY estado`
        ),
    ]);

    return {
        ingresos: ingresos.rows[0],
        alumnos: alumnos.rows[0],
        ocupacion: ocupacion.rows,
        ingresosMensuales: ingresosMensuales.rows,
        estadosInscripcion: estadosInscripcion.rows,
    };
};

module.exports = { obtenerResumen };
