const categoriaDocenteModel = require("../models/categoriaDocenteModel");
const { ApiError } = require("../middlewares/errorMiddleware");

const formatearFecha = (fecha) => {
    if (!fecha) return null;
    if (fecha instanceof Date) {
        return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`;
    }
    return String(fecha).slice(0, 10);
};

const toDTO = (row) => ({
    id: row.id,
    nombre: row.nombre,
    tarifaHora: Number(row.tarifa_hora),
    vigenciaDesde: formatearFecha(row.vigencia_desde),
    vigenciaHasta: formatearFecha(row.vigencia_hasta),
});

const hoy = () => new Date().toISOString().slice(0, 10);

const listar = async () => {
    const categorias = await categoriaDocenteModel.listar();
    return categorias.map(toDTO);
};

const listarVigentes = async (fecha = hoy()) => {
    const categorias = await categoriaDocenteModel.listarVigentes(fecha);
    return categorias.map(toDTO);
};

const obtenerTarifaVigente = async (nombre, fecha = hoy()) => {
    const categoria = await categoriaDocenteModel.buscarVigentePorNombre(nombre, fecha);
    if (!categoria) {
        throw new ApiError(404, `No hay tarifa vigente para la categoria ${nombre}`);
    }
    return Number(categoria.tarifa_hora);
};

const crear = async ({ nombre, tarifaHora, vigenciaDesde, vigenciaHasta }) => {
    const nombreNormalizado = nombre?.trim().toLowerCase();
    if (!categoriaDocenteModel.CATEGORIAS.includes(nombreNormalizado)) {
        throw new ApiError(400, "La categoria debe ser principiante, intermedio o avanzado");
    }

    const tarifa = Number(tarifaHora);
    if (!Number.isFinite(tarifa) || tarifa <= 0) {
        throw new ApiError(400, "La tarifa por hora debe ser mayor a 0");
    }

    if (!vigenciaDesde) {
        throw new ApiError(400, "La fecha de inicio de vigencia es obligatoria");
    }
    if (vigenciaHasta && new Date(vigenciaHasta) < new Date(vigenciaDesde)) {
        throw new ApiError(400, "La fecha de fin de vigencia no puede ser anterior a la de inicio");
    }

    const ultimoDesde = await categoriaDocenteModel.buscarUltimoDesde(nombreNormalizado);
    if (ultimoDesde && new Date(vigenciaDesde) <= new Date(ultimoDesde)) {
        throw new ApiError(400, `Ya hay una tarifa registrada para la categoria ${nombreNormalizado} desde ${formatearFecha(ultimoDesde)}; la nueva vigencia debe comenzar despues`);
    }

    const categoria = await categoriaDocenteModel.crear({
        nombre: nombreNormalizado,
        tarifa_hora: tarifa,
        vigencia_desde: vigenciaDesde,
        vigencia_hasta: vigenciaHasta || null,
    });

    return toDTO(categoria);
};

module.exports = { listar, listarVigentes, obtenerTarifaVigente, crear };