// Tarea 1.4 y Tarea 2: construir el evento que se publica cuando se registra un préstamo.
// Debe cumplir el contrato contratos/prestamo-registrado.contrato.json
const crypto=require("crypto");
function construirEventoPrestamoRegistrado(prestamo) {
  // TODO: completar
  return {
    idEvento: crypto.randomUUID(),
    tipo: "PrestamoRegistrado",
    prestamoId: String(prestamo.prestamoId),
    lector: prestamo.lector,
    correo: prestamo.correo,
    libro: prestamo.libro,
    registradoEn: new Date().toISOString(),
    idCorrelacion: prestamo.idCorrelacion

   
  };
}

module.exports = { construirEventoPrestamoRegistrado };
