const pool = require("../config/db");

const listarCohortes = async () => {
    const resultado = await pool.query(`
        SELECT c.*, cu.nombre AS curso_nombre, u.nombre AS docente_nombre, u.apellido AS docente_apellido,
               n.precio_inscripcion, n.costo_cuota_mensual, cd.tarifa_hora
        FROM cohorte c
        JOIN curso cu ON cu.id = c.id_curso
        JOIN usuario u ON u.id = c.id_docente
        LEFT JOIN LATERAL (
            SELECT np.precio_inscripcion, np.costo_cuota_mensual
            FROM nivel_curso np
            WHERE np.nombre = cu.nivel
              AND np.vigencia_desde <= CURRENT_DATE
              AND (np.vigencia_hasta IS NULL OR np.vigencia_hasta >= CURRENT_DATE)
            ORDER BY np.vigencia_desde DESC
            LIMIT 1
        ) n ON TRUE
        LEFT JOIN LATERAL (
            SELECT cd2.tarifa_hora
            FROM docente_categoria dc
            JOIN categoria_docente cd2 ON cd2.id = dc.id_categoria
            WHERE dc.id_usuario = c.id_docente
              AND dc.desde <= CURRENT_DATE
              AND (dc.hasta IS NULL OR dc.hasta >= CURRENT_DATE)
            ORDER BY dc.desde DESC
            LIMIT 1
        ) cd ON TRUE
        ORDER BY c.id
    `);

    return resultado.rows;
};

const crearCohorte = async ({
    id_curso,
    id_docente,
    nombre,
    fecha_inicio,
    fecha_fin,
    modalidad,
    cupo_fisico,
    link_acceso,
}) => {
    const resultado = await pool.query(
        `INSERT INTO cohorte
        (id_curso, id_docente, nombre, fecha_inicio, fecha_fin, modalidad,
         cupo_fisico, link_acceso)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *`,
        [
            id_curso,
            id_docente,
            nombre,
            fecha_inicio,
            fecha_fin,
            modalidad,
            cupo_fisico,
            link_acceso,
        ]
    );

    return resultado.rows[0];
};

module.exports = {
    listarCohortes,
    crearCohorte,
};