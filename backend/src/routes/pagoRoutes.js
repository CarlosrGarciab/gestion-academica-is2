const router = require("express").Router();
const pagoController = require("../controllers/pagoController");
const { verifyToken, requireRole } = require("../middlewares/authMiddleware");

router.get("/pagos/pendientes", verifyToken, requireRole("Administrador"), pagoController.listarPendientes);
router.post("/pagos", verifyToken, requireRole("Administrador"), pagoController.registrarPago);
router.get("/pagos/mios", verifyToken, requireRole("Estudiante"), pagoController.listarMisPagos);

module.exports = router;
