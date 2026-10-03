const cursoModel = require("../models/cursoModel");
const { ApiError } = require("../middlewares/errorMiddleware");

const NIVELES = ["principiante", "intermedio", "avanzado"];

const toDTO = (row) => ({
    id: row.id,
    nombre: row.nombre,
    descripcion: row.descripcion,
    area_conocimiento: row.area_conocimiento,
    nivel: row.nivel,
    precioInscripcion: row.precio_inscripcion === null || row.precio_inscripcion === undefined
        ? null
        : Number(row.precio_inscripcion),
    costoCuotaMensual: row.costo_cuota_mensual === null || row.costo_cuota_mensual === undefined
        ? null
        : Number(row.costo_cuota_mensual),
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

const validarCurso = ({ nombre, descripcion, area_conocimiento, nivel }) => {
    if (!nombre || nombre.trim() === "") {
        throw new ApiError(400, "El nombre del curso es obligatorio");
    }

    if (!descripcion || descripcion.trim() === "") {
        throw new ApiError(400, "La descripción del curso es obligatoria");
    }

    if (!areaConocimiento || areaConocimiento.trim() === "") {
        throw new ApiError(400, "El área de conocimiento es obligatoria");
    }

    if (!nivel || !NIVELES.includes(nivel.trim().toLowerCase())) {
        throw new ApiError(400, "El nivel del curso debe ser principiante, intermedio o avanzado");
    }
};

const crearCurso = async (
    idUsuario,
    nombre,
    descripcion,
    areaConocimiento,
    nivel
) => {
    validarCurso({ nombre, descripcion, area_conocimiento, nivel });

    const curso = await cursoModel.crearCurso(
        idUsuario,
        nombre.trim(),
        descripcion.trim(),
        areaConocimiento.trim(),
        nivel.trim().toLowerCase()
    );

    return toDTO(curso);
};

const editarCurso = async (
    id,
    nombre,
    descripcion,
    areaConocimiento,
    nivel
) => {
    validarCurso({ nombre, descripcion, area_conocimiento, nivel });

    const curso = await cursoModel.editarCurso(
        id,
        nombre.trim(),
        descripcion.trim(),
        areaConocimiento.trim(),
        nivel.trim().toLowerCase()
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