const authService = require('../services/authService')
const { asyncHandler } = require('../middlewares/errorMiddleware')

const register = asyncHandler(async (req, res) => {
    const usuario = await authService.registrarUsuario(req.body);
    res.status(201).json(usuario);
});

const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const resultado = await authService.login(email, password);
    res.status(200).json(resultado);
});

module.exports = {
    register,
    login,
};