const usuarioModel = require('../models/usuarioModel')

const toDTO = (row) => 
    ({
        id : row.id,
        nombre : row.nombre,
        apellido : row.apellido,
        email : row.email,
        idRol : row.id_rol,
        activo : row.activo,
    });

const obtenerPorId = async (id) =>
{
    const usuario = await usuarioModel.buscarPorId(id);
    return usuario ? toDTO(usuario) : null;
}

const listarUsuariosActivos = async () =>
{
    const usuariosActivos = await usuarioModel.listarUsuariosActivos()
    return usuariosActivos.map(toDTO)
}

module.exports = {obtenerPorId, listarUsuariosActivos}
