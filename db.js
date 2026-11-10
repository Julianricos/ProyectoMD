// Pool de conexiones a MariaDB/MySQL. Todas las rutas lo importan: const db = require('../db');
const mysql = require('mysql2/promise');

module.exports = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'agenda_estudiantil',
  waitForConnections: true,
  connectionLimit: 10,
  charset: 'utf8mb4',
  dateStrings: true, // las columnas DATE llegan como 'YYYY-MM-DD' (sin problemas de zona horaria)
});
