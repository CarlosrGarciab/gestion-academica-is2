const nivelCursoModel = require("../models/nivelCursoModel");
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
    precioInscripcion: Number(row.precio_inscripcion),
    costoCuotaMensual: Number(row.costo_cuota_mensual),
    vigenciaDesde: formatearFecha(row.vigencia_desde),
    vigenciaHasta: formatearFecha(row.vigencia_hasta),
});

const hoy = () => new Date().toISOString().slice(0, 10);

const listar = async () => {
    const niveles = await nivelCursoModel.listar();
    return niveles.map(toDTO);
};

const listarVigentes = async (fecha = hoy()) => {
    const niveles = await nivelCursoModel.listarVigentes(fecha);
    return niveles.map(toDTO);
};

const obtenerPrecioVigente = async (nombre, fecha = hoy()) => {
    const nivel = await nivelCursoModel.buscarVigentePorNombre(nombre, fecha);
    if (!nivel) {
        throw new ApiError(404, `No hay precio de inscripcion vigente para el nivel ${nombre}`);
    }
    return Number(nivel.precio_inscripcion);
};

const crear = async ({ nombre, precioInscripcion, costoCuotaMensual, vigenciaDesde, vigenciaHasta }) => {
    const nombreNormalizado = nombre?.trim().toLowerCase();
    if (!nivelCursoModel.NIVELES.includes(nombreNormalizado)) {
        throw new ApiError(400, "El nivel debe ser principiante, intermedio o avanzado");
    }

    const precio = Number(precioInscripcion);
    if (!Number.isFinite(precio) || precio <= 0) {
        throw new ApiError(400, "El precio de inscripcion debe ser mayor a 0");
    }

    const cuota = Number(costoCuotaMensual);
    if (!Number.isFinite(cuota) || cuota <= 0) {
        throw new ApiError(400, "La cuota mensual debe ser mayor a 0");
    }

    if (!vigenciaDesde) {
        throw new ApiError(400, "La fecha de inicio de vigencia es obligatoria");
    }
    if (vigenciaHasta && new Date(vigenciaHasta) < new Date(vigenciaDesde)) {
        throw new ApiError(400, "La fecha de fin de vigencia no puede ser anterior a la de inicio");
    }

    const ultimoDesde = await nivelCursoModel.buscarUltimoDesde(nombreNormalizado);
    if (ultimoDesde && new Date(vigenciaDesde) <= new Date(ultimoDesde)) {
        throw new ApiError(400, `Ya hay un arancel registrado para el nivel ${nombreNormalizado} desde ${formatearFecha(ultimoDesde)}; la nueva vigencia debe comenzar despues`);
    }

    const nivel = await nivelCursoModel.crear({
        nombre: nombreNormalizado,
        precio_inscripcion: precio,
        costo_cuota_mensual: cuota,
        vigencia_desde: vigenciaDesde,
        vigencia_hasta: vigenciaHasta || null,
    });

    return toDTO(nivel);
};

module.exports = { listar, listarVigentes, obtenerPrecioVigente, crear };