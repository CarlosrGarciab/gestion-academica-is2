const test = require('node:test');
const assert = require('node:assert/strict');

const usuarioModel = require('../src/models/usuarioModel');
const usuarioService = require('../src/services/usuarioService');

const BASE_CREAR = {
  nombre: 'Laura',
  apellido: 'Docente',
  email: 'laura@example.com',
  password: 'clave1234',
  idRol: 2,
};

test('crearUsuario crea un usuario con el rol asignado', async () => {
  const origBuscarIdRolAsignable = usuarioModel.buscarIdRolAsignable;
  const origBuscarPorEmail = usuarioModel.buscarPorEmail;
  const origCrearUsuario = usuarioModel.crearUsuario;

  usuarioModel.buscarIdRolAsignable = async (idRol) => idRol;
  usuarioModel.buscarPorEmail = async () => undefined;
  let datos;
  usuarioModel.crearUsuario = async (d) => { datos = d; return { id: 9, nombre: d.nombre, apellido: d.apellido, email: d.email, id_rol: d.id_rol, activo: true }; };

  try {
    const usuario = await usuarioService.crearUsuario(BASE_CREAR);
    assert.equal(usuario.idRol, 2);
    assert.equal(usuario.activo, true);
    assert.equal(datos.id_rol, 2);
    assert.equal(datos.email, 'laura@example.com');
    assert.match(datos.password_hash, /^\$2[aby]\$/);
  } finally {
    usuarioModel.buscarIdRolAsignable = origBuscarIdRolAsignable;
    usuarioModel.buscarPorEmail = origBuscarPorEmail;
    usuarioModel.crearUsuario = origCrearUsuario;
  }
});

test('crearUsuario rechaza password muy corta', async () => {
  const origBuscarIdRolAsignable = usuarioModel.buscarIdRolAsignable;
  usuarioModel.buscarIdRolAsignable = async () => undefined;
  try {
    await assert.rejects(
      usuarioService.crearUsuario({ ...BASE_CREAR, password: 'abc' }),
      { message: 'La password debe tener al menos 8 caracteres, una letra y un numero' }
    );
  } finally {
    usuarioModel.buscarIdRolAsignable = origBuscarIdRolAsignable;
  }
});

test('crearUsuario rechaza rol no asignable', async () => {
  const origBuscarIdRolAsignable = usuarioModel.buscarIdRolAsignable;
  usuarioModel.buscarIdRolAsignable = async () => undefined;
  try {
    await assert.rejects(
      usuarioService.crearUsuario(BASE_CREAR),
      { message: 'El rol no esta disponible para asignacion' }
    );
  } finally {
    usuarioModel.buscarIdRolAsignable = origBuscarIdRolAsignable;
  }
});

test('crearUsuario rechaza email ya utilizado', async () => {
  const origBuscarIdRolAsignable = usuarioModel.buscarIdRolAsignable;
  const origBuscarPorEmail = usuarioModel.buscarPorEmail;
  usuarioModel.buscarIdRolAsignable = async (idRol) => idRol;
  usuarioModel.buscarPorEmail = async () => ({ id: 1 });
  try {
    await assert.rejects(
      usuarioService.crearUsuario(BASE_CREAR),
      { message: 'Email ya utilizado' }
    );
  } finally {
    usuarioModel.buscarIdRolAsignable = origBuscarIdRolAsignable;
    usuarioModel.buscarPorEmail = origBuscarPorEmail;
  }
});

test('cambiarRol asigna un rol Editable (Docente o Estudiante)', async () => {
  const originalBuscarIdRolAsignable = usuarioModel.buscarIdRolAsignable;
  const originalActualizarRol = usuarioModel.actualizarRol;

  usuarioModel.buscarIdRolAsignable = async (idRol) => [1, 2].includes(idRol) ? idRol : undefined;
  usuarioModel.actualizarRol = async (id, idRol) => ({
    id: Number(id),
    nombre: 'Ana',
    apellido: 'Prueba',
    email: 'ana@example.com',
    id_rol: idRol,
    activo: true,
  });

  try {
    const docente = await usuarioService.cambiarRol(7, 2);
    assert.equal(docente.idRol, 2);

    const estudiante = await usuarioService.cambiarRol(7, 1);
    assert.equal(estudiante.idRol, 1);
  } finally {
    usuarioModel.buscarIdRolAsignable = originalBuscarIdRolAsignable;
    usuarioModel.actualizarRol = originalActualizarRol;
  }
});

