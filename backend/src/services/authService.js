const usuarioModel = require("../models/usuarioModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const normalizarEmail = (email) => {
    return email.trim().toLowerCase();
};

const registrarUsuario = async ({
    nombre,
    apellido,
    email,
    idRol = 1,
    password
}) => {

    if (
        !nombre?.trim() ||
        !apellido?.trim() ||
        !email?.trim() ||
        !password
    ) {
        throw new Error(
            "Nombre, apellido, email y password son obligatorios"
        );
    }

    if (
        password.length < 8 ||
        !/[A-Za-z]/.test(password) ||
        !/\d/.test(password)
    ) {
        throw new Error(
            "La password debe tener al menos 8 caracteres, una letra y un numero"
        );
    }

    const emailNormalizado = normalizarEmail(email);

    const existente = await usuarioModel.buscarPorEmail(emailNormalizado);

    if (existente) {
        throw new Error("Email ya utilizado");
    }

    const idRolPublico = await usuarioModel.buscarIdRolPublico(Number(idRol));

    if (!idRolPublico) {
        throw new Error(
            "El rol seleccionado no esta disponible para registro publico"
        );
    }

    const password_hash = await bcrypt.hash(password, 10);

    const usuario = await usuarioModel.crearUsuario({
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        email: emailNormalizado,
        id_rol: idRolPublico,
        password_hash
    });

    return {
        id: usuario.id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email,
        idRol: usuario.id_rol
    };
};

const login = async (email, password) => {

    if (!email || !password) {
        throw new Error("Email y password son obligatorios");
    }

    const usuario = await usuarioModel.buscarPorEmail(
        normalizarEmail(email)
    );

    if (!usuario) {
        throw new Error("Credenciales inválidas");
    }

    const passwordValida = await bcrypt.compare(
        password,
        usuario.password_hash
    );

    if (!passwordValida) {
        throw new Error("Credenciales inválidas");
    }

    if (!usuario.activo) {
        throw new Error("El usuario esta desactivado");
    }

    const token = jwt.sign(
        {
            id: usuario.id,
            rol: usuario.id_rol
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "8h"
        }
    );

    return {
        token,
        usuario: {
            id: usuario.id,
            nombre: usuario.nombre,
            email: usuario.email,
            idRol: usuario.id_rol
        }
    };
};

module.exports = {
    registrarUsuario,
    login
};