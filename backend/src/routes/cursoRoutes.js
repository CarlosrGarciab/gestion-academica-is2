const router = require('express').Router();
const cursoController = require('../controllers/cursoController');
const { verifyToken, requireRole } = require('../middlewares/authMiddleware');

router.get('/cursos', verifyToken, requireRole('Administrador'), cursoController.listarCursos);
router.post('/cursos', verifyToken, requireRole('Administrador'), cursoController.crearCurso);
router.put('/cursos/:id', verifyToken, requireRole('Administrador'), cursoController.editarCurso);
router.patch('/cursos/:id/activo', verifyToken, requireRole('Administrador'), cursoController.cambiarEstadoCurso);

module.exports = router;