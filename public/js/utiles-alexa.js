// Utilidades solo de las páginas de Alexa: selector, escape de HTML, fechas y avisos.
const $ = (s, r = document) => r.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const nombreUsuario = () => { try { return JSON.parse(localStorage.getItem('usuario')).nombre; } catch { return ''; } };

// Fechas AAAA-MM-DD sin problemas de zona horaria
const aFecha = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const dias = s => { const h = new Date(); h.setHours(0, 0, 0, 0); return Math.round((aFecha(s) - h) / 864e5); };
function textoFecha(s) {
  if (!s) return 'Sin fecha';
  const d = dias(s);
  if (d === 0) return 'Hoy'; if (d === 1) return 'Mañana'; if (d === -1) return 'Ayer';
  if (d < 0) return `Hace ${-d} días`;
  if (d < 7) return aFecha(s).toLocaleDateString('es-MX', { weekday: 'long' });
  return aFecha(s).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
}

let _t;
function aviso(msg, error = false) {
  let a = $('#aviso'); if (!a) a = document.body.appendChild(Object.assign(document.createElement('div'), { id: 'aviso', className: 'aviso', role: 'status' }));
  a.textContent = msg; a.className = 'aviso ver' + (error ? ' err' : '');
  clearTimeout(_t); _t = setTimeout(() => a.classList.remove('ver'), 2800);
}
