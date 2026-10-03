const router = require('express').Router();
const inscripcionController = require('../controllers/inscripcionController');
const { verifyToken, requireRole } = require('../middlewares/authMiddleware');

router.get('/cohortes/disponibilidad', verifyToken, requireRole('Estudiante'), inscripcionController.getDisponibilidad);
router.post('/inscripciones', verifyToken, requireRole('Estudiante'), inscripcionController.crearInscripcion);
router.get('/inscripciones/mias', verifyToken, requireRole('Estudiante'), inscripcionController.getMisInscripciones);

module.exports = router;