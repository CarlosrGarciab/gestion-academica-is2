const router = require("express").Router();
const horasDocenteController = require("../controllers/horasDocenteController");
const { verifyToken, requireRole } = require("../middlewares/authMiddleware");

router.post(
    "/horas-docentes",
    verifyToken,
    requireRole("Docente"),
    horasDocenteController.registrarHoras
);
router.get(
    "/horas-docentes/mias",
    verifyToken,
    requireRole("Docente"),
    horasDocenteController.listarMisHoras
);
router.get(
    "/horas-docentes/cohortes",
    verifyToken,
    requireRole("Docente"),
    horasDocenteController.listarCohortes
);
router.get(
    "/horas-docentes/pendientes",
    verifyToken,
    requireRole("Administrador"),
    horasDocenteController.listarPendientes
);
router.get(
    "/horas-docentes/reporte",
    verifyToken,
    requireRole("Administrador"),
    horasDocenteController.obtenerReporte
);
router.patch(
    "/horas-docentes/:id/estado",
    verifyToken,
    requireRole("Administrador"),
    horasDocenteController.cambiarEstado
);

module.exports = router;
