const docenteCategoriaService = require("../services/docenteCategoriaService");
const { asyncHandler } = require("../middlewares/errorMiddleware");

const listarDocentesConCategoria = asyncHandler(async (req, res) => {
    const docentes = await docenteCategoriaService.listarDocentesConCategoria(req.query.fecha);
    res.json(docentes);
});

const historialDocente = asyncHandler(async (req, res) => {
    const historial = await docenteCategoriaService.historialDocente(req.params.id, req.query.fecha);
    res.json(historial);
});

const asignarCategoria = asyncHandler(async (req, res) => {
    const { idCategoria, desde, hasta } = req.body;
    const asignacion = await docenteCategoriaService.asignarCategoria({
        idDocente: req.params.id,
        idCategoria,
        desde,
        hasta,
    });
    res.status(201).json(asignacion);
});

module.exports = { listarDocentesConCategoria, historialDocente, asignarCategoria };