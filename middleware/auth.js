// Verifica el token JWT. Si es válido, deja el id del usuario en req.id_usuario.
const jwt = require('jsonwebtoken');

module.exports = function auth(req, res, next) {
  const [tipo, token] = (req.headers.authorization || '').split(' ');
  if (tipo !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Se requiere iniciar sesión' });
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.id_usuario = payload.id_usuario;
    next();
  } catch {
    return res.status(401).json({ error: 'Sesión inválida o expirada' });
  }
};
