const router = require("express").Router();
const nivelCursoController = require("../controllers/nivelCursoController");
const { verifyToken, requireRole } = require("../middlewares/authMiddleware");

router.get("/niveles/vigentes", verifyToken, nivelCursoController.listarVigentes);
router.get("/niveles", verifyToken, requireRole("Administrador"), nivelCursoController.listar);
router.post("/niveles", verifyToken, requireRole("Administrador"), nivelCursoController.crear);

module.exports = router;