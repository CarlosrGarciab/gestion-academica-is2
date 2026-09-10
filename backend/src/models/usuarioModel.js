const pool = require('../config/db')

const buscarPorId = async(id) =>
{
    const {rows} = await pool.query('SELECT * FROM USUARIO WHERE ID = $1', [id])
    return rows[0];
};

const listarUsuariosActivos = async () =>
{
    const{rows} = await pool.query(
        'SELECT * FROM USUARIO WHERE ACTIVO = TRUE ORDER BY ID')
    return rows ;
} ;

const buscarPorEmail = async (email) =>
{
    const{rows} = await pool.query(
        'SELECT * FROM USUARIO WHERE EMAIL = $1',[email])
    return rows[0];
}

const crearUsuario = async ({nombre, apellido, email, password_hash, id_rol}) =>
{
    const {rows} = await pool.query 
    (`INSERT INTO USUARIO(nombre, apellido, email, password_hash, id_rol)
        VALUES($1, $2, $3, $4, $5) RETURNING *`,
        [nombre, apellido, email, password_hash, id_rol]
    )
    return rows[0]
}

const cambiarActivo = async (id, activo) =>
{
    const {rowCount} = await pool.query (
        'UPDATE USUARIO SET ACTIVO = $1 WHERE ID = $2', [activo, id]
    );
    return rowCount > 0;
}

const actualizarUsuario = async (id, {nombre, apellido, email}) => 
{
    const {rows} = await pool.query (
        'UPDATE USUARIO SET (NOMBRE, APELLIDO, CORREO) = ($1, $2, $3) WHERE ID = $4 RETURNING *', 
        [nombre, apellido, email, id]
    );
    return rows[0];
}
 

module.exports = {buscarPorId, listarUsuariosActivos, crearUsuario, cambiarActivo, actualizarUsuario, buscarPorEmail}