const router = require('express').Router();
const cursoController = require('../controllers/cursoController');
const { verifyToken, requireRole } = require('../middlewares/authMiddleware');

router.use(verifyToken, requireRole('Administrador'));

router.get('/cursos', cursoController.listarCursos);
router.post('/cursos', cursoController.crearCurso);
router.put('/cursos/:id', cursoController.editarCurso);
router.patch('/cursos/:id/activo', cursoController.cambiarEstadoCurso);

module.exports = router;