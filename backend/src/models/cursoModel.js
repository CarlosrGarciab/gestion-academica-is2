const pool = require("../config/db");

const buscarPorId = async (id) => {
    const resultado = await pool.query(
        "SELECT * FROM curso WHERE id = $1",
        [id]
    );

    return resultado.rows[0];
};

const obtenerCursos = async () => {
    const resultado = await pool.query(
        "SELECT * FROM curso ORDER BY id"
    );

    return resultado.rows;
};

const crearCurso = async (
    idUsuario,
    nombre,
    descripcion,
    areaConocimiento
) => {
    const resultado = await pool.query(
        `INSERT INTO curso
        (id_usuario, nombre, descripcion, area_conocimiento)
        VALUES ($1, $2, $3, $4)
        RETURNING *`,
        [idUsuario, nombre, descripcion, areaConocimiento]
    );

    return resultado.rows[0];
};

const editarCurso = async (
    id,
    nombre,
    descripcion,
    areaConocimiento
) => {
    const resultado = await pool.query(
        `UPDATE curso
         SET nombre = $1,
             descripcion = $2,
             area_conocimiento = $3
         WHERE id = $4
         RETURNING *`,
        [nombre, descripcion, areaConocimiento, id]
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