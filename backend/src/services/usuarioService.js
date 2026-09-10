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

    if (!usuario)
    {
        throw new Error ('Usuario no encontrado');
    }
    return toDTO(usuario);
}

const listarUsuariosActivos = async () =>
{
    const usuariosActivos = await usuarioModel.listarUsuariosActivos();
    return usuariosActivos.map(toDTO);
};

const actualizarUsuario = async(id, {nombre, apellido, email}) =>
{
    if(email)
    {
        const existente = await usuarioModel.buscarPorEmail(email);
        if (existente && existente.id !== Number(id))
        {
            throw new Error('Email en uso');
        }
    }
    
    const actualizado = await usuarioModel.actualizarUsuario(id, {nombre, apellido, email})
    if (!actualizado)
    {
        throw new Error ('usuario no encontrado')
    }

    return toDTO(actualizado);
};

const cambiarActivo = async(id, activo) =>
{
    const existente = await usuarioModel.cambiarActivo(id, activo);

    if (!existente)
    {
        throw new Error ('Usuario no encontrado')
    }

    return {
        id : Number(id),
        activo : activo
    }
}


module.exports = {obtenerPorId, listarUsuariosActivos, actualizarUsuario, cambiarActivo}
