const express = require("express");

const authController = require("../controllers/authController");

const cursoController = require("../controllers/cursoController");

const {
  verifyToken,
  requireRole
} = require("../middleware/auth");

const router = express.Router();

router.post("/auth/register", authController.register);

router.post("/auth/login", authController.login);

router.get(
  "/cursos",
  verifyToken,
  requireRole(3),
  cursoController.listarCursos
);

router.post(
  "/cursos",
  verifyToken,
  requireRole(3),
  cursoController.crearCurso
);

router.put(
  "/cursos/:id",
  verifyToken,
  requireRole(3),
  cursoController.editarCurso
);

router.patch(
  "/cursos/:id/estado",
  verifyToken,
  requireRole(3),
  cursoController.cambiarEstadoCurso
);

module.exports = router;