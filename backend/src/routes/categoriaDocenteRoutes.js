const router = require("express").Router();
const categoriaDocenteController = require("../controllers/categoriaDocenteController");
const { verifyToken, requireRole } = require("../middlewares/authMiddleware");

router.get("/categorias-docente/vigentes", verifyToken, categoriaDocenteController.listarVigentes);
router.get("/categorias-docente", verifyToken, requireRole("Administrador"), categoriaDocenteController.listar);
router.post("/categorias-docente", verifyToken, requireRole("Administrador"), categoriaDocenteController.crear);

module.exports = router;