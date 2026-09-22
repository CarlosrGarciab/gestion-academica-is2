const cohorteModel = require("../models/cohorteModel");
const cursoService = require("./cursoService");
const usuarioService = require("./usuarioService");
const { ApiError } = require("../middlewares/errorMiddleware");

const MODALIDADES = ["presencial", "virtual", "hibrida"];
const MODALIDADES_PRESENCIALES = ["presencial", "hibrida"];
const MODALIDADES_VIRTUALES = ["virtual", "hibrida"];

const formatearFecha = (fecha) => {
    if (!fecha) return null;
    if (fecha instanceof Date) {
        const anio = fecha.getFullYear();
        const mes = String(fecha.getMonth() + 1).padStart(2, '0');
        const dia = String(fecha.getDate()).padStart(2, '0');
        return `${anio}-${mes}-${dia}`;
    }
    return String(fecha).slice(0, 10);
};

const toDTO = (row) => ({
    id: row.id,
    idCurso: row.id_curso,
    cursoNombre: row.curso_nombre,
    idDocente: row.id_docente,
    docenteNombre: row.docente_nombre,
    docenteApellido: row.docente_apellido,
    nombre: row.nombre,
    fechaInicio: formatearFecha(row.fecha_inicio),
    fechaFin: formatearFecha(row.fecha_fin),
    modalidad: row.modalidad,
    cupoFisico: row.cupo_fisico,
    linkAcceso: row.link_acceso,
    costoInscripcion: row.costo_inscripcion,
    costoCuotaMensual: row.costo_cuota_mensual,
    tarifaHoraDocente: row.tarifa_hora_docente,
    activo: row.activo,
});

const listarCohortes = async () => {
    const cohortes = await cohorteModel.listarCohortes();
    return cohortes.map(toDTO);
};

const esNumeroPositivo = (valor) => {
    const numero = Number(valor);
    return Number.isFinite(numero) && numero > 0;
};

const esUrlValida = (valor) => {
    try {
        const url = new URL(valor);
        return url.protocol === "http:" || url.protocol === "https:";
    } catch {
        return false;
    }
};

const crearCohorte = async ({
    idCurso,
    idDocente,
    nombre,
    fechaInicio,
    fechaFin,
    modalidad,
    cupoFisico,
    linkAcceso,
    costoInscripcion,
    costoCuotaMensual,
    tarifaHoraDocente,
}) => {
    const modalidadNormalizada = modalidad?.trim().toLowerCase();
    if (!MODALIDADES.includes(modalidadNormalizada)) {
        throw new ApiError(400, "La modalidad debe ser presencial, virtual o hibrida");
    }

    if (!esNumeroPositivo(idCurso)) {
        throw new ApiError(400, "Seleccione un curso");
    }
    const curso = await cursoService.obtenerPorId(idCurso);

    if (!esNumeroPositivo(idDocente)) {
        throw new ApiError(400, "Seleccione un docente");
    }
    const docente = await usuarioService.obtenerPorId(idDocente);
    if (docente.idRol !== 2) {
        throw new ApiError(400, "El usuario seleccionado no es Docente");
    }

    if (!fechaInicio || !fechaFin) {
        throw new ApiError(400, "Las fechas de cursado son obligatorias");
    }
    if (new Date(fechaFin) < new Date(fechaInicio)) {
        throw new ApiError(400, "La fecha de fin debe ser posterior o igual a la de inicio");
    }

    if (!esNumeroPositivo(costoInscripcion)) {
        throw new ApiError(400, "El costo de inscripcion debe ser mayor a 0");
    }
    if (!esNumeroPositivo(costoCuotaMensual)) {
        throw new ApiError(400, "La cuota mensual debe ser mayor a 0");
    }
    if (!esNumeroPositivo(tarifaHoraDocente)) {
        throw new ApiError(400, "La tarifa por hora del docente debe ser mayor a 0");
    }

    let cupoFisicoFinal = null;
    if (MODALIDADES_PRESENCIALES.includes(modalidadNormalizada)) {
        const cupo = Number(cupoFisico);
        if (!Number.isInteger(cupo) || cupo <= 0) {
            throw new ApiError(400, "El cupo fisico es obligatorio y debe ser mayor a 0");
        }
        cupoFisicoFinal = cupo;
    }

    let linkAccesoFinal = null;
    if (MODALIDADES_VIRTUALES.includes(modalidadNormalizada)) {
        const link = linkAcceso?.trim();
        if (!link) {
            throw new ApiError(400, "El link de acceso es obligatorio");
        }
        if (!esUrlValida(link)) {
            throw new ApiError(400, "El link de acceso debe ser una URL valida (https://...)");
        }
        linkAccesoFinal = link;
    }

    const cohorte = await cohorteModel.crearCohorte({
        id_curso: Number(idCurso),
        id_docente: Number(idDocente),
        nombre: nombre?.trim() || null,
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin,
        modalidad: modalidadNormalizada,
        cupo_fisico: cupoFisicoFinal,
        link_acceso: linkAccesoFinal,
        costo_inscripcion: Number(costoInscripcion),
        costo_cuota_mensual: Number(costoCuotaMensual),
        tarifa_hora_docente: Number(tarifaHoraDocente),
    });

    return {
        ...toDTO(cohorte),
        cursoNombre: curso.nombre,
        docenteNombre: docente.nombre,
        docenteApellido: docente.apellido,
    };
};

module.exports = {
    listarCohortes,
    crearCohorte,
};