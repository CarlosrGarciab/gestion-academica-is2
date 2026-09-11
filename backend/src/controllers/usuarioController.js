const usuarioService = require('../services/usuarioService')

const getById = async (req, res) => {
  try {
    const usuario = await usuarioService.obtenerPorId(req.params.id);
    res.status(200).json(usuario);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

const listarUsuariosActivos = async (req, res) =>
{
    try
    {
        const usuariosActivos = await usuarioService.listarUsuariosActivos();
        res.status(200).json(usuariosActivos);
    } catch (error)
    {
        res.status(500).json({message : error.message});
    }
};

const actualizar = async (req, res) => {
  try {
    const esOwner = req.user.id === Number(req.params.id)

    if (!esOwner)
    {
      return res.status(403).json({ message: 'No puede editar el perfil de otro usuario' });
    }

    const usuario = await usuarioService.actualizarUsuario(req.params.id, req.body);
    res.status(200).json(usuario);
  } catch (error) {
    const status = error.message === 'Usuario no encontrado' ? 404 : 400;
    res.status(status).json({ message: error.message });
  }
};

const cambiarActivo = async (req, res) => {
  try {
    const { activo } = req.body;
    const resultado = await usuarioService.cambiarActivo(req.params.id, activo);
    res.status(200).json(resultado);
  } catch (error) {
    const status = error.message === 'Usuario no encontrado' ? 404 : 400;
    res.status(status).json({ message: error.message });
  }
};

module.exports = { getById, listarUsuariosActivos, actualizar, cambiarActivo };