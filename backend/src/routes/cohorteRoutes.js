const router = require('express').Router();
const cohorteController = require('../controllers/cohorteController');
const { verifyToken, requireRole } = require('../middlewares/authMiddleware');

router.get('/cohortes', verifyToken, requireRole('Administrador'), cohorteController.listarCohortes);
router.post('/cohortes', verifyToken, requireRole('Administrador'), cohorteController.crearCohorte);

module.exports = router;