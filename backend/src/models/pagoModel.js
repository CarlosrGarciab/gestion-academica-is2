const pool = require("../config/db");

const listarInscripcionesPendientes = async () => {
    const { rows } = await pool.query(
        `SELECT i.id, i.id_estudiante, i.id_cohorte, i.fecha_solicitud,
                u.nombre AS estudiante_nombre, u.apellido AS estudiante_apellido,
                c.nombre AS cohorte_nombre, cu.nombre AS curso_nombre,
                n.precio_inscripcion
         FROM inscripcion i
         JOIN usuario u ON u.id = i.id_estudiante
         JOIN cohorte c ON c.id = i.id_cohorte
         JOIN curso cu ON cu.id = c.id_curso
         LEFT JOIN LATERAL (
             SELECT precio_inscripcion
             FROM nivel_curso
             WHERE nombre = cu.nivel
               AND vigencia_desde <= CURRENT_DATE
               AND (vigencia_hasta IS NULL OR vigencia_hasta >= CURRENT_DATE)
             ORDER BY vigencia_desde DESC
             LIMIT 1
         ) n ON TRUE
         WHERE i.estado = 'pendiente'
         ORDER BY i.fecha_solicitud ASC, i.id ASC`
    );
    return rows;
};

const obtenerInscripcionParaPago = async (client, idInscripcion) => {
    const { rows } = await client.query(
        `SELECT i.id, i.estado, i.id_estudiante, c.nombre AS cohorte_nombre,
                cu.nombre AS curso_nombre, n.precio_inscripcion
         FROM inscripcion i
         JOIN cohorte c ON c.id = i.id_cohorte
         JOIN curso cu ON cu.id = c.id_curso
         LEFT JOIN LATERAL (
             SELECT precio_inscripcion
             FROM nivel_curso
             WHERE nombre = cu.nivel
               AND vigencia_desde <= CURRENT_DATE
               AND (vigencia_hasta IS NULL OR vigencia_hasta >= CURRENT_DATE)
             ORDER BY vigencia_desde DESC
             LIMIT 1
         ) n ON TRUE
         WHERE i.id = $1
         FOR UPDATE OF i`,
        [idInscripcion]
    );
    return rows[0] || null;
};

const crearPago = async (client, { id_inscripcion, monto }) => {
    const { rows } = await client.query(
        `INSERT INTO pago (id_inscripcion, monto)
         VALUES ($1, $2)
         RETURNING *`,
        [id_inscripcion, monto]
    );
    return rows[0];
};

const confirmarInscripcion = async (client, idInscripcion) => {
    const { rows } = await client.query(
        `UPDATE inscripcion
         SET estado = 'confirmada', fecha_confirmacion = CURRENT_TIMESTAMP
         WHERE id = $1 AND estado = 'pendiente'
         RETURNING *`,
        [idInscripcion]
    );
    return rows[0] || null;
};

const listarPagosPorEstudiante = async (idEstudiante) => {
    const { rows } = await pool.query(
        `SELECT p.*, i.id_estudiante, c.nombre AS cohorte_nombre,
                cu.nombre AS curso_nombre
         FROM pago p
         JOIN inscripcion i ON i.id = p.id_inscripcion
         JOIN cohorte c ON c.id = i.id_cohorte
         JOIN curso cu ON cu.id = c.id_curso
         WHERE i.id_estudiante = $1
         ORDER BY p.fecha_pago DESC, p.id DESC`,
        [idEstudiante]
    );
    return rows;
};

module.exports = {
    listarInscripcionesPendientes,
    obtenerInscripcionParaPago,
    crearPago,
    confirmarInscripcion,
    listarPagosPorEstudiante,
};
