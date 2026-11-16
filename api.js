// api.js (Leslie). Se carga ANTES de los scripts de cada página.
// No declara $ ni esc. Todo va dentro de una función para no chocar con nombres globales.
(function () {
  var CLAVE_TOKEN = 'token';
  var CLAVE_USUARIO = 'usuario';
  var PAGINA_LOGIN = '/index.html';

  async function apiFetch(ruta, opciones) {
    opciones = opciones || {};
    var token = localStorage.getItem(CLAVE_TOKEN);
    var headers = Object.assign(
      { 'Content-Type': 'application/json' },
      token ? { Authorization: 'Bearer ' + token } : {},
      opciones.headers || {}
    );

    var res;
    try {
      res = await fetch(ruta, Object.assign({}, opciones, { headers: headers }));
    } catch (e) {
      throw new Error('No se pudo conectar con el servidor');
    }

    // Lee el cuerpo como texto para no fallar con respuestas vacías (204)
    var texto = await res.text();
    var data = null;
    if (texto) {
      try { data = JSON.parse(texto); } catch (e) { data = null; }
    }

    // 401: sesión inválida, salvo en /api/auth/* (ahí es "contraseña incorrecta")
    if (res.status === 401 && ruta.indexOf('/api/auth/') !== 0) {
      cerrar(false);
      window.location.href = PAGINA_LOGIN;
      throw new Error((data && data.error) || 'Sesión expirada');
    }
    if (!res.ok) {
      throw new Error((data && data.error) || 'Error ' + res.status);
    }
    return data;
  }

  function guardar(token, usuario) {
    localStorage.setItem(CLAVE_TOKEN, token);
    localStorage.setItem(CLAVE_USUARIO, JSON.stringify(usuario));
  }

  function cerrar(redirigir) {
    localStorage.removeItem(CLAVE_TOKEN);
    localStorage.removeItem(CLAVE_USUARIO);
    if (redirigir !== false) window.location.href = PAGINA_LOGIN;
  }

  window.apiFetch = apiFetch;
  window.Sesion = {
    guardar: guardar,
    cerrar: cerrar,
    hayToken: function () { return !!localStorage.getItem(CLAVE_TOKEN); }
  };
})();
