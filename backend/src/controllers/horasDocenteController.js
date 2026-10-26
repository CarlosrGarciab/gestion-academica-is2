const horasDocenteService = require("../services/horasDocenteService");
const { asyncHandler } = require("../middlewares/errorMiddleware");

const registrarHoras = asyncHandler(async (req, res) => {
    const registro = await horasDocenteService.registrarHoras({
        ...req.body,
        idDocente: req.user?.id,
    });
    res.status(201).json(registro);
});

const listarMisHoras = asyncHandler(async (req, res) => {
    const registros = await horasDocenteService.listarMisHoras(req.user?.id);
    res.json(registros);
});

const listarCohortes = asyncHandler(async (req, res) => {
    const cohortes = await horasDocenteService.listarCohortesDelDocente(req.user?.id);
    res.json(cohortes);
});

const listarPendientes = asyncHandler(async (req, res) => {
    const registros = await horasDocenteService.listarPendientes();
    res.json(registros);
});

const listarHistorial = asyncHandler(async (req, res) => {
    const registros = await horasDocenteService.listarHistorial();
    res.json(registros);
});

const obtenerReporte = asyncHandler(async (req, res) => {
    const { desde, hasta, idDocente, estado } = req.query;
    const reporte = await horasDocenteService.obtenerReporte({
        desde,
        hasta,
        idDocente,
        estado,
    });
    res.json(reporte);
});

const cambiarEstado = asyncHandler(async (req, res) => {
    const registro = await horasDocenteService.cambiarEstado(
        req.params.id,
        req.body.estado
    );
    res.json(registro);
});

module.exports = {
    registrarHoras,
    listarMisHoras,
    listarCohortes,
    listarPendientes,
    listarHistorial,
    obtenerReporte,
    cambiarEstado,
};
