const docenteCategoriaModel = require("../models/docenteCategoriaModel");
const categoriaDocenteModel = require("../models/categoriaDocenteModel");
const usuarioService = require("./usuarioService");
const { ApiError } = require("../middlewares/errorMiddleware");

const formatearFecha = (fecha) => {
    if (!fecha) return null;
    if (fecha instanceof Date) {
        return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`;
    }
    return String(fecha).slice(0, 10);
};

const hoy = () => new Date().toISOString().slice(0, 10);

const toHistorialDTO = (row) => ({
    id: row.id,
    idCategoria: row.id_categoria,
    categoriaNombre: row.categoria_nombre,
    tarifaHora: row.tarifa_hora === null || row.tarifa_hora === undefined ? null : Number(row.tarifa_hora),
    desde: formatearFecha(row.desde),
    hasta: formatearFecha(row.hasta),
});

const toDocenteDTO = (row) => ({
    id: row.id,
    nombre: row.nombre,
    apellido: row.apellido,
    email: row.email,
    idCategoria: row.id_categoria,
    categoriaNombre: row.categoria_nombre,
    tarifaHora: row.tarifa_hora === null || row.tarifa_hora === undefined ? null : Number(row.tarifa_hora),
    desde: formatearFecha(row.categoria_desde),
    hasta: formatearFecha(row.categoria_hasta),
});

const listarDocentesConCategoria = async (fecha = hoy()) => {
    const docentes = await docenteCategoriaModel.listarDocentesConCategoria(fecha);
    return docentes.map(toDocenteDTO);
};

const historialDocente = async (idUsuario, fecha = hoy()) => {
    const asignacion = await docenteCategoriaModel.asignacionVigente(idUsuario, fecha);
    const historial = await docenteCategoriaModel.historialPorDocente(idUsuario);

    return {
        idUsuario: Number(idUsuario),
        categoriaActual: asignacion ? toHistorialDTO(asignacion) : null,
        historial: historial.map(toHistorialDTO),
    };
};

const asignarCategoria = async ({ idDocente, idCategoria, desde, hasta }) => {
    if (!desde) {
        throw new ApiError(400, "La fecha de inicio de la asignacion es obligatoria");
    }
    if (hasta && new Date(hasta) < new Date(desde)) {
        throw new ApiError(400, "La fecha de fin no puede ser anterior a la de inicio");
    }

    const docente = await usuarioService.obtenerPorId(idDocente);
    if (docente.idRol !== 2) {
        throw new ApiError(400, "El usuario no tiene perfil de Docente");
    }

    const categoria = await docenteCategoriaModel.buscarCategoria(Number(idCategoria));
    if (!categoria) {
        throw new ApiError(400, "La categoria seleccionada no existe");
    }

    const asignacion = await docenteCategoriaModel.asignar({
        id_usuario: Number(idDocente),
        id_categoria: Number(idCategoria),
        desde,
        hasta: hasta || null,
    });

    return toHistorialDTO({
        ...asignacion,
        categoria_nombre: categoria.nombre,
        tarifa_hora: categoria.tarifa_hora,
    });
};

module.exports = { listarDocentesConCategoria, historialDocente, asignarCategoria };