const test = require("node:test");
const assert = require("node:assert/strict");

const dashboardModel = require("../src/models/dashboardModel");
const dashboardService = require("../src/services/dashboardService");

test("obtenerResumen transforma KPIs y calcula ocupación por cohorte", async () => {
    const original = dashboardModel.obtenerResumen;
    dashboardModel.obtenerResumen = async () => ({
        ingresos: { total_ingresos: "1250000", cantidad_pagos: 4 },
        alumnos: { total_alumnos: 12 },
        ocupacion: [{
            id: 7,
            cohorte_nombre: "Turno mañana",
            curso_nombre: "JavaScript",
            modalidad: "presencial",
            cupo_fisico: "20",
            alumnos_inscritos: 15,
        }],
        ingresosMensuales: [{ periodo: "2026-10", total: "1250000" }],
        estadosInscripcion: [{ estado: "confirmada", cantidad: 12 }],
    });

    try {
        const resumen = await dashboardService.obtenerResumen();
        assert.deepEqual(resumen.kpis, {
            totalIngresos: 1250000,
            cantidadPagos: 4,
            totalAlumnosInscritos: 12,
            ocupacionPromedio: 75,
        });
        assert.deepEqual(resumen.ocupacionCohortes[0], {
            id: 7,
            cohorteNombre: "Turno mañana",
            cursoNombre: "JavaScript",
            modalidad: "presencial",
            cupoFisico: 20,
            alumnosInscritos: 15,
            porcentajeOcupacion: 75,
        });
        assert.equal(resumen.ingresosMensuales[0].etiqueta, "10/2026");
    } finally {
        dashboardModel.obtenerResumen = original;
    }
});
