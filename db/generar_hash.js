// Uso: node db/generar_hash.js MiContraseña   → imprime el hash bcrypt
const bcrypt = require('bcryptjs');
const clave = process.argv[2];
if (!clave) { console.log('Uso: node db/generar_hash.js <contraseña>'); process.exit(1); }
console.log(bcrypt.hashSync(clave, 10));
