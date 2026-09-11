const pool = require("../config/db");

const buscarPorEmail = async (email) => {
    const resultado = await pool.query(
        `SELECT *
         FROM usuario
         WHERE email = $1`,
        [email]
    );

    return resultado.rows[0];
};

const buscarIdRolPublico = async (idRol) => {
    const resultado = await pool.query(
        `SELECT id_rol
         FROM rol
         WHERE id_rol = $1
         AND activo = TRUE`,
        [idRol]
    );

    return resultado.rows[0]?.id_rol;
};

const crearUsuario = async ({
    nombre,
    apellido,
    email,
    id_rol,
    password_hash
}) => {
    const resultado = await pool.query(
        `INSERT INTO usuario
        (nombre, apellido, email, password_hash, id_rol)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *`,
        [
            nombre,
            apellido,
            email,
            password_hash,
            id_rol
        ]
    );

    return resultado.rows[0];
};

module.exports = {
    buscarPorEmail,
    buscarIdRolPublico,
    crearUsuario
};