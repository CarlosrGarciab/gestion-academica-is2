const router = require("express").Router();
const dashboardController = require("../controllers/dashboardController");
const { verifyToken, requireRole } = require("../middlewares/authMiddleware");

router.get(
    "/dashboard",
    verifyToken,
    requireRole("Administrador"),
    dashboardController.obtenerResumen
);

module.exports = router;
