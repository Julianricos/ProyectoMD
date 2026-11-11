const router = require('express').Router();
const db = require('../db');

const TIPOS = ['Examen', 'Entrega', 'Evento', 'Reunión'];
const FECHA = /^\d{4}-\d{2}-\d{2}$/;

// GET /api/eventos → lista los eventos del usuario con sesión
router.get('/', async (req, res, next) => {
  try {
    const [filas] = await db.query(
      `SELECT id_evento, titulo, descripcion, fecha, tipo
       FROM eventos
       WHERE id_usuario = ?
       ORDER BY fecha`,
      [req.id_usuario]
    );
    res.json(filas);
  } catch (e) { next(e); }
});

// POST /api/eventos → crea un evento nuevo
router.post('/', async (req, res, next) => {
  try {
    const { titulo, descripcion, fecha, tipo } = req.body || {};

    if (!titulo || !titulo.trim()) {
      return res.status(400).json({ error: 'El título es obligatorio' });
    }
    if (!fecha || !FECHA.test(fecha)) {
      return res.status(400).json({ error: 'La fecha es obligatoria y debe tener formato AAAA-MM-DD' });
    }
    if (!TIPOS.includes(tipo)) {
      return res.status(400).json({ error: 'Tipo no válido (Examen, Entrega, Evento o Reunión)' });
    }

    const [r] = await db.query(
      `INSERT INTO eventos (titulo, descripcion, fecha, tipo, id_usuario)
       VALUES (?, ?, ?, ?, ?)`,
      [titulo.trim(), descripcion || null, fecha, tipo, req.id_usuario]
    );

    res.status(201).json({ id_evento: r.insertId, mensaje: 'Evento creado' });
  } catch (e) { next(e); }
});

module.exports = router;