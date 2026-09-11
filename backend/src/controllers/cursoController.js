const cursoService = require("../services/cursoService");

const listarCursos = async (req, res) => {
    try {
        const cursos = await cursoService.listarCursos();

        res.json(cursos);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Error al obtener los cursos"
        });
    }
};

const crearCurso = async (req, res) => {
    try {
        const {
            nombre,
            descripcion,
            area_conocimiento
        } = req.body;

        const curso = await cursoService.crearCurso(
            req.user.id,
            nombre,
            descripcion,
            area_conocimiento
        );

        res.status(201).json(curso);

    } catch (error) {
        console.error(error);

        res.status(400).json({
            message: error.message
        });
    }
};

const editarCurso = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            nombre,
            descripcion,
            area_conocimiento
        } = req.body;

        const curso = await cursoService.editarCurso(
            id,
            nombre,
            descripcion,
            area_conocimiento
        );

        if (!curso) {
            return res.status(404).json({
                message: "Curso no encontrado"
            });
        }

        res.json(curso);

    } catch (error) {
        console.error(error);

        res.status(400).json({
            message: error.message
        });
    }
};

const cambiarEstadoCurso = async (req, res) => {
    try {
        const { id } = req.params;
        const { activo } = req.body;

        const curso = await cursoService.cambiarEstadoCurso(
            id,
            activo
        );

        if (!curso) {
            return res.status(404).json({
                message: "Curso no encontrado"
            });
        }

        res.json(curso);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Error al cambiar el estado del curso"
        });
    }
};

module.exports = {
    listarCursos,
    crearCurso,
    editarCurso,
    cambiarEstadoCurso
};