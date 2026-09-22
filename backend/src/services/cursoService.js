const cursoModel = require("../models/cursoModel");
const { ApiError } = require("../middlewares/errorMiddleware");

const toDTO = (row) => ({
    id: row.id,
    nombre: row.nombre,
    descripcion: row.descripcion,
    area_conocimiento: row.area_conocimiento,
    activo: row.activo,
});

const listarCursos = async () => {
    const cursos = await cursoModel.obtenerCursos();
    return cursos.map(toDTO);
};

const obtenerPorId = async (id) => {
    const curso = await cursoModel.buscarPorId(id);
    if (!curso) {
        throw new ApiError(404, "Curso no encontrado");
    }
    return toDTO(curso);
};

const crearCurso = async (
    idUsuario,
    nombre,
    descripcion,
    areaConocimiento
) => {

    if (!nombre || nombre.trim() === "") {
        throw new ApiError(400, "El nombre del curso es obligatorio");
    }

    if (!descripcion || descripcion.trim() === "") {
        throw new ApiError(400, "La descripción del curso es obligatoria");
    }

    if (!areaConocimiento || areaConocimiento.trim() === "") {
        throw new ApiError(400, "El área de conocimiento es obligatoria");
    }

    const curso = await cursoModel.crearCurso(
        idUsuario,
        nombre,
        descripcion,
        areaConocimiento
    );

    return toDTO(curso);
};

const editarCurso = async (
    id,
    nombre,
    descripcion,
    areaConocimiento
) => {

    if (!nombre || nombre.trim() === "") {
        throw new ApiError(400, "El nombre del curso es obligatorio");
    }

    if (!descripcion || descripcion.trim() === "") {
        throw new ApiError(400, "La descripción del curso es obligatoria");
    }

    if (!areaConocimiento || areaConocimiento.trim() === "") {
        throw new ApiError(400, "El área de conocimiento es obligatoria");
    }

    const curso = await cursoModel.editarCurso(
        id,
        nombre,
        descripcion,
        areaConocimiento
    );

    if (!curso) {
        throw new ApiError(404, "Curso no encontrado");
    }

    return toDTO(curso);
};

const cambiarEstadoCurso = async (id, activo) => {
    const curso = await cursoModel.cambiarEstadoCurso(id, activo);

    if (!curso) {
        throw new ApiError(404, "Curso no encontrado");
    }

    return toDTO(curso);
};

module.exports = {
    listarCursos,
    obtenerPorId,
    crearCurso,
    editarCurso,
    cambiarEstadoCurso
};