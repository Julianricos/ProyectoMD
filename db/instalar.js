// Reconstruye la BD: node db/instalar.js   (o:  npm run db:reset)
// Opcional: node db/instalar.js schema   → solo estructura, sin datos
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

(async () => {
  const soloSchema = process.argv[2] === 'schema';
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true,
    charset: 'utf8mb4',
  });
  const leer = (f) => fs.readFileSync(path.join(__dirname, f), 'utf8');

  await conn.query(leer('schema.sql'));
  console.log('✔ Estructura creada (9 tablas)');
  if (!soloSchema) {
    await conn.query(leer('seed.sql'));
    console.log('✔ Datos de prueba cargados');
    const tablas = ['usuarios','materias','tareas','eventos','grupos','grupo_usuarios','documentos','mensajes','preferencias'];
    for (const t of tablas) {
      const [[r]] = await conn.query(`SELECT COUNT(*) AS n FROM agenda_estudiantil.${t}`);
      console.log(`   ${t.padEnd(15)} ${r.n} filas`);
    }
    console.log('\nUsuarios de prueba (contraseña: Demo1234): julian@demo.com, dana@demo.com, alexa@demo.com, leslie@demo.com, piloto@demo.com');
  }
  await conn.end();
})().catch((e) => { console.error('✖ Error:', e.message); process.exit(1); });
