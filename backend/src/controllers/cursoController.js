const cursoService = require("../services/cursoService");
const { asyncHandler } = require("../middlewares/errorMiddleware");

const listarCursos = asyncHandler(async (req, res) => {
    const cursos = await cursoService.listarCursos();
    res.json(cursos);
});

const crearCurso = asyncHandler(async (req, res) => {
    const {
        nombre,
        descripcion,
        area_conocimiento
    } = req.body;

    const curso = await cursoService.crearCurso(
        req.user.id,
        nombre,
        descripcion,
        area_conocimiento
    );

    res.status(201).json(curso);
});

const editarCurso = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const {
        nombre,
        descripcion,
        area_conocimiento
    } = req.body;

    const curso = await cursoService.editarCurso(
        id,
        nombre,
        descripcion,
        area_conocimiento
    );

    res.json(curso);
});

const cambiarEstadoCurso = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { activo } = req.body;

    const curso = await cursoService.cambiarEstadoCurso(id, activo);
    res.json(curso);
});

module.exports = {
    listarCursos,
    crearCurso,
    editarCurso,
    cambiarEstadoCurso
};