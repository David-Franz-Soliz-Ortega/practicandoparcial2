// Regla de negocio de la Biblioteca USFX (ver el enunciado, Tarea 1):
//  - devolución a tiempo (0 días de retraso)  -> multa 0
//  - por cada día de retraso                  -> porDia bolivianos
//  - la multa nunca supera el tope de 50 Bs
//  - días de retraso negativos                -> Error("dias de retraso invalidos")
const TOPE = 50;

function calcularMulta(diasRetraso, porDia = 2) {
  if (diasRetraso < 0) throw new Error("dias de retraso invalidos");
  return Math.min(diasRetraso * porDia,TOPE);
} 

module.exports = { calcularMulta, TOPE };
