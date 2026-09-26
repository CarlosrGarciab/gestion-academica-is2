const pool = require("../config/db");

const ejecutor = (client) => client || pool;

const obtenerCohorteParaActualizar = async (client, idCohorte) => {
    const { rows } = await ejecutor(client).query(
        `SELECT id, modalidad, cupo_fisico, activo
         FROM cohorte
         WHERE id = $1
         FOR UPDATE`,
        [idCohorte]
    );
    return rows[0] || null;
};

const contarInscripcionesActivas = async (client, idCohorte, estados) => {
    const { rows } = await ejecutor(client).query(
        `SELECT COUNT(*)::int AS total
         FROM inscripcion
         WHERE id_cohorte = $1
           AND estado = ANY($2::varchar[])`,
        [idCohorte, estados]
    );
    return rows[0].total;
};

const contarInscripcionesActivasPorCohortes = async (idsCohorte, estados) => {
    if (idsCohorte.length === 0) return [];
    const { rows } = await pool.query(
        `SELECT id_cohorte, COUNT(*)::int AS total
         FROM inscripcion
         WHERE id_cohorte = ANY($1::int[])
           AND estado = ANY($2::varchar[])
         GROUP BY id_cohorte`,
        [idsCohorte, estados]
    );
    return rows;
};

const existeInscripcionActiva = async (client, idEstudiante, idCohorte, estados) => {
    const { rows } = await ejecutor(client).query(
        `SELECT 1
         FROM inscripcion
         WHERE id_estudiante = $1
           AND id_cohorte = $2
           AND estado = ANY($3::varchar[])`,
        [idEstudiante, idCohorte, estados]
    );
    return rows.length > 0;
};

const crearInscripcion = async (client, { id_estudiante, id_cohorte, estado }) => {
    const { rows } = await ejecutor(client).query(
        `INSERT INTO inscripcion (id_estudiante, id_cohorte, estado)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [id_estudiante, id_cohorte, estado]
    );
    return rows[0];
};

const listarPorEstudiante = async (idEstudiante) => {
    const { rows } = await pool.query(
        `SELECT i.*, c.nombre AS cohorte_nombre, c.modalidad
         FROM inscripcion i
         JOIN cohorte c ON c.id = i.id_cohorte
         WHERE i.id_estudiante = $1
         ORDER BY i.fecha_solicitud DESC`,
        [idEstudiante]
    );
    return rows;
};

module.exports = {
    obtenerCohorteParaActualizar,
    contarInscripcionesActivas,
    contarInscripcionesActivasPorCohortes,
    existeInscripcionActiva,
    crearInscripcion,
    listarPorEstudiante,
};