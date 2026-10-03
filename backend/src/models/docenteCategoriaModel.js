const pool = require("../config/db");

const asignar = async ({ id_usuario, id_categoria, desde, hasta }) => {
    const diaAnterior = new Date(`${desde}T00:00:00`);
    diaAnterior.setDate(diaAnterior.getDate() - 1);
    const prevHasta = `${diaAnterior.getFullYear()}-${String(diaAnterior.getMonth() + 1).padStart(2, '0')}-${String(diaAnterior.getDate()).padStart(2, '0')}`;

    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        await client.query(
            `UPDATE docente_categoria
             SET hasta = $1
             WHERE id_usuario = $2 AND hasta IS NULL`,
            [prevHasta, id_usuario]
        );
        const { rows } = await client.query(
            `INSERT INTO docente_categoria (id_usuario, id_categoria, desde, hasta)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [id_usuario, id_categoria, desde, hasta]
        );
        await client.query("COMMIT");
        return rows[0];
    } catch (err) {
        await client.query("ROLLBACK");
        throw err;
    } finally {
        client.release();
    }
};

const historialPorDocente = async (idUsuario) => {
    const { rows } = await pool.query(
        `SELECT dc.*, cd.nombre AS categoria_nombre, cd.tarifa_hora
         FROM docente_categoria dc
         JOIN categoria_docente cd ON cd.id = dc.id_categoria
         WHERE dc.id_usuario = $1
         ORDER BY dc.desde DESC`,
        [idUsuario]
    );
    return rows;
};

const asignacionVigente = async (idUsuario, fecha) => {
    const { rows } = await pool.query(
        `SELECT dc.*, cd.nombre AS categoria_nombre, cd.tarifa_hora
         FROM docente_categoria dc
         JOIN categoria_docente cd ON cd.id = dc.id_categoria
         WHERE dc.id_usuario = $1
           AND dc.desde <= $2::date
           AND (dc.hasta IS NULL OR dc.hasta >= $2::date)
         ORDER BY dc.desde DESC
         LIMIT 1`,
        [idUsuario, fecha]
    );
    return rows[0] || null;
};

const listarDocentesConCategoria = async (fecha) => {
    const { rows } = await pool.query(
        `SELECT u.id, u.nombre, u.apellido, u.email, u.activo,
                dc.id_categoria, dc.desde AS categoria_desde, dc.hasta AS categoria_hasta,
                cd.nombre AS categoria_nombre, cd.tarifa_hora
         FROM usuario u
         JOIN rol r ON r.id_rol = u.id_rol
         LEFT JOIN docente_categoria dc
                ON dc.id_usuario = u.id
               AND dc.desde <= $1::date
               AND (dc.hasta IS NULL OR dc.hasta >= $1::date)
         LEFT JOIN categoria_docente cd ON cd.id = dc.id_categoria
         WHERE r.nombre = 'Docente'
           AND u.activo = TRUE
         ORDER BY u.id`,
        [fecha]
    );
    return rows;
};

const buscarCategoria = async (idCategoria) => {
    const { rows } = await pool.query(
        "SELECT * FROM categoria_docente WHERE id = $1",
        [idCategoria]
    );
    return rows[0] || null;
};

module.exports = {
    asignar,
    historialPorDocente,
    asignacionVigente,
    listarDocentesConCategoria,
    buscarCategoria,
};