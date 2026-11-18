const router = require('express').Router();
const db = require('../db');

// Un color distinto para las tareas y para cada tipo de evento
const COLOR_TAREA = '#3b82f6';
const COLORES_EVENTO = {
  'Examen':  '#ef4444',
  'Entrega': '#f97316',
  'Evento':  '#8b5cf6',
  'Reunión': '#14b8a6'
};

// GET /api/calendario → tareas y eventos del usuario en una sola lista
router.get('/', async (req, res, next) => {
  try {
    // Tareas: solo las que tienen fecha de entrega
    const [tareas] = await db.query(
      `SELECT id_tarea, titulo, fecha_entrega
       FROM tareas
       WHERE id_usuario = ? AND fecha_entrega IS NOT NULL`,
      [req.id_usuario]
    );

    const [eventos] = await db.query(
      'SELECT id_evento, titulo, fecha, tipo FROM eventos WHERE id_usuario = ?',
      [req.id_usuario]
    );

    const lista = [
      ...tareas.map(t => ({
        id: 'tarea-' + t.id_tarea,
        title: t.titulo,
        start: t.fecha_entrega,
        color: COLOR_TAREA,
        tipo: 'Tarea'
      })),
      ...eventos.map(e => ({
        id: 'evento-' + e.id_evento,
        title: e.titulo,
        start: e.fecha,
        color: COLORES_EVENTO[e.tipo] || '#6b7280',
        tipo: e.tipo
      }))
    ];

    // Ordenadas por fecha (las fechas AAAA-MM-DD se ordenan bien como texto)
    lista.sort((a, b) => (a.start < b.start ? -1 : a.start > b.start ? 1 : 0));

    res.json(lista);
  } catch (e) { next(e); }
});

module.exports = router;