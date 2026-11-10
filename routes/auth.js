const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const auth = require('../middleware/auth');

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const texto = (v) => (typeof v === 'string' ? v.trim() : '');

// POST /api/auth/registro  { nombre, apellido, correo, contrasena }
router.post('/registro', async (req, res, next) => {
  try {
    const nombre = texto(req.body?.nombre);
    const apellido = texto(req.body?.apellido);
    const correo = texto(req.body?.correo).toLowerCase();
    const contrasena = typeof req.body?.contrasena === 'string' ? req.body.contrasena : '';

    if (!nombre || !apellido || !correo || !contrasena)
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    if (nombre.length > 50 || apellido.length > 50 || correo.length > 100)
      return res.status(400).json({ error: 'Algún campo excede la longitud permitida' });
    if (!EMAIL.test(correo))
      return res.status(400).json({ error: 'El correo no es válido' });
    if (contrasena.length < 8)
      return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres' });

    const hash = await bcrypt.hash(contrasena, 10);
    try {
      const [r] = await db.query(
        'INSERT INTO usuarios (nombre, apellido, correo, contrasena, fecha_registro) VALUES (?, ?, ?, ?, CURDATE())',
        [nombre, apellido, correo, hash]
      );
      await db.query('INSERT INTO preferencias (color_tema, idioma, notificaciones, id_usuario) VALUES (?, ?, 1, ?)',
        ['azul', 'es', r.insertId]);
      res.status(201).json({ mensaje: 'Usuario registrado', usuario: { id_usuario: r.insertId, nombre, apellido, correo } });
    } catch (e) {
      if (e.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Ya existe una cuenta con ese correo' });
      throw e;
    }
  } catch (e) { next(e); }
});

// POST /api/auth/login  { correo, contrasena }  →  { token, usuario }
router.post('/login', async (req, res, next) => {
  try {
    const correo = texto(req.body?.correo).toLowerCase();
    const contrasena = typeof req.body?.contrasena === 'string' ? req.body.contrasena : '';
    if (!correo || !contrasena) return res.status(400).json({ error: 'Correo y contraseña son obligatorios' });

    const [filas] = await db.query(
      'SELECT id_usuario, nombre, apellido, correo, contrasena FROM usuarios WHERE correo = ?', [correo]);
    const u = filas[0];
    // Mismo mensaje si falla el correo o la contraseña: no revela qué correos existen
    if (!u || !(await bcrypt.compare(contrasena, u.contrasena)))
      return res.status(401).json({ error: 'Correo o contraseña incorrectos' });

    const token = jwt.sign({ id_usuario: u.id_usuario }, process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRA || '8h' });
    res.json({ token, usuario: { id_usuario: u.id_usuario, nombre: u.nombre, apellido: u.apellido, correo: u.correo } });
  } catch (e) { next(e); }
});

// GET /api/auth/yo  → datos del usuario con sesión (sirve para validar el token desde el frontend)
router.get('/yo', auth, async (req, res, next) => {
  try {
    const [filas] = await db.query(
      'SELECT id_usuario, nombre, apellido, correo, fecha_registro FROM usuarios WHERE id_usuario = ?', [req.id_usuario]);
    if (!filas.length) return res.status(401).json({ error: 'Usuario no encontrado' });
    res.json(filas[0]);
  } catch (e) { next(e); }
});

module.exports = router;
