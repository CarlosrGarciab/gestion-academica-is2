const router = require('express').Router();
const cohorteController = require('../controllers/cohorteController');
const { verifyToken, requireRole } = require('../middlewares/authMiddleware');

router.use(verifyToken, requireRole('Administrador'));

router.get('/cohortes', cohorteController.listarCohortes);
router.post('/cohortes', cohorteController.crearCohorte);

module.exports = router;