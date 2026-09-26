const inscripcionService = require("../services/inscripcionService");

const getDisponibilidad = async (req, res, next) => {
    try {
        const { idCurso } = req.query;
        const cohortes = await inscripcionService.listarDisponibilidad({ idCurso });
        res.json(cohortes);
    } catch (err) {
        next(err);
    }
};

const crearInscripcion = async (req, res, next) => {
    try {
        const { idCohorte } = req.body;
        const idEstudiante = req.user?.id;

        const inscripcion = await inscripcionService.inscribirEstudiante({
            idEstudiante,
            idCohorte,
        });
        res.status(201).json(inscripcion);
    } catch (err) {
        next(err);
    }
};

const getMisInscripciones = async (req, res, next) => {
    try {
        const idEstudiante = req.user?.id;
        const inscripciones = await inscripcionService.listarPorEstudiante(idEstudiante);
        res.json(inscripciones);
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getDisponibilidad,
    crearInscripcion,
    getMisInscripciones,
};