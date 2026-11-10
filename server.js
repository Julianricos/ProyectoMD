require('dotenv').config();
const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
const db = require('./db');
const auth = require('./middleware/auth');

if (!process.env.JWT_SECRET) {
  console.error('✖ Falta JWT_SECRET en el archivo .env (copia .env.example a .env)');
  process.exit(1);
}

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Monta una ruta protegida con token. Si el archivo aún no existe (otro integrante
// no lo ha subido), el servidor arranca igual y avisa en la consola.
function montar(ruta, archivo, protegida = true) {
  const ubicacion = path.join(__dirname, 'routes', archivo + '.js');
  if (!fs.existsSync(ubicacion)) {
    console.log(`  · pendiente: ${ruta}  (falta routes/${archivo}.js)`);
    return;
  }
  const router = require(ubicacion);
  protegida ? app.use(ruta, auth, router) : app.use(ruta, router);
  console.log(`  ✔ ${ruta}`);
}

console.log('Rutas:');
montar('/api/auth', 'auth', false);                  // registro y login: sin token
montar('/api/materias', 'materias');                 // Dana
montar('/api/tareas', 'tareas');                     // Dana
montar('/api/eventos', 'eventos');                   // Dana
montar('/api/calendario', 'calendario');             // Dana
montar('/api/grupos/:id/documentos', 'documentos'); // Julián (va antes que /api/grupos)
montar('/api/grupos', 'grupos');                     // Julián

app.get('/api/salud', async (req, res) => {
  try { await db.query('SELECT 1'); res.json({ servidor: 'ok', base_de_datos: 'ok' }); }
  catch (e) { res.status(500).json({ servidor: 'ok', base_de_datos: 'error: ' + e.message }); }
});

app.use('/api', (req, res) => res.status(404).json({ error: 'Ruta no encontrada' }));

// Manejo central de errores: no se filtran detalles internos al cliente
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'JSON inválido' });
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`\nServidor en http://localhost:${PORT}`));
