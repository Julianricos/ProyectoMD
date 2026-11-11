const router = require('express').Router();
const db = require('../db');

const ESTADOS = ['Pendiente', 'En progreso', 'Completada'];
const FECHA = /^\d{4}-\d{2}-\d{2}$/;

// Revisa que la materia exista y sea del usuario
async function materiaEsDelUsuario(id_materia, id_usuario) {
  const [filas] = await db.query(
    'SELECT id_materia FROM materias WHERE id_materia = ? AND id_usuario = ?',
    [id_materia, id_usuario]
  );
  return filas.length > 0;
}

// Valida los datos de una tarea; devuelve un mensaje de error o null si todo está bien
function validarTarea({ titulo, estado, fecha_entrega, id_materia }) {
  if (!titulo || !titulo.trim()) return 'El título es obligatorio';
  if (estado && !ESTADOS.includes(estado)) return 'Estado no válido (Pendiente, En progreso o Completada)';
  if (fecha_entrega && !FECHA.test(fecha_entrega)) return 'La fecha debe tener formato AAAA-MM-DD';
  if (!id_materia) return 'La materia es obligatoria';
  return null;
}

// GET /api/tareas  (opcional: ?estado=Pendiente)
router.get('/', async (req, res, next) => {
  try {
    const { estado } = req.query;
    let sql = `SELECT t.id_tarea, t.titulo, t.descripcion, t.fecha_entrega,
                      t.estado, t.id_materia, m.nombre AS materia
               FROM tareas t
               JOIN materias m ON m.id_materia = t.id_materia
               WHERE t.id_usuario = ?`;
    const params = [req.id_usuario];

    if (estado) {
      if (!ESTADOS.includes(estado)) {
        return res.status(400).json({ error: 'Estado no válido' });
      }
      sql += ' AND t.estado = ?';
      params.push(estado);
    }
    sql += ' ORDER BY t.fecha_entrega';

    const [filas] = await db.query(sql, params);
    res.json(filas);
  } catch (e) { next(e); }
});

// GET /api/tareas/:id
router.get('/:id', async (req, res, next) => {
  try {
    const [filas] = await db.query(
      `SELECT t.id_tarea, t.titulo, t.descripcion, t.fecha_entrega,
              t.estado, t.id_materia, m.nombre AS materia
       FROM tareas t
       JOIN materias m ON m.id_materia = t.id_materia
       WHERE t.id_tarea = ? AND t.id_usuario = ?`,
      [req.params.id, req.id_usuario]
    );
    if (filas.length === 0) return res.status(404).json({ error: 'Tarea no encontrada' });
    res.json(filas[0]);
  } catch (e) { next(e); }
});

// POST /api/tareas
router.post('/', async (req, res, next) => {
  try {
    const datos = req.body || {};
    const { titulo, descripcion, fecha_entrega, estado, id_materia } = datos;

    const error = validarTarea(datos);
    if (error) return res.status(400).json({ error });

    if (!(await materiaEsDelUsuario(id_materia, req.id_usuario))) {
      return res.status(400).json({ error: 'La materia no existe o no es tuya' });
    }

    const [r] = await db.query(
      `INSERT INTO tareas (titulo, descripcion, fecha_entrega, estado, id_usuario, id_materia)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [titulo.trim(), descripcion || null, fecha_entrega || null,
       estado || 'Pendiente', req.id_usuario, id_materia]
    );
    res.status(201).json({ id_tarea: r.insertId, mensaje: 'Tarea creada' });
  } catch (e) { next(e); }
});

// PUT /api/tareas/:id  (reemplaza los datos de la tarea)
router.put('/:id', async (req, res, next) => {
  try {
    const datos = req.body || {};
    const { titulo, descripcion, fecha_entrega, estado, id_materia } = datos;

    const error = validarTarea(datos);
    if (error) return res.status(400).json({ error });

    if (!(await materiaEsDelUsuario(id_materia, req.id_usuario))) {
      return res.status(400).json({ error: 'La materia no existe o no es tuya' });
    }

    const [r] = await db.query(
      `UPDATE tareas
       SET titulo = ?, descripcion = ?, fecha_entrega = ?, estado = ?, id_materia = ?
       WHERE id_tarea = ? AND id_usuario = ?`,
      [titulo.trim(), descripcion || null, fecha_entrega || null,
       estado || 'Pendiente', id_materia, req.params.id, req.id_usuario]
    );
    if (r.affectedRows === 0) return res.status(404).json({ error: 'Tarea no encontrada' });
    res.json({ mensaje: 'Tarea actualizada' });
  } catch (e) { next(e); }
});

// PATCH /api/tareas/:id/estado  (solo cambia el estado)
router.patch('/:id/estado', async (req, res, next) => {
  try {
    const { estado } = req.body || {};
    if (!ESTADOS.includes(estado)) {
      return res.status(400).json({ error: 'Estado no válido (Pendiente, En progreso o Completada)' });
    }

    const [r] = await db.query(
      'UPDATE tareas SET estado = ? WHERE id_tarea = ? AND id_usuario = ?',
      [estado, req.params.id, req.id_usuario]
    );
    if (r.affectedRows === 0) return res.status(404).json({ error: 'Tarea no encontrada' });
    res.json({ mensaje: 'Estado actualizado', estado });
  } catch (e) { next(e); }
});

// DELETE /api/tareas/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const [r] = await db.query(
      'DELETE FROM tareas WHERE id_tarea = ? AND id_usuario = ?',
      [req.params.id, req.id_usuario]
    );
    if (r.affectedRows === 0) return res.status(404).json({ error: 'Tarea no encontrada' });
    res.json({ mensaje: 'Tarea eliminada' });
  } catch (e) { next(e); }
});

module.exports = router;