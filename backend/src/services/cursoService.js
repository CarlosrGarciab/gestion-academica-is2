const cursoModel = require("../models/cursoModel");

const listarCursos = async () => {
    return await cursoModel.obtenerCursos();
};

const crearCurso = async (
    idUsuario,
    nombre,
    descripcion,
    areaConocimiento
) => {

    if (!nombre || nombre.trim() === "") {
        throw new Error("El nombre del curso es obligatorio");
    }

    if (!descripcion || descripcion.trim() === "") {
        throw new Error("La descripción del curso es obligatoria");
    }

    if (!areaConocimiento || areaConocimiento.trim() === "") {
        throw new Error("El área de conocimiento es obligatoria");
    }

    return await cursoModel.crearCurso(
        idUsuario,
        nombre,
        descripcion,
        areaConocimiento
    );
};

const editarCurso = async (
    id,
    nombre,
    descripcion,
    areaConocimiento
) => {

    if (!nombre || nombre.trim() === "") {
        throw new Error("El nombre del curso es obligatorio");
    }

    if (!descripcion || descripcion.trim() === "") {
        throw new Error("La descripción del curso es obligatoria");
    }

    if (!areaConocimiento || areaConocimiento.trim() === "") {
        throw new Error("El área de conocimiento es obligatoria");
    }

    return await cursoModel.editarCurso(
        id,
        nombre,
        descripcion,
        areaConocimiento
    );
};

const cambiarEstadoCurso = async (id, activo) => {
    return await cursoModel.cambiarEstadoCurso(id, activo);
};

module.exports = {
    listarCursos,
    crearCurso,
    editarCurso,
    cambiarEstadoCurso
};