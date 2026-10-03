const test = require('node:test');
const assert = require('node:assert/strict');

const nivelCursoModel = require('../src/models/nivelCursoModel');
const nivelCursoService = require('../src/services/nivelCursoService');

function mockModel(overrides = {}) {
  const originales = {
    listar: nivelCursoModel.listar,
    listarVigentes: nivelCursoModel.listarVigentes,
    buscarVigentePorNombre: nivelCursoModel.buscarVigentePorNombre,
    buscarUltimoDesde: nivelCursoModel.buscarUltimoDesde,
    crear: nivelCursoModel.crear,
  };
  Object.assign(nivelCursoModel, { listar: async () => [], listarVigentes: async (f) => overrides.vigentes || [], buscarVigentePorNombre: overrides.buscarVigentePorNombre || (async (n, f) => ({ nombre: n, precio_inscripcion: '150000' })), buscarUltimoDesde: overrides.buscarUltimoDesde || (async () => null), crear: overrides.crear || (async (datos) => ({ id: 1, ...datos })) });
  return originales;
}

function restaurar(originales) {
  Object.assign(nivelCursoModel, originales);
}

test('crear nivel rechaza un nivel desconocido', async () => {
  const originales = mockModel();
  try {
    await assert.rejects(
      nivelCursoService.crear({ nombre: 'experto', precioInscripcion: 100000, vigenciaDesde: '2026-01-01' }),
      { message: 'El nivel debe ser principiante, intermedio o avanzado' }
    );
  } finally {
    restaurar(originales);
  }
});

test('crear nivel rechaza precio menor o igual a 0', async () => {
  const originales = mockModel();
  try {
    await assert.rejects(
      nivelCursoService.crear({ nombre: 'principiante', precioInscripcion: 0, costoCuotaMensual: 100000, vigenciaDesde: '2026-01-01' }),
      { message: 'El precio de inscripcion debe ser mayor a 0' }
    );
  } finally {
    restaurar(originales);
  }
});

test('crear nivel rechaza cuota mensual menor o igual a 0', async () => {
  const originales = mockModel();
  try {
    await assert.rejects(
      nivelCursoService.crear({ nombre: 'principiante', precioInscripcion: 150000, costoCuotaMensual: 0, vigenciaDesde: '2026-01-01' }),
      { message: 'La cuota mensual debe ser mayor a 0' }
    );
  } finally {
    restaurar(originales);
  }
});

test('crear nivel exige fecha de inicio de vigencia', async () => {
  const originales = mockModel();
  try {
    await assert.rejects(
      nivelCursoService.crear({ nombre: 'principiante', precioInscripcion: 150000, costoCuotaMensual: 100000 }),
      { message: 'La fecha de inicio de vigencia es obligatoria' }
    );
  } finally {
    restaurar(originales);
  }
});

test('crear nivel rechaza vigencia con fin anterior al inicio', async () => {
  const originales = mockModel();
  try {
    await assert.rejects(
      nivelCursoService.crear({ nombre: 'principiante', precioInscripcion: 150000, costoCuotaMensual: 100000, vigenciaDesde: '2026-02-01', vigenciaHasta: '2026-01-01' }),
      { message: 'La fecha de fin de vigencia no puede ser anterior a la de inicio' }
    );
  } finally {
    restaurar(originales);
  }
});

test('crear nivel rechaza una nueva vigencia que no sea posterior a la anterior', async () => {
  const originales = mockModel({ buscarUltimoDesde: async () => '2026-10-01' });
  try {
    await assert.rejects(
      nivelCursoService.crear({ nombre: 'principiante', precioInscripcion: 160000, costoCuotaMensual: 110000, vigenciaDesde: '2026-10-01' }),
      { message: 'Ya hay un arancel registrado para el nivel principiante desde 2026-10-01; la nueva vigencia debe comenzar despues' }
    );
  } finally {
    restaurar(originales);
  }
});

test('crear nivel persiste con la fecha de fin nula', async () => {
  let datos;
  const originales = mockModel({
    crear: async (d) => { datos = d; return { id: 1, ...d }; },
  });
  try {
    const nivel = await nivelCursoService.crear({ nombre: 'Intermedio', precioInscripcion: '250000', costoCuotaMensual: '150000', vigenciaDesde: '2026-01-01' });
    assert.equal(datos.nombre, 'intermedio');
    assert.equal(datos.vigencia_hasta, null);
    assert.equal(datos.costo_cuota_mensual, 150000);
    assert.equal(nivel.precioInscripcion, 250000);
    assert.equal(nivel.costoCuotaMensual, 150000);
  } finally {
    restaurar(originales);
  }
});

test('obtenerPrecioVigente lanza error si no hay precio vigente', async () => {
  const originales = mockModel({ buscarVigentePorNombre: async () => null });
  try {
    await assert.rejects(
      nivelCursoService.obtenerPrecioVigente('principiante', '2015-01-01'),
      { message: 'No hay precio de inscripcion vigente para el nivel principiante' }
    );
  } finally {
    restaurar(originales);
  }
});

test('obtenerPrecioVigente devuelve el precio vigente', async () => {
  const originales = mockModel({ buscarVigentePorNombre: async () => ({ nombre: 'principiante', precio_inscripcion: '155000' }) });
  try {
    const precio = await nivelCursoService.obtenerPrecioVigente('principiante', '2026-01-01');
    assert.equal(precio, 155000);
  } finally {
    restaurar(originales);
  }
});