const pool = require("../config/db");
const inscripcionModel = require("../models/inscripcionModel");
const cohorteModel = require("../models/cohorteModel");
const usuarioService = require("./usuarioService");
const { ApiError } = require("../middlewares/errorMiddleware");

const ESTADOS_ACTIVOS = ["pendiente", "confirmada"];
const MODALIDADES_PRESENCIALES = ["presencial", "hibrida"];
const ID_ROL_ESTUDIANTE = 1;

const esNumeroPositivo = (valor) => {
    const numero = Number(valor);
    return Number.isFinite(numero) && numero > 0;
};

const toDTO = (row) => ({
    id: row.id,
    idEstudiante: row.id_estudiante,
    idCohorte: row.id_cohorte,
    cohorteNombre: row.cohorte_nombre,
    modalidad: row.modalidad,
    estado: row.estado,
    fechaSolicitud: row.fecha_solicitud,
    fechaConfirmacion: row.fecha_confirmacion,
    montoPagado: row.monto_pagado,
    observaciones: row.observaciones,
    activo: row.activo,
});

const toDisponibilidadDTO = (cohorte, ocupados) => {
    const conCupo = aplicaControlDeCupo(cohorte.modalidad, cohorte.cupo_fisico);
    const cupoAgotado = conCupo && ocupados >= cohorte.cupo_fisico;

    return {
        id: cohorte.id,
        idCurso: cohorte.id_curso,
        cursoNombre: cohorte.curso_nombre,
        docenteNombre: cohorte.docente_nombre,
        docenteApellido: cohorte.docente_apellido,
        nombre: cohorte.nombre,
        fechaInicio: cohorte.fecha_inicio,
        fechaFin: cohorte.fecha_fin,
        modalidad: cohorte.modalidad,
        costoInscripcion: cohorte.costo_inscripcion,
        costoCuotaMensual: cohorte.costo_cuota_mensual,
        cuposOcupados: ocupados,
        cuposDisponibles: conCupo ? cohorte.cupo_fisico - ocupados : null,
        estadoDisponibilidad: cupoAgotado ? "Cupo Agotado" : "Disponible",
    };
};

const aplicaControlDeCupo = (modalidad, cupoFisico) =>
    MODALIDADES_PRESENCIALES.includes(modalidad) && cupoFisico != null;

const listarDisponibilidad = async ({ idCurso } = {}) => {
    const cohortes = await cohorteModel.listarCohortes();
    const cohortesFiltradas = idCurso
        ? cohortes.filter((c) => c.id_curso === Number(idCurso))
        : cohortes;

    const ids = cohortesFiltradas.map((c) => c.id);
    const conteos = await inscripcionModel.contarInscripcionesActivasPorCohortes(
        ids,
        ESTADOS_ACTIVOS
    );
    const ocupadosPorCohorte = new Map(conteos.map((c) => [c.id_cohorte, c.total]));

    return cohortesFiltradas.map((c) => {
        const ocupados = ocupadosPorCohorte.get(c.id) || 0;
        return toDisponibilidadDTO(c, ocupados);
    });
};

const inscribirEstudiante = async ({ idEstudiante, idCohorte }) => {
    if (!esNumeroPositivo(idEstudiante)) {
        throw new ApiError(400, "Estudiante inválido");
    }
    if (!esNumeroPositivo(idCohorte)) {
        throw new ApiError(400, "Seleccione una cohorte");
    }

    const estudiante = await usuarioService.obtenerPorId(idEstudiante);
    if (estudiante.idRol !== ID_ROL_ESTUDIANTE) {
        throw new ApiError(400, "El usuario no tiene perfil de Estudiante");
    }

    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        const cohorte = await inscripcionModel.obtenerCohorteParaActualizar(
            client,
            Number(idCohorte)
        );
        if (!cohorte) {
            throw new ApiError(404, "La cohorte no existe");
        }
        if (!cohorte.activo) {
            throw new ApiError(409, "La cohorte no está disponible");
        }

        if (aplicaControlDeCupo(cohorte.modalidad, cohorte.cupo_fisico)) {
            const ocupados = await inscripcionModel.contarInscripcionesActivas(
                client,
                cohorte.id,
                ESTADOS_ACTIVOS
            );
            if (ocupados >= cohorte.cupo_fisico) {
                throw new ApiError(409, "Cupo Agotado");
            }
        }

        const yaInscrito = await inscripcionModel.existeInscripcionActiva(
            client,
            Number(idEstudiante),
            cohorte.id,
            ESTADOS_ACTIVOS
        );
        if (yaInscrito) {
            throw new ApiError(
                409,
                "Ya existe una inscripción activa para este estudiante en esta cohorte"
            );
        }

        const inscripcion = await inscripcionModel.crearInscripcion(client, {
            id_estudiante: Number(idEstudiante),
            id_cohorte: cohorte.id,
            estado: "pendiente",
        });

        await client.query("COMMIT");
        return toDTO(inscripcion);
    } catch (err) {
        await client.query("ROLLBACK");
        throw err;
    } finally {
        client.release();
    }
};

const listarPorEstudiante = async (idEstudiante) => {
    if (!esNumeroPositivo(idEstudiante)) {
        throw new ApiError(400, "Estudiante inválido");
    }
    const inscripciones = await inscripcionModel.listarPorEstudiante(idEstudiante);
    return inscripciones.map(toDTO);
};

module.exports = {
    listarDisponibilidad,
    inscribirEstudiante,
    listarPorEstudiante,
};