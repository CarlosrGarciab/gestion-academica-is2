const nivelCursoService = require("../services/nivelCursoService");
const { asyncHandler } = require("../middlewares/errorMiddleware");

const listar = asyncHandler(async (req, res) => {
    const niveles = await nivelCursoService.listar();
    res.json(niveles);
});

const listarVigentes = asyncHandler(async (req, res) => {
    const niveles = await nivelCursoService.listarVigentes(req.query.fecha);
    res.json(niveles);
});

const crear = asyncHandler(async (req, res) => {
    const nivel = await nivelCursoService.crear(req.body);
    res.status(201).json(nivel);
});

module.exports = { listar, listarVigentes, crear };