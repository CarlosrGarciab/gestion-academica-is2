const router = require("express").Router();
const docenteCategoriaController = require("../controllers/docenteCategoriaController");
const { verifyToken, requireRole } = require("../middlewares/authMiddleware");

router.get("/docentes/categorias", verifyToken, requireRole("Administrador"), docenteCategoriaController.listarDocentesConCategoria);
router.get("/docentes/:id/historial", verifyToken, requireRole("Administrador"), docenteCategoriaController.historialDocente);
router.post("/docentes/:id/categoria", verifyToken, requireRole("Administrador"), docenteCategoriaController.asignarCategoria);

module.exports = router;