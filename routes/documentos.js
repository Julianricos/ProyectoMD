// Se monta en /api/grupos/:id/documentos (ver server.js)
const router = require('express').Router({ mergeParams: true });
const db = require('../db');
const { soloMiembro } = require('../middleware/grupo');

const texto = (v) => (typeof v === 'string' ? v.trim() : '');
const urlValida = (s) => { try { return ['http:', 'https:'].includes(new URL(s).protocol); } catch { return false; } };

// GET → documentos del grupo (solo miembros)
router.get('/', soloMiembro, async (req, res, next) => {
  try {
    const [filas] = await db.query(
      `SELECT d.id_documento, d.nombre, d.url, d.fecha_subida, d.id_usuario,
              CONCAT(u.nombre, ' ', u.apellido) AS subido_por
         FROM documentos d
         JOIN usuarios u ON u.id_usuario = d.id_usuario
        WHERE d.id_grupo = ?
        ORDER BY d.fecha_subida DESC, d.id_documento DESC`, [req.id_grupo]);
    res.json(filas);
  } catch (e) { next(e); }
});

// POST { nombre, url } → registra un documento (solo miembros)
router.post('/', soloMiembro, async (req, res, next) => {
  try {
    const nombre = texto(req.body?.nombre);
    const url = texto(req.body?.url);
    if (!nombre || !url) return res.status(400).json({ error: 'Nombre y enlace son obligatorios' });
    if (nombre.length > 150 || url.length > 255) return res.status(400).json({ error: 'Nombre o enlace demasiado largo' });
    if (!urlValida(url)) return res.status(400).json({ error: 'El enlace debe empezar con http:// o https://' });

    const [r] = await db.query(
      'INSERT INTO documentos (nombre, url, fecha_subida, id_usuario, id_grupo) VALUES (?, ?, CURDATE(), ?, ?)',
      [nombre, url, req.id_usuario, req.id_grupo]);
    res.status(201).json({ id_documento: r.insertId, nombre, url, id_usuario: req.id_usuario });
  } catch (e) { next(e); }
});

// DELETE /:idDoc → lo puede borrar quien lo subió o un admin del grupo
router.delete('/:idDoc', soloMiembro, async (req, res, next) => {
  try {
    const [doc] = await db.query('SELECT id_usuario FROM documentos WHERE id_documento = ? AND id_grupo = ?',
      [req.params.idDoc, req.id_grupo]);
    if (!doc.length) return res.status(404).json({ error: 'Documento no encontrado' });
    if (doc[0].id_usuario !== req.id_usuario && req.rol_grupo !== 'admin')
      return res.status(403).json({ error: 'Solo quien lo subió o un administrador puede eliminarlo' });
    await db.query('DELETE FROM documentos WHERE id_documento = ?', [req.params.idDoc]);
    res.json({ mensaje: 'Documento eliminado' });
  } catch (e) { next(e); }
});

module.exports = router;
