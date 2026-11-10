const router = require('express').Router();
const db = require('../db');
const { soloMiembro, soloAdmin } = require('../middleware/grupo');

const texto = (v) => (typeof v === 'string' ? v.trim() : '');

// GET /api/grupos → grupos del usuario, con su rol y número de miembros
router.get('/', async (req, res, next) => {
  try {
    const [filas] = await db.query(
      `SELECT g.id_grupo, g.nombre, g.descripcion, g.fecha_creacion, gu.rol,
              (SELECT COUNT(*) FROM grupo_usuarios x WHERE x.id_grupo = g.id_grupo) AS num_miembros
         FROM grupos g
         JOIN grupo_usuarios gu ON gu.id_grupo = g.id_grupo
        WHERE gu.id_usuario = ?
        ORDER BY g.nombre`, [req.id_usuario]);
    res.json(filas);
  } catch (e) { next(e); }
});

// POST /api/grupos { nombre, descripcion } → crea el grupo; el creador queda como admin (transacción)
router.post('/', async (req, res, next) => {
  const nombre = texto(req.body?.nombre);
  const descripcion = texto(req.body?.descripcion) || null;
  if (!nombre) return res.status(400).json({ error: 'El nombre del grupo es obligatorio' });
  if (nombre.length > 100) return res.status(400).json({ error: 'El nombre no puede pasar de 100 caracteres' });

  let conn;
  try {
    conn = await db.getConnection();
    await conn.beginTransaction();
    const [g] = await conn.query(
      'INSERT INTO grupos (nombre, descripcion, fecha_creacion) VALUES (?, ?, CURDATE())', [nombre, descripcion]);
    await conn.query(
      "INSERT INTO grupo_usuarios (id_grupo, id_usuario, rol) VALUES (?, ?, 'admin')", [g.insertId, req.id_usuario]);
    await conn.commit();
    res.status(201).json({ id_grupo: g.insertId, nombre, descripcion, rol: 'admin', num_miembros: 1 });
  } catch (e) {
    if (conn) await conn.rollback();
    next(e);
  } finally {
    if (conn) conn.release();
  }
});

// GET /api/grupos/:id → detalle del grupo y el rol del usuario en él
router.get('/:id', soloMiembro, async (req, res, next) => {
  try {
    const [filas] = await db.query(
      'SELECT id_grupo, nombre, descripcion, fecha_creacion FROM grupos WHERE id_grupo = ?', [req.id_grupo]);
    res.json({ ...filas[0], rol: req.rol_grupo });
  } catch (e) { next(e); }
});

// GET /api/grupos/:id/miembros → miembros con su rol (admins primero)
router.get('/:id/miembros', soloMiembro, async (req, res, next) => {
  try {
    const [filas] = await db.query(
      `SELECT u.id_usuario, u.nombre, u.apellido, u.correo, gu.rol
         FROM grupo_usuarios gu
         JOIN usuarios u ON u.id_usuario = gu.id_usuario
        WHERE gu.id_grupo = ?
        ORDER BY (gu.rol = 'admin') DESC, u.nombre`, [req.id_grupo]);
    res.json(filas);
  } catch (e) { next(e); }
});

// POST /api/grupos/:id/miembros { correo } → agrega a un usuario registrado (solo admin)
router.post('/:id/miembros', soloAdmin, async (req, res, next) => {
  try {
    const correo = texto(req.body?.correo).toLowerCase();
    if (!correo) return res.status(400).json({ error: 'El correo es obligatorio' });

    const [u] = await db.query('SELECT id_usuario, nombre, apellido, correo FROM usuarios WHERE correo = ?', [correo]);
    if (!u.length) return res.status(404).json({ error: 'No existe un usuario registrado con ese correo' });

    try {
      await db.query("INSERT INTO grupo_usuarios (id_grupo, id_usuario, rol) VALUES (?, ?, 'miembro')",
        [req.id_grupo, u[0].id_usuario]);
    } catch (e) {
      if (e.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Ese usuario ya pertenece al grupo' });
      throw e;
    }
    res.status(201).json({ ...u[0], rol: 'miembro' });
  } catch (e) { next(e); }
});

module.exports = router;
