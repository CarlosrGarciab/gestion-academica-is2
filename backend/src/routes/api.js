const express = require('express');
const authController = require('../controllers/authController');
const cursoController = require('../controllers/cursoController');

const router = express.Router();

router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.get('/cursos', cursoController.listCursos);

module.exports = router;