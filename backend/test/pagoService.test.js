const test = require("node:test");
const assert = require("node:assert/strict");

const pagoService = require("../src/services/pagoService");

test("registrarPago rechaza una inscripción inválida", async () => {
    await assert.rejects(
        pagoService.registrarPago({ idInscripcion: 0, monto: 150000 }),
        { message: "Inscripción inválida" }
    );
});

test("registrarPago rechaza un monto no positivo", async () => {
    await assert.rejects(
        pagoService.registrarPago({ idInscripcion: 1, monto: 0 }),
        { message: "El monto debe ser mayor a 0" }
    );
});
