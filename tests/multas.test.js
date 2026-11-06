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
      test('Debe limitar la multa al tope de 50 Bs cuando se alcanzan 40 dias de retraso (tope)', () => {
 
    expect(calcularMulta(40)).toBe(50);
  });

  test('Debe lanzar un error con el mensaje "dias de retraso invalidos" si los dias de retraso son negativos', () => {
    expect(() => {
      calcularMulta(-1);
    }).toThrow('dias de retraso invalidos');
  });

    
});


    
