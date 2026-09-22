const cohorteService = require("../services/cohorteService");
const { asyncHandler } = require("../middlewares/errorMiddleware");

const listarCohortes = asyncHandler(async (req, res) => {
    const cohortes = await cohorteService.listarCohortes();
    res.json(cohortes);
});

const crearCohorte = asyncHandler(async (req, res) => {
    const cohorte = await cohorteService.crearCohorte(req.body);
    res.status(201).json(cohorte);
});

module.exports = {
    listarCohortes,
    crearCohorte,
};