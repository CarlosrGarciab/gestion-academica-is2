const router = require('express').Router();
const usuarioController = require('../controllers/usuarioController');
const { verifyToken, requireRole } = require('../middlewares/authMiddleware');

router.get('/usuarios/activos', verifyToken, requireRole('Administrador'), usuarioController.listarUsuariosActivos);
router.get('/usuarios/:id', verifyToken, usuarioController.getById);
router.put('/usuarios/:id', verifyToken, usuarioController.actualizar);
router.patch('/usuarios/:id/activo', verifyToken, requireRole('Administrador'), usuarioController.cambiarActivo);

module.exports = router;