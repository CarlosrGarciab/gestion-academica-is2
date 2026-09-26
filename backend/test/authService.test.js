const test = require('node:test');
const assert = require('node:assert/strict');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

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

test('registrarUsuario normaliza email y registra siempre como Estudiante', async () => {
  const originalBuscarPorEmail = usuarioModel.buscarPorEmail;
  const originalCrearUsuario = usuarioModel.crearUsuario;
  let datosCreados;
  let emailBuscado;

  usuarioModel.buscarPorEmail = async (email) => {
    emailBuscado = email;
    return undefined;
  };
  usuarioModel.crearUsuario = async (datos) => {
    datosCreados = datos;
    return { id: 7, nombre: datos.nombre, apellido: datos.apellido, email: datos.email, id_rol: datos.id_rol };
  };

  try {
    const usuario = await authService.registrarUsuario({
      nombre: 'Ana',
      apellido: 'Prueba',
      email: '  ANA@Example.com ',
      password: 'Password123'
    });

    assert.equal(emailBuscado, 'ana@example.com');
    assert.equal(datosCreados.email, 'ana@example.com');
    assert.equal(datosCreados.id_rol, 1);
    assert.equal(usuario.idRol, 1);

    const conRolSolicitado = await authService.registrarUsuario({
      nombre: 'Pedro',
      apellido: 'Prueba',
      email: 'pedro@example.com',
      idRol: 2,
      password: 'Password123'
    });
    assert.equal(conRolSolicitado.idRol, 1);
  } finally {
    usuarioModel.buscarPorEmail = originalBuscarPorEmail;
    usuarioModel.crearUsuario = originalCrearUsuario;
  }
});

test('registrarUsuario rechaza un email invalido', async () => {
  await assert.rejects(
    authService.registrarUsuario({ nombre: 'Ana', apellido: 'Prueba', email: 'no-es-email', password: 'Password123' }),
    { message: 'Email invalido' }
  );
});

test('login normaliza email y devuelve un JWT para credenciales correctas', async () => {
  const originalBuscarPorEmail = usuarioModel.buscarPorEmail;
  const originalBuscarNombreRol = usuarioModel.buscarNombreRol;
  usuarioModel.buscarPorEmail = async (email) => {
    assert.equal(email, 'ana@example.com');
    return { id: 7, nombre: 'Ana', apellido: 'Perez', email, id_rol: 2, activo: true, password_hash: await bcrypt.hash('Password123', 4) };
  };
  usuarioModel.buscarNombreRol = async (idRol) => (idRol === 2 ? 'Docente' : undefined);

  try {
    const resultado = await authService.login('  ANA@EXAMPLE.COM ', 'Password123');
    assert.equal(typeof resultado.token, 'string');
    assert.equal(resultado.usuario.idRol, 2);
    assert.equal(resultado.usuario.apellido, 'Perez');
    const payload = jwt.decode(resultado.token);
    assert.equal(payload.rol, 'Docente');
  } finally {
    usuarioModel.buscarPorEmail = originalBuscarPorEmail;
    usuarioModel.buscarNombreRol = originalBuscarNombreRol;
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