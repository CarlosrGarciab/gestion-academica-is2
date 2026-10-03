const pool = require("../config/db");

const buscarPorId = async (id) => {
    const resultado = await pool.query(
        `SELECT c.*, n.precio_inscripcion, n.costo_cuota_mensual
         FROM curso c
         LEFT JOIN LATERAL (
             SELECT np.precio_inscripcion, np.costo_cuota_mensual
             FROM nivel_curso np
             WHERE np.nombre = c.nivel
               AND np.vigencia_desde <= CURRENT_DATE
               AND (np.vigencia_hasta IS NULL OR np.vigencia_hasta >= CURRENT_DATE)
             ORDER BY np.vigencia_desde DESC
             LIMIT 1
         ) n ON TRUE
         WHERE c.id = $1`,
        [id]
    );

    return resultado.rows[0];
};

const obtenerCursos = async () => {
    const resultado = await pool.query(
        `SELECT c.*, n.precio_inscripcion, n.costo_cuota_mensual
         FROM curso c
         LEFT JOIN LATERAL (
             SELECT np.precio_inscripcion, np.costo_cuota_mensual
             FROM nivel_curso np
             WHERE np.nombre = c.nivel
               AND np.vigencia_desde <= CURRENT_DATE
               AND (np.vigencia_hasta IS NULL OR np.vigencia_hasta >= CURRENT_DATE)
             ORDER BY np.vigencia_desde DESC
             LIMIT 1
         ) n ON TRUE
         ORDER BY c.id`
    );

    return resultado.rows;
};

const crearCurso = async (
    idUsuario,
    nombre,
    descripcion,
    areaConocimiento,
    nivel
) => {
    const resultado = await pool.query(
        `INSERT INTO curso
        (id_usuario, nombre, descripcion, area_conocimiento, nivel)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *`,
        [idUsuario, nombre, descripcion, areaConocimiento, nivel]
    );

    return resultado.rows[0];
};

const editarCurso = async (
    id,
    nombre,
    descripcion,
    areaConocimiento,
    nivel
) => {
    const resultado = await pool.query(
        `UPDATE curso
         SET nombre = $1,
             descripcion = $2,
             area_conocimiento = $3,
             nivel = $4
         WHERE id = $5
         RETURNING *`,
        [nombre, descripcion, areaConocimiento, nivel, id]
    );

    return resultado.rows[0];
};

const cambiarEstadoCurso = async (id, activo) => {
    const resultado = await pool.query(
        `UPDATE curso
         SET activo = $1
         WHERE id = $2
         RETURNING *`,
        [activo, id]
    );

    return resultado.rows[0];
};

module.exports = {
    obtenerCursos,
    crearCurso,
    editarCurso,
    cambiarEstadoCurso,
    buscarPorId
};