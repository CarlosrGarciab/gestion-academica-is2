const usuarioModel = require('../models/usuarioModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const registrarUsuario = async({nombre, apellido, email, idRol, password}) =>
{
    const existente = await usuarioModel.buscarPorEmail(email);
    if (existente)
    {
        throw new Error('Email ya utilizado');
    }

    const password_hash = await bcrypt.hash(password, 10);
    const usuario = await usuarioModel.crearUsuario({nombre, apellido, email, id_rol: idRol, password_hash});

    return{
        id : usuario.id,
        nombre : usuario.nombre,
        apellido : usuario.apellido,
        email : usuario.email,
        idRol : usuario.id_rol
    };
};

const login = async (email, password) => {
  const usuario = await usuarioModel.buscarPorEmail(email);
  if (!usuario) {
    throw new Error('Credenciales invalidas');
  }

  const passwordValida = await bcrypt.compare(password, usuario.password_hash);
  if (!passwordValida) {
    throw new Error('Credenciales invalidas');
  }

  if (!usuario.activo) {
    throw new Error('El usuario esta desactivado');
  }

  const token = jwt.sign(
    { id: usuario.id, rol: usuario.id_rol },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );

  return {
    token,
    usuario: {
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      idRol: usuario.id_rol,
    },
  };
};


module.exports = {registrarUsuario, login};