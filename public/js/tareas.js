const ESTADOS = ['Pendiente', 'En progreso', 'Completada'];
const CLASE = { 'Pendiente': 'pend', 'En progreso': 'prog', 'Completada': 'comp' };
const SVG = d => `<svg viewBox="0 0 20 20" aria-hidden="true"><path d="${d}"/></svg>`;
const ICONO = { ok: SVG('M4 10.5l4 4 8-9'), editar: SVG('M13 4l3 3-9 9H4v-3zM11.5 5.5l3 3'), borrar: SVG('M4 6h12M8 6V4h4v2M6 6l1 10h6l1-10') };
const GRUPOS = ['Vencidas', 'Esta semana', 'Más adelante', 'Sin fecha', 'Completadas'];

let tareas = [], materias = [], filtro = 'Todas', editando = null, porBorrar = null;

document.addEventListener('DOMContentLoaded', async () => {
  $('#saludo').textContent = 'Hola, ' + (nombreUsuario() || 'estudiante');
  $('#nueva').onclick = () => abrir();
  $('#cancelar').onclick = () => $('#modal').close();
  $('#noBorrar').onclick = () => $('#confirmar').close();
  $('#selMateria').onchange = e => { $('#lblNueva').hidden = e.target.value !== 'nueva'; };
  $('#filtros').onclick = e => { const b = e.target.closest('[data-f]'); if (b) { filtro = b.dataset.f; pintar(); } };
  $('#lista').onclick = acciones;
  $('#form').onsubmit = guardar;
  $('#siBorrar').onclick = borrar;
  await cargar();
});

async function cargar() {
  try {
    [tareas, materias] = await Promise.all([apiFetch('/api/tareas'), apiFetch('/api/materias')]);
    pintar();
  } catch (e) { $('#lista').innerHTML = `<p class="vacio">No se pudieron cargar tus tareas: ${esc(e.message)}</p>`; }
}

const plural = (n, a, b) => `${n} ${n === 1 ? a : b}`;
function grupoDe(t) {
  if (t.estado === 'Completada') return 4;
  if (!t.fecha_entrega) return 3;
  const d = dias(t.fecha_entrega);
  return d < 0 ? 0 : d < 7 ? 1 : 2;
}

function pintar() {
  const activas = tareas.filter(t => t.estado !== 'Completada');
  const venc = activas.filter(t => t.fecha_entrega && dias(t.fecha_entrega) < 0).length;
  const sem = activas.filter(t => t.fecha_entrega && dias(t.fecha_entrega) >= 0 && dias(t.fecha_entrega) < 7).length;
  $('#resumen').textContent = !tareas.length ? 'Aún no tienes tareas. Crea la primera.'
    : !activas.length ? 'Todo al día. No tienes nada pendiente.'
    : `${plural(sem, 'tarea', 'tareas')} para esta semana` + (venc ? ` y ${plural(venc, 'vencida', 'vencidas')}.` : '.');

  const n = e => tareas.filter(t => t.estado === e).length;
  $('#filtros').innerHTML = `<div class="prog" aria-hidden="true">${ESTADOS.map(e => `<span class="${CLASE[e]}" style="flex:${n(e)};background:var(--${CLASE[e]}-t);opacity:.75"></span>`).join('')}</div>
    <div class="chips">${['Todas', ...ESTADOS].map(f => `<button class="chip ${CLASE[f] || ''}" data-f="${f}" aria-pressed="${f === filtro}">${CLASE[f] ? '<span class="pto"></span>' : ''}${f} <b>${f === 'Todas' ? tareas.length : n(f)}</b></button>`).join('')}</div>`;

  const visibles = tareas.filter(t => filtro === 'Todas' || t.estado === filtro);
  if (!visibles.length) { $('#lista').innerHTML = `<p class="vacio">${tareas.length ? 'No hay tareas con este estado.' : 'Toca “Nueva tarea” para empezar.'}</p>`; return; }
  $('#lista').innerHTML = GRUPOS.map((g, i) => {
    const ts = visibles.filter(t => grupoDe(t) === i).sort((a, b) => (a.fecha_entrega || '9') < (b.fecha_entrega || '9') ? -1 : 1);
    return ts.length ? `<h2 class="grupo ${i === 0 ? 'venc' : ''}">${g} <small>${ts.length}</small></h2><div class="notas">${ts.map(nota).join('')}</div>` : '';
  }).join('');
}

