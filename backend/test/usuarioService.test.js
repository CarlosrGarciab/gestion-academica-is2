const test = require('node:test');
const assert = require('node:assert/strict');

const usuarioModel = require('../src/models/usuarioModel');
const usuarioService = require('../src/services/usuarioService');

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

test('cambiarRol rechaza el rol Administrador', async () => {
  const originalBuscarIdRolAsignable = usuarioModel.buscarIdRolAsignable;
  usuarioModel.buscarIdRolAsignable = async () => undefined;

  try {
    await assert.rejects(
      usuarioService.cambiarRol(7, 3),
      { message: 'El rol no esta disponible para asignacion' }
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