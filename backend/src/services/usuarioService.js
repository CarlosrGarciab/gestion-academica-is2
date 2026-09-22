const usuarioModel = require('../models/usuarioModel');
const { ApiError } = require('../middlewares/errorMiddleware');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const toDTO = (row) =>
    ({
        id: row.id,
        nombre: row.nombre,
        apellido: row.apellido,
        email: row.email,
        idRol: row.id_rol,
        activo: row.activo,
    });

const obtenerPorId = async (id) => {
    const usuario = await usuarioModel.buscarPorId(id);

    if (!usuario) {
        throw new ApiError(404, 'Usuario no encontrado');
    }
    return toDTO(usuario);
};

const listarUsuariosActivos = async () => {
    const usuariosActivos = await usuarioModel.listarUsuariosActivos();
    return usuariosActivos.map(toDTO);
};

const actualizarUsuario = async (id, { nombre, apellido, email }) => {
    if (email) {
        const emailNormalizado = email.trim().toLowerCase();
        if (!EMAIL_REGEX.test(emailNormalizado)) {
            throw new ApiError(400, 'Email invalido');
        }

        const existente = await usuarioModel.buscarPorEmail(emailNormalizado);
        if (existente && existente.id !== Number(id)) {
            throw new ApiError(400, 'Email en uso');
        }
    }

    const actualizado = await usuarioModel.actualizarUsuario(id, { nombre, apellido, email });
    if (!actualizado) {
        throw new ApiError(404, 'Usuario no encontrado');
    }

    return toDTO(actualizado);
};

const cambiarRol = async (id, idRol, actorId) => {
    if (actorId && Number(id) === Number(actorId)) {
        throw new ApiError(400, 'No puede cambiarse el rol a sí mismo');
    }

    const idRolAsignable = await usuarioModel.buscarIdRolAsignable(Number(idRol));
    if (!idRolAsignable) {
        throw new ApiError(400, 'El rol no esta disponible para asignacion');
    }

    const actualizado = await usuarioModel.actualizarRol(id, idRolAsignable);
    if (!actualizado) {
        throw new ApiError(404, 'Usuario no encontrado');
    }

    return toDTO(actualizado);
};

const cambiarActivo = async (id, activo, actorId) => {
    const usuario = await usuarioModel.buscarPorId(id);
    if (!usuario) {
        throw new ApiError(404, 'Usuario no encontrado');
    }

    if (!activo && Number(id) === Number(actorId)) {
        throw new ApiError(400, 'No puede desactivar su propia cuenta');
    }

    const rol = await usuarioModel.buscarNombreRol(usuario.id_rol);
    if (!activo && rol === 'Administrador') {
        throw new ApiError(400, 'No se puede desactivar un Administrador');
    }

    const desactivado = await usuarioModel.cambiarActivo(id, activo);
    if (!desactivado) {
        throw new ApiError(404, 'Usuario no encontrado');
    }

    return {
        id: Number(id),
        activo: activo,
    };
};

module.exports = { obtenerPorId, listarUsuariosActivos, actualizarUsuario, cambiarActivo, cambiarRol }