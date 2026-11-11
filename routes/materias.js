const router = require('express').Router();
const db = require('../db');

// GET /api/materias → lista las materias del usuario con sesión
router.get('/', async (req, res, next) => {
  try {
    const [filas] = await db.query(
      'SELECT id_materia, nombre, descripcion FROM materias WHERE id_usuario = ? ORDER BY nombre',
      [req.id_usuario]
    );
    res.json(filas);
  } catch (e) { next(e); }
});

// POST /api/materias → crea una materia nueva
router.post('/', async (req, res, next) => {
  try {
    const { nombre, descripcion } = req.body;

    if (!nombre || !nombre.trim()) {
      return res.status(400).json({ error: 'El nombre de la materia es obligatorio' });
    }

    const [resultado] = await db.query(
      'INSERT INTO materias (nombre, descripcion, id_usuario) VALUES (?, ?, ?)',
      [nombre.trim(), descripcion || null, req.id_usuario]
    );

    res.status(201).json({
      id_materia: resultado.insertId,
      nombre: nombre.trim(),
      descripcion: descripcion || null
    });
  } catch (e) { next(e); }
});

module.exports = router;