const { crearApp } = require("./app");
const amqplib = require("amqplib");
const PORT = process.env.PORT || 3000;

async function crearPublicador() {
 
  if (!process.env.RABBITMQ_URL) {
    console.warn("[prestamos] RABBITMQ_URL no definida: los eventos no se publican");
    return async () => {};
  }
  
  // TODO Tarea 2 completado: conectar con amqplib y devolver la función publicar
  try {
    const conexion = await amqplib.connect(process.env.RABBITMQ_URL);
    const canal = await conexion.createChannel();
    
   
    await canal.assertExchange('biblioteca', 'topic', { durable: true });
    console.log('Conectado a RabbitMQ (Exchange: biblioteca)');


    return async (clave, evento) => {
      const mensaje = Buffer.from(JSON.stringify(evento));

      canal.publish('biblioteca', clave, mensaje, { persistent: true });
      console.log(`[x] Evento publicado con clave: ${clave}`);
    };
  } catch (error) {
    console.error(' Error conectando a RabbitMQ:', error.message);
    return async () => {}; 
  }
}

crearPublicador()
  .then((publicar) => {
    const app = crearApp({ publicar });
    app.listen(PORT, () => console.log("[prestamos] API en el puerto " + PORT));
  })
  .catch((e) => {
    console.error("no se pudo iniciar:", e.message);
    process.exit(1);
  });