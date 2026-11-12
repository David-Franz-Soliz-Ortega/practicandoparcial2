const express = require("express");
const crypto = require("crypto");
const pino = require("pino");
const client = require("prom-client");
const { calcularMulta } = require("./multa");
const { construirEventoPrestamoRegistrado } = require("./eventos");

const logger = pino({
  timestamp: pino.stdTimeFunctions.isoTime,
  base: { servicio: "prestamos-api" }
});

const register = new client.Registry();
client.collectDefaultMetrics({ register });

const httpRequestDurationMicroseconds = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duracion de peticiones HTTP en segundos',
  labelNames: ['metodo', 'ruta', 'codigo'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10]
});
register.registerMetric(httpRequestDurationMicroseconds);

const prestamosRegistradosTotal = new client.Counter({
  name: 'prestamos_registrados_total',
  help: 'Total de prestamos registrados'
});
register.registerMetric(prestamosRegistradosTotal);

function crearApp({ publicar = async () => {} } = {}) {
  const app = express();
  app.use(express.json());
  const prestamos = [];

  app.use((req, res, next) => {
    const idCorrelacion = req.headers['x-correlation-id'] || crypto.randomUUID();
    req.idCorrelacion = idCorrelacion;
    res.setHeader('x-correlation-id', idCorrelacion);

    req.log = logger.child({ idCorrelacion });
    req.log.info({ msg: "Peticion entrante", method: req.method, url: req.url });

    const end = httpRequestDurationMicroseconds.startTimer();
    
    res.on('finish', () => {
      const ruta = req.route ? req.route.path : req.path;
      end({ metodo: req.method, ruta: ruta, codigo: res.statusCode });
      req.log.info({ msg: "Peticion finalizada", statusCode: res.statusCode });
    });
    
    next();
  });

  app.get("/metrics", async (req, res) => {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  });

  app.get("/salud", (_req, res) => res.json({ estado: "ok" }));
  
  app.get("/prestamos", (_req, res) => res.json(prestamos));

  app.post("/prestamos", async (req, res) => {
    const { lector, correo, libro, diasPrestamo } = req.body || {};
    if (!lector || !libro) {
      req.log.warn("Faltan campos obligatorios");
      return res.status(400).json({ error: "lector y libro son obligatorios" });
    }
    const prestamo = {
      id: "PRE-" + (prestamos.length + 1),
      lector, 
      correo, 
      libro,
      diasPrestamo: diasPrestamo || 7,
      registradoEn: new Date().toISOString(),
    };
    prestamos.push(prestamo);
    
    const evento = construirEventoPrestamoRegistrado({
      prestamoId: prestamo.id,
      lector: prestamo.lector,
      correo: prestamo.correo || "",
      libro: prestamo.libro,
      idCorrelacion: req.idCorrelacion 
    });
    
    await publicar("prestamo.registrado", evento);
    prestamosRegistradosTotal.inc(); 

    res.status(201).json(prestamo);
  });

  app.post("/prestamos/:id/devolucion", (req, res) => {
    const prestamo = prestamos.find((p) => p.id === req.params.id);
    if (!prestamo) return res.status(404).json({ error: "prestamo no encontrado" });
    const porDia = Number(process.env.MULTA_POR_DIA || 2);
    try {
      const multa = calcularMulta(Number(req.body.diasRetraso || 0), porDia);
      prestamo.devuelto = true;
      res.json({ ...prestamo, multa });
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  });

  return app;
}

module.exports = { crearApp };