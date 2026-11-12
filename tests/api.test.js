const request = require('supertest');
const { crearApp } = require('../src/app');

describe('Endpoints de la API', () => {
  let mock;
  let app;

  beforeEach(() => {
    mock = jest.fn();
   
    app = crearApp({ publicar: mock });
  });

  test('Post valido 201', async () => {
    const payload = { lector: 'David Soliz', correo: 'david@correo.com', libro: 'La Odisea' };
    
    const response = await request(app)
      .post('/prestamos')
      .send(payload);

    expect(response.status).toBe(201);
    expect(mock).toHaveBeenCalledWith('prestamo.registrado', expect.any(Object));
  });

  test('Error sin libro', async () => {
    const payloaderror = { lector: 'David Soliz' }; 

    const response = await request(app)
      .post('/prestamos')
      .send(payloaderror);

    expect(response.status).toBe(400);
    expect(mock).not.toHaveBeenCalled();
  });

  test('Devolucion de prestamo procesa multa correctamente', async () => {
    await request(app).post('/prestamos').send({ lector: 'David', libro: 'Cien Años' });
    

    const response = await request(app)
      .post('/prestamos/PRE-1/devolucion')
      .send({ diasRetraso: 3 });

    expect(response.status).toBe(200);
    expect(response.body.multa).toBe(6); 
    expect(response.body.devuelto).toBe(true);
  });
});