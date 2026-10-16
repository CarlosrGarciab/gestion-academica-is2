const horasDocenteModel = require("../models/horasDocenteModel");
const docenteCategoriaModel = require("../models/docenteCategoriaModel");
const { ApiError } = require("../middlewares/errorMiddleware");

const ESTADOS = ["pendiente", "aprobado", "rechazado"];
const ESTADOS_LIQUIDABLES = ["aprobado"];

const esNumeroPositivo = (valor) => {
    const numero = Number(valor);
    return Number.isFinite(numero) && numero > 0;
};

const esFechaValida = (valor) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(valor || "")) return false;
    const fecha = new Date(`${valor}T00:00:00Z`);
    return !Number.isNaN(fecha.getTime()) && fecha.toISOString().slice(0, 10) === valor;
};

const formatearFecha = (fecha) => {
    if (fecha instanceof Date) return fecha.toISOString().slice(0, 10);
    return String(fecha).slice(0, 10);
};

const toDTO = (row) => ({
    id: row.id,
    idDocente: row.id_docente,
    idCohorte: row.id_cohorte,
    cohorteNombre: row.cohorte_nombre,
    cursoNombre: row.curso_nombre,
    fecha: formatearFecha(row.fecha),
    horasDictadas: Number(row.horas_dictadas),
    tarifaHora: Number(row.tarifa_hora),
    subtotal: Number(row.subtotal),
    observaciones: row.observaciones,
    estado: row.estado,
    fechaRegistro: row.fecha_registro,
});

const validarPeriodo = (desde, hasta) => {
    if (!esFechaValida(desde) || !esFechaValida(hasta)) {
        throw new ApiError(400, "El período debe utilizar fechas válidas con formato YYYY-MM-DD");
    }
    if (hasta < desde) {
        throw new ApiError(400, "La fecha hasta no puede ser anterior a la fecha desde");
    }
};

const registrarHoras = async ({
    idDocente,
    idCohorte,
    fecha,
    horasDictadas,
    observaciones,
}) => {
    if (!esNumeroPositivo(idDocente)) {
        throw new ApiError(400, "Docente inválido");
    }
    if (!esNumeroPositivo(idCohorte)) {
        throw new ApiError(400, "Seleccione una cohorte");
    }
    if (!esFechaValida(fecha)) {
        throw new ApiError(400, "La fecha de la sesión es obligatoria y debe ser válida");
    }

    const horas = Number(horasDictadas);
    if (!Number.isFinite(horas) || horas <= 0) {
        throw new ApiError(400, "La cantidad de horas dictadas debe ser mayor a 0");
    }
    if (observaciones !== undefined && observaciones !== null
        && typeof observaciones !== "string") {
        throw new ApiError(400, "Las observaciones deben ser texto");
    }

    const cohorte = await horasDocenteModel.obtenerCohorteDelDocente(
        Number(idCohorte),
        Number(idDocente)
    );
    if (!cohorte) {
        throw new ApiError(404, "La cohorte no existe o no está asignada al docente");
    }
    if (fecha < formatearFecha(cohorte.fecha_inicio)
        || fecha > formatearFecha(cohorte.fecha_fin)) {
        throw new ApiError(400, "La fecha debe estar dentro del período de la cohorte");
    }

    const asignacion = await docenteCategoriaModel.asignacionVigente(
        Number(idDocente),
        fecha
    );
    if (!asignacion) {
        throw new ApiError(400, "El docente no tiene una tarifa vigente para la fecha indicada");
    }

    const registro = await horasDocenteModel.crear({
        id_docente: Number(idDocente),
        id_cohorte: Number(idCohorte),
        fecha,
        horas_dictadas: horas,
        tarifa_hora: Number(asignacion.tarifa_hora),
        observaciones: observaciones?.trim() || null,
    });
    return toDTO(registro);
};

const listarMisHoras = async (idDocente) => {
    if (!esNumeroPositivo(idDocente)) {
        throw new ApiError(400, "Docente inválido");
    }
    const registros = await horasDocenteModel.listarPorDocente(Number(idDocente));
    return registros.map(toDTO);
};

const listarPendientes = async () => {
    const registros = await horasDocenteModel.listarPendientes();
    return registros.map((row) => ({
        ...toDTO(row),
        docenteNombre: row.docente_nombre,
        docenteApellido: row.docente_apellido,
    }));
};

const obtenerReporte = async ({ desde, hasta, idDocente, estado = ESTADOS_LIQUIDABLES[0] }) => {
    validarPeriodo(desde, hasta);

    if (idDocente !== undefined && !esNumeroPositivo(idDocente)) {
        throw new ApiError(400, "Docente inválido");
    }
    if (!ESTADOS.includes(estado)) {
        throw new ApiError(400, "Estado de registro inválido");
    }

    const reporte = await horasDocenteModel.obtenerReporte({
        desde,
        hasta,
        idDocente: idDocente === undefined ? undefined : Number(idDocente),
        estado,
    });
    return reporte.map((row) => ({
        idDocente: row.id_docente,
        nombre: row.nombre,
        apellido: row.apellido,
        cantidadRegistros: Number(row.cantidad_registros),
        totalHoras: Number(row.total_horas),
        totalAPagar: Number(row.total_a_pagar),
    }));
};

const cambiarEstado = async (id, estado) => {
    if (!esNumeroPositivo(id)) {
        throw new ApiError(400, "Registro inválido");
    }
    if (!["aprobado", "rechazado"].includes(estado)) {
        throw new ApiError(400, "El estado debe ser aprobado o rechazado");
    }

    const registro = await horasDocenteModel.actualizarEstado(Number(id), estado);
    if (!registro) {
        throw new ApiError(404, "El registro no existe o ya fue revisado");
    }
    return toDTO(registro);
};

module.exports = {
    registrarHoras,
    listarMisHoras,
    listarPendientes,
    obtenerReporte,
    cambiarEstado,
};
