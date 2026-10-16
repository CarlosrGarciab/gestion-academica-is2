const test = require("node:test");
const assert = require("node:assert/strict");

const horasDocenteModel = require("../src/models/horasDocenteModel");
const docenteCategoriaModel = require("../src/models/docenteCategoriaModel");
const horasDocenteService = require("../src/services/horasDocenteService");

function mockModels(overrides = {}) {
    const originales = {
        cohorte: horasDocenteModel.obtenerCohorteDelDocente,
        crear: horasDocenteModel.crear,
        reporte: horasDocenteModel.obtenerReporte,
        pendientes: horasDocenteModel.listarPendientes,
        estado: horasDocenteModel.actualizarEstado,
        tarifa: docenteCategoriaModel.asignacionVigente,
    };

    horasDocenteModel.obtenerCohorteDelDocente = overrides.cohorte || (async () => ({
        id: 3,
        id_docente: 7,
        fecha_inicio: "2026-10-01",
        fecha_fin: "2026-10-31",
        curso_nombre: "JavaScript",
    }));
    horasDocenteModel.crear = overrides.crear || (async (datos) => ({
        id: 1,
        ...datos,
        horas_dictadas: String(datos.horas_dictadas),
        tarifa_hora: String(datos.tarifa_hora),
        subtotal: String(datos.horas_dictadas * datos.tarifa_hora),
        estado: "pendiente",
        fecha_registro: "2026-10-15T12:00:00.000Z",
    }));
    horasDocenteModel.obtenerReporte = overrides.reporte || (async () => []);
    horasDocenteModel.listarPendientes = overrides.pendientes || (async () => []);
    horasDocenteModel.actualizarEstado = overrides.estado || (async () => null);
    docenteCategoriaModel.asignacionVigente = overrides.tarifa || (async () => ({
        tarifa_hora: "60000",
    }));

    return originales;
}

function restoreModels(originales) {
    horasDocenteModel.obtenerCohorteDelDocente = originales.cohorte;
    horasDocenteModel.crear = originales.crear;
    horasDocenteModel.obtenerReporte = originales.reporte;
    horasDocenteModel.listarPendientes = originales.pendientes;
    horasDocenteModel.actualizarEstado = originales.estado;
    docenteCategoriaModel.asignacionVigente = originales.tarifa;
}

test("registrarHoras calcula y conserva la tarifa vigente", async () => {
    let datos;
    const originales = mockModels({
        crear: async (entrada) => {
            datos = entrada;
            return {
                id: 10,
                ...entrada,
                horas_dictadas: "2.5",
                tarifa_hora: "60000",
                subtotal: "150000",
                estado: "pendiente",
                fecha_registro: "2026-10-15T12:00:00.000Z",
            };
        },
    });

    try {
        const registro = await horasDocenteService.registrarHoras({
            idDocente: 7,
            idCohorte: 3,
            fecha: "2026-10-15",
            horasDictadas: 2.5,
            observaciones: "Clase práctica",
        });

        assert.equal(datos.id_docente, 7);
        assert.equal(datos.id_cohorte, 3);
        assert.equal(datos.tarifa_hora, 60000);
        assert.equal(registro.horasDictadas, 2.5);
        assert.equal(registro.subtotal, 150000);
        assert.equal(registro.estado, "pendiente");
    } finally {
        restoreModels(originales);
    }
});

test("registrarHoras permite varias sesiones en la misma fecha", async () => {
    let cantidad = 0;
    const originales = mockModels({
        crear: async (entrada) => {
            cantidad += 1;
            return {
                id: cantidad,
                ...entrada,
                horas_dictadas: "1",
                tarifa_hora: "60000",
                subtotal: "60000",
                estado: "pendiente",
                fecha_registro: "2026-10-15T12:00:00.000Z",
            };
        },
    });

    try {
        await horasDocenteService.registrarHoras({
            idDocente: 7,
            idCohorte: 3,
            fecha: "2026-10-15",
            horasDictadas: 1,
        });
        await horasDocenteService.registrarHoras({
            idDocente: 7,
            idCohorte: 3,
            fecha: "2026-10-15",
            horasDictadas: 1,
        });
        assert.equal(cantidad, 2);
    } finally {
        restoreModels(originales);
    }
});

