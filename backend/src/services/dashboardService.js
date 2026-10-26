const dashboardModel = require("../models/dashboardModel");

const toNumber = (value) => Number(value || 0);

const formatearPeriodo = (periodo) => {
    const [year, month] = periodo.split("-");
    return `${month}/${year}`;
};

const obtenerResumen = async () => {
    const resumen = await dashboardModel.obtenerResumen();
    const ocupacionCohortes = resumen.ocupacion.map((row) => {
        const cupoFisico = toNumber(row.cupo_fisico);
        const alumnosInscritos = toNumber(row.alumnos_inscritos);
        return {
            id: row.id,
            cohorteNombre: row.cohorte_nombre,
            cursoNombre: row.curso_nombre,
            modalidad: row.modalidad,
            cupoFisico,
            alumnosInscritos,
            porcentajeOcupacion: cupoFisico > 0
                ? Math.round((alumnosInscritos / cupoFisico) * 10000) / 100
                : 0,
        };
    });
    const ocupacionPromedio = ocupacionCohortes.length === 0
        ? 0
        : Math.round(
            ocupacionCohortes.reduce((total, cohorte) => total + cohorte.porcentajeOcupacion, 0)
            / ocupacionCohortes.length * 100
        ) / 100;

    return {
        kpis: {
            totalIngresos: toNumber(resumen.ingresos.total_ingresos),
            cantidadPagos: toNumber(resumen.ingresos.cantidad_pagos),
            totalAlumnosInscritos: toNumber(resumen.alumnos.total_alumnos),
            ocupacionPromedio,
        },
        ocupacionCohortes,
        ingresosMensuales: resumen.ingresosMensuales.map((row) => ({
            periodo: row.periodo,
            etiqueta: formatearPeriodo(row.periodo),
            total: toNumber(row.total),
        })),
        inscripcionesPorEstado: resumen.estadosInscripcion.map((row) => ({
            estado: row.estado,
            cantidad: toNumber(row.cantidad),
        })),
    };
};

module.exports = { obtenerResumen };
