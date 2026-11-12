// avisos.js
const amqplib = require('amqplib');
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://admin:admin123@localhost';

async function iniciarConsumidor() {
  try {
    const conexion = await amqplib.connect(RABBITMQ_URL);
    const canal = await conexion.createChannel();

    // Declarar exchanges
    await canal.assertExchange('biblioteca', 'topic', { durable: true });
    await canal.assertExchange('biblioteca.muertos', 'fanout', { durable: true });

    // 2.4: Cola de mensajes muertos
    await canal.assertQueue('avisos.muertos', { durable: true });
    await canal.bindQueue('avisos.muertos', 'biblioteca.muertos', '');

    // 2.3: Cola principal con Dead Letter Exchange configurado
    await canal.assertQueue('avisos.correo', {
      durable: true,
      arguments: {
        'x-dead-letter-exchange': 'biblioteca.muertos'
      }
    });

    // Enlazar con el patrón prestamo.*
    await canal.bindQueue('avisos.correo', 'biblioteca', 'prestamo.*');

    // 2.3: prefetch(1)
    canal.prefetch(1);
    console.log('Consumidor de avisos listo. Esperando mensajes...');

    canal.consume('avisos.correo', (mensaje) => {
      if (mensaje !== null) {
        const evento = JSON.parse(mensaje.content.toString());
        const { correo, prestamoId } = evento;
        console.log(`\n[Correlación: ${idCorrelacion}] Evaluando préstamo ID: ${prestamoId}`);
        // 2.4: Validación de correo ("@")
        if (!correo || !correo.includes('@')) {
          console.error(`\n[-] Correo inválido: "${correo}". Rechazando a DLQ...`);
          // nack(mensaje, allUpTo, requeue) -> requeue en false lo manda a la cola de muertos
          canal.nack(mensaje, false, false);
        } else {
          // 2.3: Confirmación manual (ack) después de simular envío
          console.log(`\nEnviando aviso al correo: ${correo} (Préstamo: ${prestamoId})`);
          canal.ack(mensaje);
        }
      }
    });

  } catch (error) {
    console.error(' Error en el consumidor:', error);
  }
}

iniciarConsumidor();