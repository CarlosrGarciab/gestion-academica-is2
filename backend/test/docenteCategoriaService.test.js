const test = require('node:test');
const assert = require('node:assert/strict');

const categoriaDocenteModel = require('../src/models/categoriaDocenteModel');
const docenteCategoriaModel = require('../src/models/docenteCategoriaModel');
const usuarioService = require('../src/services/usuarioService');
const docenteCategoriaService = require('../src/services/docenteCategoriaService');

function mockModel(overrides = {}) {
  const originalModel = {
    buscarCategoria: docenteCategoriaModel.buscarCategoria,
    asignar: docenteCategoriaModel.asignar,
  };
  const originalUser = { obtenerPorId: usuarioService.obtenerPorId };
  docenteCategoriaModel.buscarCategoria = overrides.buscarCategoria || (async () => ({ id: 2, nombre: 'intermedio', tarifa_hora: '60000' }));
  docenteCategoriaModel.asignar = overrides.asignar || (async (datos) => ({ id: 1, ...datos }));
  usuarioService.obtenerPorId = overrides.usuario || (async () => ({ id: 7, idRol: 2, nombre: 'Ana', apellido: 'Docente' }));
  return { originalModel, originalUser };
}

function restaurar({ originalModel, originalUser }) {
  docenteCategoriaModel.buscarCategoria = originalModel.buscarCategoria;
  docenteCategoriaModel.asignar = originalModel.asignar;
  usuarioService.obtenerPorId = originalUser.obtenerPorId;
}

test('asignarCategoria exige fecha de inicio', async () => {
  const originales = mockModel();
  try {
    await assert.rejects(
      docenteCategoriaService.asignarCategoria({ idDocente: 7, idCategoria: 2 }),
      { message: 'La fecha de inicio de la asignacion es obligatoria' }
    );
  } finally {
    restaurar(originales);
  }
});

test('asignarCategoria rechaza fin anterior al inicio', async () => {
  const originales = mockModel();
  try {
    await assert.rejects(
      docenteCategoriaService.asignarCategoria({ idDocente: 7, idCategoria: 2, desde: '2026-02-01', hasta: '2026-01-01' }),
      { message: 'La fecha de fin no puede ser anterior a la de inicio' }
    );
  } finally {
    restaurar(originales);
  }
});

test('asignarCategoria rechaza un usuario que no es Docente', async () => {
  const originales = mockModel({ usuario: async () => ({ id: 8, idRol: 1, nombre: 'Estu', apellido: 'Diante' }) });
  try {
    await assert.rejects(
      docenteCategoriaService.asignarCategoria({ idDocente: 8, idCategoria: 2, desde: '2026-01-01' }),
      { message: 'El usuario no tiene perfil de Docente' }
    );
  } finally {
    restaurar(originales);
  }
});

test('asignarCategoria rechaza una categoria inexistente', async () => {
  const originales = mockModel({ buscarCategoria: async () => null });
  try {
    await assert.rejects(
      docenteCategoriaService.asignarCategoria({ idDocente: 7, idCategoria: 99, desde: '2026-01-01' }),
      { message: 'La categoria seleccionada no existe' }
    );
  } finally {
    restaurar(originales);
  }
});

test('asignarCategoria persiste la asignacion con su tarifa vigente', async () => {
  let datos;
  const originales = mockModel({ asignar: async (d) => { datos = d; return { id: 9, ...d }; } });
  try {
    const asignacion = await docenteCategoriaService.asignarCategoria({ idDocente: 7, idCategoria: 2, desde: '2025-01-01', hasta: null });
    assert.equal(datos.id_usuario, 7);
    assert.equal(datos.id_categoria, 2);
    assert.equal(datos.hasta, null);
    assert.equal(asignacion.categoriaNombre, 'intermedio');
    assert.equal(asignacion.tarifaHora, 60000);
  } finally {
    restaurar(originales);
  }
});

test('categoriaDocenteService valida categoria desconocida', async () => {
  const originales = { listar: categoriaDocenteModel.listar, crear: categoriaDocenteModel.crear, listarVigentes: categoriaDocenteModel.listarVigentes, buscarVigentePorNombre: categoriaDocenteModel.buscarVigentePorNombre };
  try {
    const { crear: servicioCrear } = require('../src/services/categoriaDocenteService');
    await assert.rejects(
      servicioCrear({ nombre: 'experto', tarifaHora: 50000, vigenciaDesde: '2026-01-01' }),
      { message: 'La categoria debe ser principiante, intermedio o avanzado' }
    );
  } finally {
    Object.assign(categoriaDocenteModel, originales);
  }
});