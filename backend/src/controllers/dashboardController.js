const dashboardService = require("../services/dashboardService");
const { asyncHandler } = require("../middlewares/errorMiddleware");

const obtenerResumen = asyncHandler(async (req, res) => {
    res.json(await dashboardService.obtenerResumen());
});

module.exports = { obtenerResumen };
