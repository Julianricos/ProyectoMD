const COLOR = { Tarea: '#5E9BEA', Examen: '#E5594D', Entrega: '#E8A317', Evento: '#8C79C9', 'Reunión': '#35A08F' };
let cal, tareas = [], eventos = [];

document.addEventListener('DOMContentLoaded', async () => {
  $('#nuevo').onclick = () => nuevo();
  $('#cancelar').onclick = () => $('#modal').close();
  $('#form').onsubmit = guardar;
  try {
    const lista = await traer();
    cal = new FullCalendar.Calendar($('#cal'), {
      locale: 'es', firstDay: 1, height: 'auto', dayMaxEvents: 3,
      headerToolbar: { left: 'prev,next today', center: 'title', right: '' }, buttonText: { today: 'Hoy' },
      events: lista, eventClick: i => detalle(i.event), dateClick: i => nuevo(i.dateStr)
    });
    cal.render();
  } catch (e) { $('#cal').innerHTML = `<p class="vacio">No se pudo cargar el calendario: ${esc(e.message)}</p>`; }
  portada();
});

async function traer() {
  const [lista, ts, es] = await Promise.all([apiFetch('/api/calendario'), apiFetch('/api/tareas'), apiFetch('/api/eventos')]);
  tareas = ts; eventos = es;
  return lista.map(e => ({
    ...e, color: COLOR[e.tipo] || e.color,
    classNames: e.id.startsWith('tarea-') && tareas.find(t => 'tarea-' + t.id_tarea === e.id)?.estado === 'Completada' ? ['hecha'] : []
  }));
}

async function recargar() { const l = await traer(); cal.removeAllEvents(); cal.addEventSource(l); }

const fechaLarga = s => aFecha(s).toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' });
const etiqueta = tipo => `<span class="etiqueta"><span class="pto" style="background:${COLOR[tipo]}"></span>${esc(tipo)}</span>`;

function portada() {
  $('#panel').innerHTML = `<h2>Colores</h2><p>Cada tipo de evento tiene el suyo.</p>
    <ul class="leyenda">${Object.keys(COLOR).map(k => `<li>${etiqueta(k)}</li>`).join('')}</ul>`;
}

function detalle(ev) {
  const fecha = ev.startStr.slice(0, 10), tipo = ev.extendedProps.tipo;
  let extra = '', boton = '';
  if (ev.id.startsWith('tarea-')) {
    const t = tareas.find(x => 'tarea-' + x.id_tarea === ev.id);
    if (t) {
      extra = `<p>${esc(t.materia)} · ${esc(t.estado)}</p>${t.descripcion ? `<p>${esc(t.descripcion)}</p>` : ''}`;
      if (t.estado !== 'Completada') boton = `<div class="acciones"><button class="btn" id="hecha">Marcar como completada</button></div>`;
    }
  } else {
    const v = eventos.find(x => 'evento-' + x.id_evento === ev.id);
    if (v?.descripcion) extra = `<p>${esc(v.descripcion)}</p>`;
  }
  $('#panel').innerHTML = `${etiqueta(tipo)}<h2>${esc(ev.title)}</h2><p>${fechaLarga(fecha)}</p>${extra}${boton}
    <div class="acciones"><button class="btn sec" id="volver">Ver colores</button></div>`;
  $('#volver').onclick = portada;
  if ($('#hecha')) $('#hecha').onclick = async () => {
    const t = tareas.find(x => 'tarea-' + x.id_tarea === ev.id);
    try {
      await apiFetch(`/api/tareas/${t.id_tarea}/estado`, { method: 'PATCH', body: JSON.stringify({ estado: 'Completada' }) });
      aviso('Tarea completada'); await recargar(); portada();
    } catch (e) { aviso(e.message, true); }
  };
}

function nuevo(fecha = '') {
  const f = $('#form'); f.reset(); f.fecha.value = fecha; $('#errorForm').textContent = '';
  $('#modal').showModal();
}

async function guardar(e) {
  e.preventDefault();
  try {
    await apiFetch('/api/eventos', { method: 'POST', body: JSON.stringify(Object.fromEntries(new FormData(e.target))) });
    $('#modal').close(); aviso('Evento creado'); await recargar();
  } catch (err) { $('#errorForm').textContent = err.message; }
}
