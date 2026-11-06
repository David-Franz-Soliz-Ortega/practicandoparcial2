const {calcularMulta,TOPE}=require("../src/multa");

describe("prueba 1",()=>{
    test("prueba de 0 dias",()=>{
        const resultado=calcularMulta(0);
        expect(resultado).toBe(0);
    }) 

    test("prueba de 3 dias",()=>{
        const resultado=calcularMulta(3);
        expect(resultado).toBe(6);
    }) 

    
});


    
