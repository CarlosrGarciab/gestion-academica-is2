const router = require('express').Router();
const inscripcionController = require('../controllers/inscripcionController');
const { verifyToken, requireRole } = require('../middlewares/authMiddleware');

router.use(verifyToken, requireRole('Estudiante'));

router.get('/cohortes/disponibilidad', inscripcionController.getDisponibilidad);
router.post('/inscripciones', inscripcionController.crearInscripcion);
router.get('/inscripciones/mias', inscripcionController.getMisInscripciones);

module.exports = router;