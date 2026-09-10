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
    const usuario = await usuarioModel.crearUsuario({nombre, apellido, email, idRol, password_hash});

    return{
        id : usuario.id,
        nombre : usuario.nombre,
        apellido : usuario.apellido,
        email : usuario.email,
        idRol : usuario.id_rol
    };
};


module.exports = {registrarUsuario};