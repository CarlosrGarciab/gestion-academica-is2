const categoriaDocenteService = require("../services/categoriaDocenteService");
const { asyncHandler } = require("../middlewares/errorMiddleware");

const listar = asyncHandler(async (req, res) => {
    const categorias = await categoriaDocenteService.listar();
    res.json(categorias);
});

const listarVigentes = asyncHandler(async (req, res) => {
    const categorias = await categoriaDocenteService.listarVigentes(req.query.fecha);
    res.json(categorias);
});

const crear = asyncHandler(async (req, res) => {
    const categoria = await categoriaDocenteService.crear(req.body);
    res.status(201).json(categoria);
});

module.exports = { listar, listarVigentes, crear };