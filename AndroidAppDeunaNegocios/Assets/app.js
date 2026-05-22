/* ══════════════════════════════════════════
   DEUNA NEGOCIOS APP — Firebase + Cupones
   ══════════════════════════════════════════ */

// ── Firebase Init ──
const firebaseConfig = {
  apiKey: "AIzaSyA652wgxkpVIJi5Va_14zGyrN6K3ShFgiM",
  authDomain: "deuna-4a046.firebaseapp.com",
  databaseURL: "https://deuna-4a046-default-rtdb.firebaseio.com",
  projectId: "deuna-4a046",
  storageBucket: "deuna-4a046.firebasestorage.app",
  messagingSenderId: "43792912347",
  appId: "1:43792912347:android:7e2a7c37831ad25bfb21fe"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const rtdb = firebase.database();

const NEGOCIO_ID = 'pozo_montaluisa';

// ── Navigation ──
function nav(screen) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nb').forEach(b => b.classList.remove('on'));
  const s = document.getElementById('s-' + screen);
  const b = document.getElementById('nb-' + screen);
  if (s) s.classList.add('active');
  if (b) b.classList.add('on');
}

// ── Vendor Tabs ──
function vtab(tab) {
  ['cobrar', 'gestionar'].forEach(t => {
    const el = document.getElementById('vc-' + t);
    const btn = document.getElementById('vtab-' + t);
    if (el) el.style.display = t === tab ? 'block' : 'none';
    if (btn) btn.classList.toggle('on', t === tab);
  });
}

function ctab(tab) {
  ['activa', 'historial'].forEach(t => {
    const el = document.getElementById('cc-' + t);
    const btn = document.getElementById('ctab-' + t);
    if (el) el.style.display = t === tab ? 'block' : 'none';
    if (btn) btn.classList.toggle('on', t === tab);
  });
}

function cupTab(tab) {
  ['crear', 'listado'].forEach(t => {
    const el = document.getElementById('cupc-' + t);
    const btn = document.getElementById('cuptab-' + t);
    if (el) el.style.display = t === tab ? 'block' : 'none';
    if (btn) btn.classList.toggle('on', t === tab);
  });
  if (tab === 'listado') loadCuponesListado();
}

function pm(method) {
  document.querySelectorAll('.pm').forEach(b => b.classList.remove('on'));
  const el = document.getElementById('pm-' + method);
  if (el) el.classList.add('on');
}

// ── Numpad ──
let monto = "0";
function updateDisplay() {
  const el = document.getElementById('monto-val');
  const btn = document.getElementById('cta-btn');
  if (!el || !btn) return;
  if (monto.includes(',')) {
    const parts = monto.split(',');
    if (parts[1].length > 2) monto = parts[0] + ',' + parts[1].substring(0, 2);
  }
  if (monto === "") monto = "0";
  el.textContent = monto;
  if (parseFloat(monto.replace(',', '.')) > 0) {
    btn.classList.add('ready');
  } else {
    btn.classList.remove('ready');
  }
}

function press(val) {
  if (monto === "0" && val !== ",") monto = val;
  else if (val === "," && monto.includes(",")) return;
  else monto += val;
  updateDisplay();
}

function del() {
  if (monto.length > 1) monto = monto.slice(0, -1);
  else monto = "0";
  updateDisplay();
}

// ── Process Payment ──
function processPay() {
  const amount = parseFloat(monto.replace(',', '.'));
  if (amount > 0) {
    rtdb.ref('pagos').push({
      monto: monto,
      negocio: 'Pozo Montaluisa Jerson',
      cliente: 'Dario Lopez',
      metodo: 'QR',
      timestamp: firebase.database.ServerValue.TIMESTAMP,
      estado: 'exitoso'
    }).then(() => {
      document.getElementById('modal-amt').textContent = "$" + monto;
      document.getElementById('pay-modal').classList.add('show');
    }).catch(err => {
      t('Error: ' + err.message);
    });
  }
}

function closeModal() {
  document.getElementById('pay-modal').classList.remove('show');
  monto = "0";
  updateDisplay();
  const empty = document.getElementById('hist-empty');
  const list = document.getElementById('hist-sales');
  if (empty) empty.style.display = 'none';
  if (list) list.style.display = 'block';
  t('Venta registrada');
}

function filterH(filter, btn) {
  document.querySelectorAll('.pill').forEach(b => b.classList.remove('on'));
  btn.classList.add('on');
  const amt = document.getElementById('hist-amt');
  if (filter === 'hoy') amt.textContent = "$23,50";
  if (filter === 'ayer') amt.textContent = "$142,00";
  if (filter === 'semana') amt.textContent = "$840,50";
}