function nota(t) {
  const venc = t.estado !== 'Completada' && t.fecha_entrega && dias(t.fecha_entrega) < 0;
  return `<article class="nota ${CLASE[t.estado]}" data-id="${t.id_tarea}"><span class="cinta"></span>
    <button class="estado" data-a="ciclo" title="Cambiar estado">${esc(t.estado)}</button>
    <p class="materia">${esc(t.materia)}</p><h3>${esc(t.titulo)}</h3>
    ${t.descripcion ? `<p class="desc">${esc(t.descripcion)}</p>` : ''}
    <footer><span class="fecha ${venc ? 'venc' : ''}">${textoFecha(t.fecha_entrega)}</span>
    <div class="acc"><button data-a="ok" title="${t.estado === 'Completada' ? 'Marcar como pendiente' : 'Marcar como completada'}" aria-label="Completar">${ICONO.ok}</button>
    <button data-a="editar" title="Editar" aria-label="Editar">${ICONO.editar}</button>
    <button data-a="borrar" title="Eliminar" aria-label="Eliminar">${ICONO.borrar}</button></div></footer></article>`;
}

function acciones(e) {
  const b = e.target.closest('button[data-a]'); if (!b) return;
  const t = tareas.find(x => x.id_tarea === Number(b.closest('.nota').dataset.id));
  if (b.dataset.a === 'ok') cambiar(t, t.estado === 'Completada' ? 'Pendiente' : 'Completada');
  if (b.dataset.a === 'ciclo') cambiar(t, ESTADOS[(ESTADOS.indexOf(t.estado) + 1) % 3]);
  if (b.dataset.a === 'editar') abrir(t);
  if (b.dataset.a === 'borrar') { porBorrar = t; $('#confirmaTexto').textContent = `“${t.titulo}” se eliminará para siempre.`; $('#confirmar').showModal(); }
}

async function cambiar(t, estado) {
  const antes = t.estado; t.estado = estado; pintar();
  try {
    await apiFetch(`/api/tareas/${t.id_tarea}/estado`, { method: 'PATCH', body: JSON.stringify({ estado }) });
    if (estado === 'Completada') aviso('Tarea completada');
  } catch (e) { t.estado = antes; pintar(); aviso(e.message, true); }
}

function abrir(t = null) {
  editando = t ? t.id_tarea : null;
  $('#modalTitulo').textContent = t ? 'Editar tarea' : 'Nueva tarea';
  $('#errorForm').textContent = '';
  const f = $('#form'); f.reset();
  $('#selMateria').innerHTML = materias.map(m => `<option value="${m.id_materia}">${esc(m.nombre)}</option>`).join('') + '<option value="nueva">+ Crear materia nueva…</option>';
  if (t) {
    f.titulo.value = t.titulo; f.id_materia.value = t.id_materia; f.fecha_entrega.value = t.fecha_entrega || '';
    f.estado.value = t.estado; f.descripcion.value = t.descripcion || '';
  } else if (!materias.length) f.id_materia.value = 'nueva';
  $('#lblNueva').hidden = f.id_materia.value !== 'nueva';
  $('#modal').showModal();
}

async function guardar(e) {
  e.preventDefault();
  const f = new FormData(e.target);
  try {
    let id_materia = f.get('id_materia');
    if (id_materia === 'nueva') {
      const nombre = f.get('nueva_materia').trim();
      if (!nombre) throw new Error('Escribe el nombre de la materia');
      id_materia = (await apiFetch('/api/materias', { method: 'POST', body: JSON.stringify({ nombre }) })).id_materia;
    }
    const cuerpo = { titulo: f.get('titulo'), descripcion: f.get('descripcion'), fecha_entrega: f.get('fecha_entrega') || null, estado: f.get('estado'), id_materia: Number(id_materia) };
    await apiFetch(editando ? `/api/tareas/${editando}` : '/api/tareas', { method: editando ? 'PUT' : 'POST', body: JSON.stringify(cuerpo) });
    $('#modal').close(); aviso(editando ? 'Cambios guardados' : 'Tarea creada'); await cargar();
  } catch (err) { $('#errorForm').textContent = err.message; }
}

async function borrar() {
  try {
    await apiFetch(`/api/tareas/${porBorrar.id_tarea}`, { method: 'DELETE' });
    $('#confirmar').close(); aviso('Tarea eliminada'); await cargar();
  } catch (e) { $('#confirmar').close(); aviso(e.message, true); }
}
