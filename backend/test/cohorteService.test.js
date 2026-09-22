const test = require('node:test');
const assert = require('node:assert/strict');

const cohorteModel = require('../src/models/cohorteModel');
const cursoService = require('../src/services/cursoService');
const usuarioService = require('../src/services/usuarioService');
const cohorteService = require('../src/services/cohorteService');

const BASE = {
  idCurso: 1,
  idDocente: 2,
  nombre: 'Cohorte A',
  fechaInicio: '2026-10-01',
  fechaFin: '2026-12-01',
  costoInscripcion: 150000,
  costoCuotaMensual: 120000,
  tarifaHoraDocente: 45000,
};

const rowCreada = (datos) => ({
  id: 10,
  ...datos,
});

function mockDependencias({ crearCohorte } = {}) {
  const originales = {
    cursoService: {
      obtenerPorId: cursoService.obtenerPorId,
    },
    usuarioService: {
      obtenerPorId: usuarioService.obtenerPorId,
    },
    cohorteModel: {
      crearCohorte: cohorteModel.crearCohorte,
    },
  };

  cursoService.obtenerPorId = async () => ({ id: 1, nombre: 'Curso Test' });
  usuarioService.obtenerPorId = async () => ({ id: 2, idRol: 2, nombre: 'Ana', apellido: 'Docente' });
  cohorteModel.crearCohorte = crearCohorte || (async (datos) => rowCreada(datos));

  return originales;
}

function restaurar(originales) {
  cursoService.obtenerPorId = originales.cursoService.obtenerPorId;
  usuarioService.obtenerPorId = originales.usuarioService.obtenerPorId;
  cohorteModel.crearCohorte = originales.cohorteModel.crearCohorte;
}

test('crearCohorte rechaza una modalidad desconocida', async () => {
  const originales = mockDependencias();
  try {
    await assert.rejects(
      cohorteService.crearCohorte({ ...BASE, modalidad: 'remota' }),
      { message: 'La modalidad debe ser presencial, virtual o hibrida' }
    );
  } finally {
    restaurar(originales);
  }
});

test('crearCohorte exige cupo al menos fisico en modalidad presencial', async () => {
  const originales = mockDependencias();
  try {
    await assert.rejects(
      cohorteService.crearCohorte({ ...BASE, modalidad: 'presencial' }),
      { message: 'El cupo fisico es obligatorio y debe ser mayor a 0' }
    );
    await assert.rejects(
      cohorteService.crearCohorte({ ...BASE, modalidad: 'presencial', cupoFisico: 0 }),
      { message: 'El cupo fisico es obligatorio y debe ser mayor a 0' }
    );
  } finally {
    restaurar(originales);
  }
});

test('crearCohorte exige link de acceso en modalidad virtual', async () => {
  const originales = mockDependencias();
  try {
    await assert.rejects(
      cohorteService.crearCohorte({ ...BASE, modalidad: 'virtual' }),
      { message: 'El link de acceso es obligatorio' }
    );
    await assert.rejects(
      cohorteService.crearCohorte({ ...BASE, modalidad: 'virtual', linkAcceso: 'no-es-url' }),
      { message: 'El link de acceso debe ser una URL valida (https://...)' }
    );
  } finally {
    restaurar(originales);
  }
});

test('crearCohorte exige cupo y link en modalidad hibrida', async () => {
  const originales = mockDependencias();
  try {
    await assert.rejects(
      cohorteService.crearCohorte({ ...BASE, modalidad: 'hibrida' }),
      { message: 'El cupo fisico es obligatorio y debe ser mayor a 0' }
    );
    await assert.rejects(
      cohorteService.crearCohorte({ ...BASE, modalidad: 'hibrida', cupoFisico: 30 }),
      { message: 'El link de acceso es obligatorio' }
    );
  } finally {
    restaurar(originales);
  }
});

test('crearCohorte exige costos mayores a 0', async () => {
  const originales = mockDependencias();
  try {
    await assert.rejects(
      cohorteService.crearCohorte({ ...BASE, modalidad: 'virtual', linkAcceso: 'https://meet.example.com/a', costoInscripcion: 0 }),
      { message: 'El costo de inscripcion debe ser mayor a 0' }
    );
    await assert.rejects(
      cohorteService.crearCohorte({ ...BASE, modalidad: 'virtual', linkAcceso: 'https://meet.example.com/a', costoCuotaMensual: 0 }),
      { message: 'La cuota mensual debe ser mayor a 0' }
    );
    await assert.rejects(
      cohorteService.crearCohorte({ ...BASE, modalidad: 'virtual', linkAcceso: 'https://meet.example.com/a', tarifaHoraDocente: 0 }),
      { message: 'La tarifa por hora del docente debe ser mayor a 0' }
    );
  } finally {
    restaurar(originales);
  }
});

test('crearCohorte rechaza un docente que no tiene rol Docente', async () => {
  const originales = mockDependencias();
  const originalObtenerPorId = usuarioService.obtenerPorId;
  try {
    usuarioService.obtenerPorId = async () => ({ id: 5, idRol: 1, nombre: 'Estu', apellido: 'Diante' });
    await assert.rejects(
      cohorteService.crearCohorte({ ...BASE, idDocente: 5, modalidad: 'virtual', linkAcceso: 'https://meet.example.com/a' }),
      { message: 'El usuario seleccionado no es Docente' }
    );
  } finally {
    usuarioService.obtenerPorId = originalObtenerPorId;
    restaurar(originales);
  }
});

test('crearCohorte valida fechas (fin no anterior a inicio)', async () => {
  const originales = mockDependencias();
  try {
    await assert.rejects(
      cohorteService.crearCohorte({ ...BASE, modalidad: 'virtual', linkAcceso: 'https://meet.example.com/a', fechaInicio: '2026-12-01', fechaFin: '2026-09-01' }),
      { message: 'La fecha de fin debe ser posterior o igual a la de inicio' }
    );
  } finally {
    restaurar(originales);
  }
});

test('crearCohorte persiste una cohorte presencial con cupo fisico', async () => {
  let datosPersistidos;
  const originales = mockDependencias({
    crearCohorte: async (datos) => {
      datosPersistidos = datos;
      return rowCreada(datos);
    },
  });

  try {
    const cohorte = await cohorteService.crearCohorte({
      ...BASE,
      modalidad: 'presencial',
      cupoFisico: 25,
    });

    assert.equal(datosPersistidos.cupo_fisico, 25);
    assert.equal(datosPersistidos.link_acceso, null);
    assert.equal(datosPersistidos.modalidad, 'presencial');
    assert.equal(cohorte.cursoNombre, 'Curso Test');
    assert.equal(cohorte.docenteApellido, 'Docente');
  } finally {
    restaurar(originales);
  }
});

test('crearCohorte persiste una cohorte virtual con link y sin cupo', async () => {
  let datosPersistidos;
  const originales = mockDependencias({
    crearCohorte: async (datos) => {
      datosPersistidos = datos;
      return rowCreada(datos);
    },
  });

  try {
    const cohorte = await cohorteService.crearCohorte({
      ...BASE,
      modalidad: 'virtual',
      linkAcceso: 'https://meet.example.com/curso-a',
    });

    assert.equal(datosPersistidos.link_acceso, 'https://meet.example.com/curso-a');
    assert.equal(datosPersistidos.cupo_fisico, null);
    assert.equal(cohorte.cupoFisico, null);
    assert.equal(cohorte.linkAcceso, 'https://meet.example.com/curso-a');
  } finally {
    restaurar(originales);
  }
});