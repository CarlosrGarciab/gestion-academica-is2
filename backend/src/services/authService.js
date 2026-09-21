const usuarioModel = require('../models/usuarioModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { ApiError } = require('../middlewares/errorMiddleware');

const normalizarEmail = (email) => email.trim().toLowerCase();
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ID_ROL_ESTUDIANTE = 1;

const registrarUsuario = async ({ nombre, apellido, email, password }) => {
  if (!nombre?.trim() || !apellido?.trim() || !email?.trim() || !password) {
    throw new ApiError(400, 'Nombre, apellido, email y password son obligatorios');
  }

  if (password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    throw new ApiError(400, 'La password debe tener al menos 8 caracteres, una letra y un numero');
  }

  const emailNormalizado = normalizarEmail(email);
  if (!EMAIL_REGEX.test(emailNormalizado)) {
    throw new ApiError(400, 'Email invalido');
  }

  const existente = await usuarioModel.buscarPorEmail(emailNormalizado);
  if (existente) {
    throw new ApiError(400, 'Email ya utilizado');
  }

  const password_hash = await bcrypt.hash(password, 10);
  const usuario = await usuarioModel.crearUsuario({
    nombre: nombre.trim(),
    apellido: apellido.trim(),
    email: emailNormalizado,
    id_rol: ID_ROL_ESTUDIANTE,
    password_hash,
  });

  return {
    id: usuario.id,
    nombre: usuario.nombre,
    apellido: usuario.apellido,
    email: usuario.email,
    idRol: usuario.id_rol,
  };
};

const login = async (email, password) => {
  if (!email || !password) {
    throw new ApiError(400, 'Email y password son obligatorios');
  }

  const usuario = await usuarioModel.buscarPorEmail(normalizarEmail(email));
  if (!usuario) {
    throw new ApiError(401, 'Credenciales invalidas');
  }

  const passwordValida = await bcrypt.compare(password, usuario.password_hash);
  if (!passwordValida) {
    throw new ApiError(401, 'Credenciales invalidas');
  }

  if (!usuario.activo) {
    throw new ApiError(403, 'El usuario esta desactivado');
  }

  const rol = await usuarioModel.buscarNombreRol(usuario.id_rol);
  const token = jwt.sign(
    { id: usuario.id, rol },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );

  return {
    token,
    usuario: {
      id: usuario.id,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      email: usuario.email,
      idRol: usuario.id_rol,
    },
  };
};

module.exports = { registrarUsuario, login };