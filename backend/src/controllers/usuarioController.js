const usuarioService = require('../services/usuarioService');
const { asyncHandler, ApiError } = require('../middlewares/errorMiddleware');

const getById = asyncHandler(async (req, res) => {
    const esPropio = Number(req.user.id) === Number(req.params.id);
    if (!esPropio && req.user.rol !== 'Administrador') {
        throw new ApiError(403, 'No puede ver el perfil de otro usuario');
    }

    const usuario = await usuarioService.obtenerPorId(req.params.id);
    res.status(200).json(usuario);
});

const listarUsuariosActivos = asyncHandler(async (req, res) => {
    const usuariosActivos = await usuarioService.listarUsuariosActivos();
    res.status(200).json(usuariosActivos);
});

const actualizar = asyncHandler(async (req, res) => {
    const esPropio = Number(req.user.id) === Number(req.params.id);
    if (!esPropio) {
        throw new ApiError(403, 'No puede editar el perfil de otro usuario');
    }

    const usuario = await usuarioService.actualizarUsuario(req.params.id, req.body);
    res.status(200).json(usuario);
});

const cambiarActivo = asyncHandler(async (req, res) => {
    const { activo } = req.body;
    const resultado = await usuarioService.cambiarActivo(req.params.id, activo, req.user.id);
    res.status(200).json(resultado);
});

const cambiarRol = asyncHandler(async (req, res) => {
    const { idRol } = req.body;
    const usuario = await usuarioService.cambiarRol(req.params.id, idRol);
    res.status(200).json(usuario);
});

module.exports = { getById, listarUsuariosActivos, actualizar, cambiarActivo, cambiarRol };