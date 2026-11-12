const { construirEventoPrestamoRegistrado }=require("../src/eventos.js");
const contrato=require("../contratos/prestamo-registrado.contrato.json");

describe("Prueba de contrato",()=>{
    test("Cumple con el contrato",()=>{
        const datosentrada={
            prestamoID:'PRES-001',
            libro:'dracula',
            lector:'David Soliz',
            correo:'david@gmail.com'
        }
        const evento=construirEventoPrestamoRegistrado(datosentrada);

        expect(evento.tipo).toBe(contrato.evento);

        contrato.camposObligatorios.forEach(campo=>{
            expect(evento).toHaveProperty(campo);
            const tipoEsperado=contrato.tipos[campo];
            expect(typeof evento[campo]).toBe(tipoEsperado);
        })
    });
});