const pool = require("../config/db");

const listarCohortes = async () => {
    const resultado = await pool.query(`
        SELECT c.*, cu.nombre AS curso_nombre, u.nombre AS docente_nombre, u.apellido AS docente_apellido
        FROM cohorte c
        JOIN curso cu ON cu.id = c.id_curso
        JOIN usuario u ON u.id = c.id_docente
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
    costo_inscripcion,
    costo_cuota_mensual,
    tarifa_hora_docente,
}) => {
    const resultado = await pool.query(
        `INSERT INTO cohorte
        (id_curso, id_docente, nombre, fecha_inicio, fecha_fin, modalidad,
         cupo_fisico, link_acceso, costo_inscripcion, costo_cuota_mensual, tarifa_hora_docente)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
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
            costo_inscripcion,
            costo_cuota_mensual,
            tarifa_hora_docente,
        ]
    );

    return resultado.rows[0];
};

module.exports = {
    listarCohortes,
    crearCohorte,
};