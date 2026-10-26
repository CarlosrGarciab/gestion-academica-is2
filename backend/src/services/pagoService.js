const pool = require("../config/db");
const pagoModel = require("../models/pagoModel");
const { ApiError } = require("../middlewares/errorMiddleware");

const toPagoDTO = (row) => ({
    id: row.id,
    numeroComprobante: Number(row.numero_comprobante),
    idInscripcion: row.id_inscripcion,
    monto: Number(row.monto),
    fechaPago: row.fecha_pago,
    estudianteNombre: row.estudiante_nombre,
    estudianteApellido: row.estudiante_apellido,
    cursoNombre: row.curso_nombre,
    cohorteNombre: row.cohorte_nombre,
});

const toPendienteDTO = (row) => ({
    id: row.id,
    idEstudiante: row.id_estudiante,
    idCohorte: row.id_cohorte,
    estudianteNombre: row.estudiante_nombre,
    estudianteApellido: row.estudiante_apellido,
    cursoNombre: row.curso_nombre,
    cohorteNombre: row.cohorte_nombre,
    precioInscripcion: row.precio_inscripcion === null ? null : Number(row.precio_inscripcion),
    fechaSolicitud: row.fecha_solicitud,
});

const listarPendientes = async () => {
    const rows = await pagoModel.listarInscripcionesPendientes();
    return rows.map(toPendienteDTO);
};

const registrarPago = async ({ idInscripcion, monto }) => {
    const id = Number(idInscripcion);
    if (!Number.isInteger(id) || id <= 0) {
        throw new ApiError(400, "Inscripción inválida");
    }
    const importe = Number(monto);
    if (!Number.isFinite(importe) || importe <= 0) {
        throw new ApiError(400, "El monto debe ser mayor a 0");
    }

    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        const inscripcion = await pagoModel.obtenerInscripcionParaPago(client, id);
        if (!inscripcion) throw new ApiError(404, "La inscripción no existe");
        if (inscripcion.estado !== "pendiente") {
            throw new ApiError(409, "La inscripción ya fue confirmada o no está pendiente");
        }

        const esperado = Number(inscripcion.precio_inscripcion);
        if (!Number.isFinite(esperado) || importe !== esperado) {
            throw new ApiError(400, `El monto debe coincidir con el importe vigente: ${esperado}`);
        }

        const pago = await pagoModel.crearPago(client, {
            id_inscripcion: id,
            monto: importe,
        });
        await pagoModel.confirmarInscripcion(client, id);
        await client.query("COMMIT");
        return {
            ...toPagoDTO(pago),
            cursoNombre: inscripcion.curso_nombre,
            cohorteNombre: inscripcion.cohorte_nombre,
        };
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
};

const listarMisPagos = async (idEstudiante) => {
    const rows = await pagoModel.listarPagosPorEstudiante(Number(idEstudiante));
    return rows.map(toPagoDTO);
};

module.exports = { listarPendientes, registrarPago, listarMisPagos };
