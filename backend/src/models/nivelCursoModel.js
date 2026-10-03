const pool = require("../config/db");

const NIVELES = ["principiante", "intermedio", "avanzado"];

const listar = async () => {
    const { rows } = await pool.query(
        "SELECT * FROM nivel_curso ORDER BY nombre, vigencia_desde"
    );
    return rows;
};

const listarVigentes = async (fecha) => {
    const { rows } = await pool.query(
        `SELECT n1.*
         FROM nivel_curso n1
         JOIN (
             SELECT nombre, MAX(vigencia_desde) AS vigencia_desde
             FROM nivel_curso
             WHERE vigencia_desde <= $1::date
               AND (vigencia_hasta IS NULL OR vigencia_hasta >= $1::date)
             GROUP BY nombre
         ) v ON v.nombre = n1.nombre AND v.vigencia_desde = n1.vigencia_desde
         ORDER BY CASE n1.nombre
             WHEN 'principiante' THEN 1
             WHEN 'intermedio' THEN 2
             ELSE 3
         END`,
        [fecha]
    );
    return rows;
};

const buscarVigentePorNombre = async (nombre, fecha) => {
    const { rows } = await pool.query(
        `SELECT *
         FROM nivel_curso
         WHERE nombre = $1
           AND vigencia_desde <= $2::date
           AND (vigencia_hasta IS NULL OR vigencia_hasta >= $2::date)
         ORDER BY vigencia_desde DESC
         LIMIT 1`,
        [nombre, fecha]
    );
    return rows[0] || null;
};

const crear = async ({ nombre, precio_inscripcion, costo_cuota_mensual, vigencia_desde, vigencia_hasta }) => {
    const diaAnterior = new Date(`${vigencia_desde}T00:00:00`);
    diaAnterior.setDate(diaAnterior.getDate() - 1);
    const prevHasta = `${diaAnterior.getFullYear()}-${String(diaAnterior.getMonth() + 1).padStart(2, '0')}-${String(diaAnterior.getDate()).padStart(2, '0')}`;

    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        await client.query(
            `UPDATE nivel_curso
             SET vigencia_hasta = $1
             WHERE nombre = $2 AND vigencia_hasta IS NULL`,
            [prevHasta, nombre]
        );
        const { rows } = await client.query(
            `INSERT INTO nivel_curso (nombre, precio_inscripcion, costo_cuota_mensual, vigencia_desde, vigencia_hasta)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [nombre, precio_inscripcion, costo_cuota_mensual, vigencia_desde, vigencia_hasta]
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

const buscarUltimoDesde = async (nombre) => {
    const { rows } = await pool.query(
        `SELECT MAX(vigencia_desde) AS max_desde
         FROM nivel_curso
         WHERE nombre = $1`,
        [nombre]
    );
    return rows[0]?.max_desde || null;
};

module.exports = { NIVELES, listar, listarVigentes, buscarVigentePorNombre, buscarUltimoDesde, crear };