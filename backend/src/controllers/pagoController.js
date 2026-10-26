const pagoService = require("../services/pagoService");
const { asyncHandler } = require("../middlewares/errorMiddleware");

const listarPendientes = asyncHandler(async (req, res) => {
    res.json(await pagoService.listarPendientes());
});

const registrarPago = asyncHandler(async (req, res) => {
    const pago = await pagoService.registrarPago(req.body);
    res.status(201).json(pago);
});

const listarMisPagos = asyncHandler(async (req, res) => {
    res.json(await pagoService.listarMisPagos(req.user.id));
});

module.exports = { listarPendientes, registrarPago, listarMisPagos };
