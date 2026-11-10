// Permisos por grupo. Usan req.params.id como id del grupo y req.id_usuario (de auth.js).
const db = require('../db');

async function revisar(req, res, next, soloAdmin) {
  try {
    const id_grupo = Number(req.params.id);
    if (!Number.isInteger(id_grupo)) return res.status(400).json({ error: 'Id de grupo inválido' });

    const [filas] = await db.query(
      'SELECT rol FROM grupo_usuarios WHERE id_grupo = ? AND id_usuario = ?',
      [id_grupo, req.id_usuario]
    );
    if (!filas.length) return res.status(403).json({ error: 'No perteneces a este grupo' });
    if (soloAdmin && filas[0].rol !== 'admin') {
      return res.status(403).json({ error: 'Solo un administrador del grupo puede hacer esto' });
    }
    req.id_grupo = id_grupo;
    req.rol_grupo = filas[0].rol;
    next();
  } catch (e) { next(e); }
}

exports.soloMiembro = (req, res, next) => revisar(req, res, next, false);
exports.soloAdmin   = (req, res, next) => revisar(req, res, next, true);
