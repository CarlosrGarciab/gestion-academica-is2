const pool = require("../config/db");

const obtenerCohorteDelDocente = async (idCohorte, idDocente) => {
    const { rows } = await pool.query(
        `SELECT c.id, c.id_docente, c.fecha_inicio, c.fecha_fin,
                c.activo, cu.nombre AS curso_nombre
         FROM cohorte c
         JOIN curso cu ON cu.id = c.id_curso
         WHERE c.id = $1 AND c.id_docente = $2`,
        [idCohorte, idDocente]
    );
    return rows[0] || null;
};

const crear = async ({
    id_docente,
    id_cohorte,
    fecha,
    horas_dictadas,
    tarifa_hora,
    observaciones,
}) => {
    const { rows } = await pool.query(
        `INSERT INTO registro_horas_docente
            (id_docente, id_cohorte, fecha, horas_dictadas, tarifa_hora, observaciones)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [id_docente, id_cohorte, fecha, horas_dictadas, tarifa_hora, observaciones]
    );
    return rows[0];
};

const listarPorDocente = async (idDocente) => {
    const { rows } = await pool.query(
        `SELECT rh.*, c.nombre AS cohorte_nombre, cu.nombre AS curso_nombre
         FROM registro_horas_docente rh
         JOIN cohorte c ON c.id = rh.id_cohorte
         JOIN curso cu ON cu.id = c.id_curso
         WHERE rh.id_docente = $1
         ORDER BY rh.fecha DESC, rh.id DESC`,
        [idDocente]
    );
    return rows;
};

const listarCohortesDelDocente = async (idDocente) => {
    const { rows } = await pool.query(
        `SELECT c.id, c.nombre, c.fecha_inicio, c.fecha_fin, c.modalidad,
                cu.nombre AS curso_nombre
         FROM cohorte c
         JOIN curso cu ON cu.id = c.id_curso
         WHERE c.id_docente = $1
         ORDER BY c.fecha_inicio DESC, c.id DESC`,
        [idDocente]
    );
    return rows;
};

const listarPendientes = async () => {
    const { rows } = await pool.query(
        `SELECT rh.*, c.nombre AS cohorte_nombre, cu.nombre AS curso_nombre,
                u.nombre AS docente_nombre, u.apellido AS docente_apellido
         FROM registro_horas_docente rh
         JOIN cohorte c ON c.id = rh.id_cohorte
         JOIN curso cu ON cu.id = c.id_curso
         JOIN usuario u ON u.id = rh.id_docente
         WHERE rh.estado = 'pendiente'
         ORDER BY rh.fecha ASC, rh.id ASC`
    );
    return rows;
};

const obtenerReporte = async ({ desde, hasta, idDocente, estado }) => {
    const condiciones = ["rh.fecha BETWEEN $1::date AND $2::date"];
    const valores = [desde, hasta];
    let siguienteParametro = 3;

    if (idDocente !== undefined) {
        condiciones.push(`rh.id_docente = $${siguienteParametro}`);
        valores.push(idDocente);
        siguienteParametro += 1;
    }
    if (estado) {
        condiciones.push(`rh.estado = $${siguienteParametro}`);
        valores.push(estado);
    }

    const { rows } = await pool.query(
        `SELECT rh.id_docente, u.nombre, u.apellido,
                COUNT(rh.id)::int AS cantidad_registros,
                COALESCE(SUM(rh.horas_dictadas), 0) AS total_horas,
                COALESCE(SUM(rh.subtotal), 0) AS total_a_pagar
         FROM registro_horas_docente rh
         JOIN usuario u ON u.id = rh.id_docente
         WHERE ${condiciones.join(" AND ")}
         GROUP BY rh.id_docente, u.nombre, u.apellido
         ORDER BY u.apellido, u.nombre`,
        valores
    );
    return rows;
};

const actualizarEstado = async (id, estado) => {
    const { rows } = await pool.query(
        `UPDATE registro_horas_docente
         SET estado = $1
         WHERE id = $2 AND estado = 'pendiente'
         RETURNING *`,
        [estado, id]
    );
    return rows[0] || null;
};

module.exports = {
    obtenerCohorteDelDocente,
    crear,
    listarPorDocente,
    listarCohortesDelDocente,
    listarPendientes,
    obtenerReporte,
    actualizarEstado,
};