test('cambiarRol permite asignar el rol Administrador', async () => {
  const originalBuscarIdRolAsignable = usuarioModel.buscarIdRolAsignable;
  const originalActualizarRol = usuarioModel.actualizarRol;

  usuarioModel.buscarIdRolAsignable = async (idRol) => idRol;
  usuarioModel.actualizarRol = async (id, idRol) => ({
    id: Number(id),
    nombre: 'Ana',
    apellido: 'Prueba',
    email: 'ana@example.com',
    id_rol: idRol,
    activo: true,
  });

  try {
    const admin = await usuarioService.cambiarRol(7, 3);
    assert.equal(admin.idRol, 3);
  } finally {
    usuarioModel.buscarIdRolAsignable = originalBuscarIdRolAsignable;
    usuarioModel.actualizarRol = originalActualizarRol;
  }
});

test('cambiarRol impide que el admin cambie su propio rol', async () => {
  const originalBuscarIdRolAsignable = usuarioModel.buscarIdRolAsignable;
  usuarioModel.buscarIdRolAsignable = async (idRol) => idRol;

  try {
    await assert.rejects(
      usuarioService.cambiarRol(5, 1, 5),
      { message: 'No puede cambiarse el rol a sí mismo' }
    );
  } finally {
    usuarioModel.buscarIdRolAsignable = originalBuscarIdRolAsignable;
  }
});

test('cambiarRol lanza error si el usuario no existe', async () => {
  const originalBuscarIdRolAsignable = usuarioModel.buscarIdRolAsignable;
  const originalActualizarRol = usuarioModel.actualizarRol;

  usuarioModel.buscarIdRolAsignable = async (idRol) => idRol;
  usuarioModel.actualizarRol = async () => undefined;

  try {
    await assert.rejects(
      usuarioService.cambiarRol(999, 2),
      { message: 'Usuario no encontrado' }
    );
  } finally {
    usuarioModel.buscarIdRolAsignable = originalBuscarIdRolAsignable;
    usuarioModel.actualizarRol = originalActualizarRol;
  }
});

test('cambiarActivo lanza error si el usuario no existe', async () => {
  const originalBuscarPorId = usuarioModel.buscarPorId;
  usuarioModel.buscarPorId = async () => undefined;

  try {
    await assert.rejects(
      usuarioService.cambiarActivo(999, false, 7),
      { message: 'Usuario no encontrado' }
    );
  } finally {
    usuarioModel.buscarPorId = originalBuscarPorId;
  }
});

test('cambiarActivo impide desactivar la propia cuenta', async () => {
  const originalBuscarPorId = usuarioModel.buscarPorId;
  usuarioModel.buscarPorId = async () => ({ id: 7, id_rol: 2 });

  try {
    await assert.rejects(
      usuarioService.cambiarActivo(7, false, 7),
      { message: 'No puede desactivar su propia cuenta' }
    );
  } finally {
    usuarioModel.buscarPorId = originalBuscarPorId;
  }
});

test('cambiarActivo impide desactivar a un Administrador', async () => {
  const originalBuscarPorId = usuarioModel.buscarPorId;
  const originalBuscarNombreRol = usuarioModel.buscarNombreRol;
  usuarioModel.buscarPorId = async () => ({ id: 3, id_rol: 3 });
  usuarioModel.buscarNombreRol = async (idRol) => (idRol === 3 ? 'Administrador' : 'Docente');

  try {
    await assert.rejects(
      usuarioService.cambiarActivo(3, false, 7),
      { message: 'No se puede desactivar un Administrador' }
    );
  } finally {
    usuarioModel.buscarPorId = originalBuscarPorId;
    usuarioModel.buscarNombreRol = originalBuscarNombreRol;
  }
});

test('cambiarActivo desactiva un usuario comun', async () => {
  const originalBuscarPorId = usuarioModel.buscarPorId;
  const originalBuscarNombreRol = usuarioModel.buscarNombreRol;
  const originalCambiarActivo = usuarioModel.cambiarActivo;
  usuarioModel.buscarPorId = async () => ({ id: 7, id_rol: 2 });
  usuarioModel.buscarNombreRol = async () => 'Docente';
  usuarioModel.cambiarActivo = async (id, activo) => {
    assert.equal(Number(id), 7);
    assert.equal(activo, false);
    return true;
  };

  try {
    const resultado = await usuarioService.cambiarActivo(7, false, 1);
    assert.deepEqual(resultado, { id: 7, activo: false });
  } finally {
    usuarioModel.buscarPorId = originalBuscarPorId;
    usuarioModel.buscarNombreRol = originalBuscarNombreRol;
    usuarioModel.cambiarActivo = originalCambiarActivo;
  }
});