test("registrarHoras rechaza una fecha fuera de la cohorte", async () => {
    const originales = mockModels();
    try {
        await assert.rejects(
            horasDocenteService.registrarHoras({
                idDocente: 7,
                idCohorte: 3,
                fecha: "2026-11-01",
                horasDictadas: 2,
            }),
            { message: "La fecha debe estar dentro del período de la cohorte" }
        );
    } finally {
        restoreModels(originales);
    }
});

test("obtenerReporte valida el período y transforma los totales", async () => {
    const originales = mockModels({
        reporte: async () => [{
            id_docente: 7,
            nombre: "Ana",
            apellido: "Docente",
            cantidad_registros: "2",
            total_horas: "5.5",
            total_a_pagar: "330000",
        }],
    });

    try {
        const reporte = await horasDocenteService.obtenerReporte({
            desde: "2026-10-01",
            hasta: "2026-10-31",
        });
        assert.deepEqual(reporte, [{
            idDocente: 7,
            nombre: "Ana",
            apellido: "Docente",
            cantidadRegistros: 2,
            totalHoras: 5.5,
            totalAPagar: 330000,
        }]);
    } finally {
        restoreModels(originales);
    }
});

test("obtenerReporte rechaza un período invertido", async () => {
    const originales = mockModels();
    try {
        await assert.rejects(
            horasDocenteService.obtenerReporte({
                desde: "2026-11-01",
                hasta: "2026-10-01",
            }),
            { message: "La fecha hasta no puede ser anterior a la fecha desde" }
        );
    } finally {
        restoreModels(originales);
    }
});

test("listarPendientes expone el docente y normaliza los importes", async () => {
    const originales = mockModels({
        pendientes: async () => [{
            id: 5,
            id_docente: 7,
            id_cohorte: 3,
            cohorte_nombre: "JS 2026",
            curso_nombre: "JavaScript",
            fecha: "2026-10-10",
            horas_dictadas: "3",
            tarifa_hora: "60000",
            subtotal: "180000",
            observaciones: null,
            estado: "pendiente",
            fecha_registro: "2026-10-15T12:00:00.000Z",
            docente_nombre: "Ana",
            docente_apellido: "Docente",
        }],
    });

    try {
        const pendientes = await horasDocenteService.listarPendientes();
        assert.equal(pendientes.length, 1);
        assert.equal(pendientes[0].id, 5);
        assert.equal(pendientes[0].horasDictadas, 3);
        assert.equal(pendientes[0].subtotal, 180000);
        assert.equal(pendientes[0].docenteNombre, "Ana");
        assert.equal(pendientes[0].docenteApellido, "Docente");
    } finally {
        restoreModels(originales);
    }
});

test("cambiarEstado aprueba un registro pendiente", async () => {
    const originales = mockModels({
        estado: async (id, estado) => ({
            id,
            id_docente: 7,
            id_cohorte: 3,
            fecha: "2026-10-10",
            horas_dictadas: "3",
            tarifa_hora: "60000",
            subtotal: "180000",
            observaciones: null,
            estado,
            fecha_registro: "2026-10-15T12:00:00.000Z",
        }),
    });

    try {
        const registro = await horasDocenteService.cambiarEstado(5, "aprobado");
        assert.equal(registro.id, 5);
        assert.equal(registro.estado, "aprobado");
        assert.equal(registro.subtotal, 180000);
    } finally {
        restoreModels(originales);
    }
});

test("cambiarEstado rechaza un estado no permitido", async () => {
    const originales = mockModels();
    try {
        await assert.rejects(
            horasDocenteService.cambiarEstado(5, "pendiente"),
            { message: "El estado debe ser aprobado o rechazado" }
        );
    } finally {
        restoreModels(originales);
    }
});

test("cambiarEstado devuelve 404 si el registro ya fue revisado", async () => {
    const originales = mockModels({ estado: async () => null });
    try {
        await assert.rejects(
            horasDocenteService.cambiarEstado(99, "aprobado"),
            { message: "El registro no existe o ya fue revisado" }
        );
    } finally {
        restoreModels(originales);
    }
});