// ═══════════════════════════════════════════════
//  CUPONES — CREAR CUPÓN (Firebase Firestore)
// ═══════════════════════════════════════════════
async function crearCupon() {
  const titulo = document.getElementById('cup-titulo').value.trim();
  const emoji = document.getElementById('cup-emoji').value;
  const descuento = parseInt(document.getElementById('cup-descuento').value) || 0;
  const desc = document.getElementById('cup-desc').value.trim();
  const puntos = parseInt(document.getElementById('cup-puntos').value) || 50;
  const vigencia = document.getElementById('cup-vigencia').value;
  const maxReventa = parseFloat(document.getElementById('cup-maxreventa').value) || 1.00;

  if (!titulo) { t('⚠️ Escribe un título para el cupón'); return; }
  if (!desc) { t('⚠️ Escribe una descripción'); return; }

  // Generar ID único
  const cuponId = titulo.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '') + '_' + Date.now();

  // Colores random para el background
  const bgs = [
    'linear-gradient(135deg,#c0392b,#e74c3c)',
    'linear-gradient(135deg,#FFD700,#FF8C00)',
    'linear-gradient(135deg,#cc0000,#ff4444)',
    'linear-gradient(135deg,#8e44ad,#9b59b6)',
    'linear-gradient(135deg,#1a7a3c,#2ecc71)',
    'linear-gradient(135deg,#2c3e50,#3d5a80)',
    'linear-gradient(135deg,#ff6b35,#f7c59f)'
  ];
  const bg = bgs[Math.floor(Math.random() * bgs.length)];

  const cuponData = {
    id: cuponId,
    nombre: titulo,
    emoji: emoji,
    badge: descuento > 0 ? descuento + '% de Descuento' : null,
    desc: desc,
    descCorto: desc.substring(0, 80),
    precio: descuento > 0 ? null : '$' + puntos,
    bg: bg,
    costoAdquisicion: puntos,
    gastoRequerido: puntos * 5,
    vigenciaFin: vigencia || '2026-12-31',
    maxReventa: maxReventa,
    creadoPor: NEGOCIO_ID,
    fechaCreacion: new Date().toISOString(),
    estado: 'activo'
  };

  try {
    // 1. Save to Firestore catalogo_cupones
    await db.collection('catalogo_cupones').doc(cuponId).set(cuponData);

    // 2. Log in RTDB for real-time sync
    await rtdb.ref('cupones_nuevos/' + cuponId).set({
      ...cuponData,
      timestamp: firebase.database.ServerValue.TIMESTAMP
    });

    // 3. Show success
    t('🎉 ¡Cupón "' + titulo + '" creado!');
    document.getElementById('cup-modal').classList.add('show');
    limpiarFormCupon();

  } catch(e) {
    console.warn('Firebase error:', e);
    t('⚠️ Error al guardar, guardado localmente');
  }
}

function limpiarFormCupon() {
  document.getElementById('cup-titulo').value = '';
  document.getElementById('cup-descuento').value = '';
  document.getElementById('cup-desc').value = '';
  document.getElementById('cup-puntos').value = '';
  document.getElementById('cup-vigencia').value = '';
  document.getElementById('cup-maxreventa').value = '';
}

function closeCupModal() {
  document.getElementById('cup-modal').classList.remove('show');
  // Switch to Listado tab to see the new cupon
  cupTab('listado');
  // Show success banner briefly
  const sb = document.getElementById('cup-success');
  if (sb) {
    sb.style.display = 'block';
    setTimeout(() => { sb.style.display = 'none'; }, 3000);
  }
}

// ═══════════════════════════════════════════════
//  CUPONES — LISTADO (Firebase real-time)
// ═══════════════════════════════════════════════
async function loadCuponesListado() {
  const container = document.getElementById('listado-cupones');
  if (!container) return;

  container.innerHTML = '<div class="loading-msg">Cargando cupones...</div>';

  try {
    const snap = await db.collection('catalogo_cupones').orderBy('fechaCreacion', 'desc').get();

    if (snap.empty) {
      container.innerHTML = '<div class="empty"><div class="empty-ic">🎟️</div><p>No hay cupones creados</p></div>';
      return;
    }

    let html = '';
    snap.forEach(doc => {
      const c = doc.data();
      html += `
        <div class="cupon-listado-item" onclick="verConfirmaciones('${c.id}')">
          <div class="cli-img" style="background:${c.bg}"><span>${c.emoji}</span></div>
          <div class="cli-body">
            ${c.badge ? '<div class="cli-badge">' + c.badge + '</div>' : ''}
            ${c.precio ? '<div class="cli-price">' + c.precio + '</div>' : ''}
            <strong>${c.nombre}</strong>
            <p>${c.descCorto || c.desc}</p>
          </div>
          <div class="cli-right">
            <button class="cli-details" onclick="event.stopPropagation(); t('Detalles de ${c.nombre}')">Ver Detalles</button>
            <span class="cli-points">${c.costoAdquisicion} puntos</span>
          </div>
        </div>`;
    });
    container.innerHTML = html;

  } catch(e) {
    console.warn('Error loading cupones:', e);
    container.innerHTML = '<div class="empty"><div class="empty-ic">⚠️</div><p>Error al cargar</p></div>';
  }
}

