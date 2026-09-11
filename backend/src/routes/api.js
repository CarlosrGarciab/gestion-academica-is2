const express = require("express");

const authController = require("../controllers/authController");
const cursoController = require("../controllers/cursoController");

const router = express.Router();

router.post("/auth/register", authController.register);
router.post("/auth/login", authController.login);

router.get("/cursos", cursoController.listarCursos);
router.post("/cursos", cursoController.crearCurso);
router.put("/cursos/:id", cursoController.editarCurso);
router.patch("/cursos/:id/estado", cursoController.cambiarEstadoCurso);

module.exports = router;