const test = require('node:test');
const assert = require('node:assert/strict');
const bcrypt = require('bcrypt');

const usuarioModel = require('../src/models/usuarioModel');
const authService = require('../src/services/authService');

process.env.JWT_SECRET = 'test-secret';

test('registrarUsuario rechaza datos obligatorios incompletos', async () => {
  await assert.rejects(
    authService.registrarUsuario({ email: 'test@example.com', password: 'Password123' }),
    { message: 'Nombre, apellido, email y password son obligatorios' }
  );
});

test('registrarUsuario exige una password de 8 caracteres con letra y numero', async () => {
  await assert.rejects(
    authService.registrarUsuario({ nombre: 'Ana', apellido: 'Prueba', email: 'ana@example.com', password: 'abcdefgh' }),
    { message: 'La password debe tener al menos 8 caracteres, una letra y un numero' }
  );
});

test('registrarUsuario normaliza email y acepta Estudiante o Docente, pero no Administrador', async () => {
  const originalBuscarPorEmail = usuarioModel.buscarPorEmail;
  const originalBuscarIdRolPublico = usuarioModel.buscarIdRolPublico;
  const originalCrearUsuario = usuarioModel.crearUsuario;
  let datosCreados;
  let emailBuscado;

  usuarioModel.buscarPorEmail = async (email) => {
    emailBuscado = email;
    return undefined;
  };
  usuarioModel.buscarIdRolPublico = async (idRol) => [1, 2].includes(idRol) ? idRol : undefined;
  usuarioModel.crearUsuario = async (datos) => {
    datosCreados = datos;
    return { id: 7, nombre: datos.nombre, apellido: datos.apellido, email: datos.email, id_rol: datos.id_rol };
  };

  try {
    const usuario = await authService.registrarUsuario({
      nombre: 'Ana',
      apellido: 'Prueba',
      email: '  ANA@Example.com ',
      idRol: 2,
      password: 'Password123'
    });

    assert.equal(emailBuscado, 'ana@example.com');
    assert.equal(datosCreados.email, 'ana@example.com');
    assert.equal(datosCreados.id_rol, 2);
    assert.equal(usuario.idRol, 2);
    await assert.rejects(
      authService.registrarUsuario({ nombre: 'Admin', apellido: 'Prueba', email: 'admin@example.com', idRol: 3, password: 'Password123' }),
      { message: 'El rol seleccionado no esta disponible para registro publico' }
    );
  } finally {
    usuarioModel.buscarPorEmail = originalBuscarPorEmail;
    usuarioModel.buscarIdRolPublico = originalBuscarIdRolPublico;
    usuarioModel.crearUsuario = originalCrearUsuario;
  }
});

test('login normaliza email y devuelve un JWT para credenciales correctas', async () => {
  const originalBuscarPorEmail = usuarioModel.buscarPorEmail;
  usuarioModel.buscarPorEmail = async (email) => {
    assert.equal(email, 'ana@example.com');
    return { id: 7, nombre: 'Ana', email, id_rol: 2, activo: true, password_hash: await bcrypt.hash('Password123', 4) };
  };

  try {
    const resultado = await authService.login('  ANA@EXAMPLE.COM ', 'Password123');
    assert.equal(typeof resultado.token, 'string');
    assert.equal(resultado.usuario.idRol, 2);
  } finally {
    usuarioModel.buscarPorEmail = originalBuscarPorEmail;
  }
});

test('login usa el mismo mensaje para un email inexistente', async () => {
  const originalBuscarPorEmail = usuarioModel.buscarPorEmail;
  usuarioModel.buscarPorEmail = async () => undefined;

  try {
    await assert.rejects(
      authService.login('missing@example.com', 'Password123'),
      { message: 'Credenciales inválidas' }
    );
  } finally {
    usuarioModel.buscarPorEmail = originalBuscarPorEmail;
  }
});