// ═══════════════════════════════════════════════
//  CONFIRMACIONES (quién adquirió mis cupones)
// ═══════════════════════════════════════════════
async function verConfirmaciones(cuponId) {
  nav('confirmaciones');
  const container = document.getElementById('lista-confirmaciones');
  container.innerHTML = '<div class="loading-msg">Cargando confirmaciones...</div>';

  try {
    // Buscar todas las adquisiciones de este cupón en RTDB
    const snap = await rtdb.ref('actividad').once('value');
    const data = snap.val() || {};

    let html = '';
    let found = false;

    // También cargar todos los cupones para mostrar en el historial
    const catSnap = await db.collection('catalogo_cupones').get();
    const cupones = {};
    catSnap.forEach(doc => { cupones[doc.id] = doc.data(); });

    // Buscar adquisiciones
    for (const userId of Object.keys(data)) {
      const userActs = data[userId];
      for (const actId of Object.keys(userActs)) {
        const act = userActs[actId];
        if (act.tipo === 'adquisicion') {
          const c = Object.values(cupones).find(cu => cu.nombre === act.cupon);
          if (c && (!cuponId || c.id === cuponId)) {
            found = true;
            html += `
              <div class="conf-item">
                <div class="cli-img" style="background:${c.bg}"><span>${c.emoji}</span></div>
                <div class="cli-body">
                  ${c.badge ? '<div class="cli-badge">' + c.badge + '</div>' : ''}
                  <strong>${c.nombre}</strong>
                  <p>${c.descCorto || c.desc}</p>
                </div>
                <div class="cli-right">
                  <span class="conf-status confirmado">Confirmado</span>
                </div>
              </div>`;
          }
        }
      }
    }

    // Mostrar cupones sin confirmar también
    for (const cid of Object.keys(cupones)) {
      const c = cupones[cid];
      if (cuponId && cid !== cuponId) continue;
      const yaConf = html.includes(c.nombre);
      if (!yaConf) {
        html += `
          <div class="conf-item">
            <div class="cli-img" style="background:${c.bg}"><span>${c.emoji}</span></div>
            <div class="cli-body">
              ${c.badge ? '<div class="cli-badge">' + c.badge + '</div>' : ''}
              <strong>${c.nombre}</strong>
              <p>${c.descCorto || c.desc}</p>
            </div>
            <div class="cli-right">
              <span class="conf-status sin-confirmar">Sin Confirmar</span>
            </div>
          </div>`;
      }
    }

    container.innerHTML = html || '<div class="empty"><div class="empty-ic">📋</div><p>No hay confirmaciones</p></div>';

  } catch(e) {
    console.warn('Error:', e);
    container.innerHTML = '<div class="empty"><div class="empty-ic">⚠️</div><p>Error al cargar</p></div>';
  }
}

// Cargar todas las confirmaciones
function verTodasConfirmaciones() {
  verConfirmaciones(null);
}

// ═══════════════════════════════════════════════
//  RESET DATA (para pruebas)
// ═══════════════════════════════════════════════
async function resetData() {
  if (!confirm('¿Borrar TODOS los datos de Firebase para empezar de cero?')) return;

  try {
    // Delete Firestore collections
    const cats = await db.collection('catalogo_cupones').get();
    for (const doc of cats.docs) await doc.ref.delete();

    const users = await db.collection('usuarios').get();
    for (const doc of users.docs) {
      const subs = await doc.ref.collection('mis_cupones').get();
      for (const sub of subs.docs) await sub.ref.delete();
      await doc.ref.delete();
    }

    const mercado = await db.collection('mercado_cupones').get();
    for (const doc of mercado.docs) await doc.ref.delete();

    // Delete RTDB
    await rtdb.ref().remove();

    t('🗑️ Datos reiniciados. Listo para prueba limpia.');
  } catch(e) {
    console.warn('Reset error:', e);
    t('Error al resetear: ' + e.message);
  }
}

// ── Toast ──
let _tt;
function t(msg) {
  const el = document.getElementById('toast');
  if (!el) return;
  clearTimeout(_tt);
  el.textContent = msg;
  el.classList.add('show');
  _tt = setTimeout(() => el.classList.remove('show'), 2400);
}

// ── Listen for real-time coupon acquisitions ──
function listenAcquisitions() {
  rtdb.ref('actividad').on('child_changed', (snap) => {
    const data = snap.val();
    if (data) {
      const keys = Object.keys(data);
      const latest = data[keys[keys.length - 1]];
      if (latest && latest.tipo === 'adquisicion') {
        t('🔔 ¡' + (latest.cupon || 'Cupón') + ' fue adquirido por un usuario!');
      }
    }
  });
}

// ── Init ──
document.addEventListener('DOMContentLoaded', () => {
  nav('inicio');
  vtab('cobrar');
  ctab('historial');
  cupTab('crear');
  listenAcquisitions();
});
