// ══════════════════════════════════════════════
//  DEUNA USUARIOS — APP LOGIC + FIREBASE
// ══════════════════════════════════════════════

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

// ── Constantes ──
let USER_ID = window.location.href.includes('usuario_b') ? 'jerson_pozo' : 'dario_lopez';
const GASTO_ACUMULADO_DEFAULT = window.location.href.includes('usuario_b') ? 300 : 250;

// ── Estado Local ──
let gastoAcumulado = GASTO_ACUMULADO_DEFAULT;
let catalogoCupones = [];
let misCupones = [];
let marketplaceCupones = []; // Cupones de OTROS usuarios en venta
let currentCuponIdx = null;

// ═══════════════════════════════════════════════
//  CATÁLOGO DE CUPONES (se sube a Firebase si no existe)
// ═══════════════════════════════════════════════
const CATALOGO_SEED = [
  {
    id: 'pizza_hut_20',
    nombre: 'Pizza Hut',
    emoji: '🍕',
    badge: '20% de Descuento',
    desc: 'Combo pizza familiar Crown, incluye: 16 bordes rellenos de queso importado, chorizo ahumado y chistorra + gaseosa 1L + choco sticks x8',
    descCorto: 'Combo pizza familiar Crown, incluye16 borces carnosos y refresco de 1.5L',
    precio: null,
    bg: 'linear-gradient(135deg,#c0392b,#e74c3c)',
    costoAdquisicion: 150,
    gastoRequerido: 400,
    vigenciaFin: '2026-06-30',
    maxReventa: 1.60
  },
  {
    id: 'multicines_2d',
    nombre: 'Multicines',
    emoji: '🎬',
    badge: null,
    desc: 'Boletos 2D solo lunes y jueves. Válido en todas las salas a nivel nacional. No acumulable con otras promociones.',
    descCorto: 'Boletos 2D solo lunes y jueves',
    precio: '$2,60',
    bg: 'linear-gradient(135deg,#FFD700,#FF8C00)',
    costoAdquisicion: 80,
    gastoRequerido: 250,
    vigenciaFin: '2026-05-31',
    maxReventa: 1.20
  },
  {
    id: 'kfc_bigbox',
    nombre: 'KFC',
    emoji: '🍗',
    badge: null,
    desc: 'Big Box Recargado: 2 presas de pollo original, 2 alitas picantes, papas fritas medianas y refresco de 16oz.',
    descCorto: 'Big Box Recargado (2 presas, 2 alitas, papas fritas, refresco)',
    precio: '$4,99',
    bg: 'linear-gradient(135deg,#cc0000,#ff4444)',
    costoAdquisicion: 100,
    gastoRequerido: 300,
    vigenciaFin: '2026-07-15',
    maxReventa: 2.00
  },
  {
    id: 'pizza_hut_10',
    nombre: 'Pizza Hut',
    emoji: '🍕',
    badge: '10% de Descuento',
    desc: 'Pizza mediana de cualquier especialidad con 10% de descuento pagando con Deuna.',
    descCorto: 'Pizza mediana especialidad con 10% OFF',
    precio: null,
    bg: 'linear-gradient(135deg,#8e44ad,#9b59b6)',
    costoAdquisicion: 40,
    gastoRequerido: 200,
    vigenciaFin: '2026-06-15',
    maxReventa: 0.80
  }
];

// ═══════════════════════════════════════════════
//  FIREBASE: SEED & LOAD DATA
// ═══════════════════════════════════════════════
async function seedFirebase() {
  try {
    // Check if catalogo exists
    const catSnap = await db.collection('catalogo_cupones').limit(1).get();
    if (catSnap.empty) {
      console.log('🔥 Seeding catálogo de cupones...');
      for (const c of CATALOGO_SEED) {
        await db.collection('catalogo_cupones').doc(c.id).set(c);
      }
    }

    // Check if user profile exists
    const userSnap = await db.collection('usuarios').doc(USER_ID).get();
    if (!userSnap.exists) {
      console.log('🔥 Creating user profile...');
      await db.collection('usuarios').doc(USER_ID).set({
        nombre: 'Dario Lopez',
        gastoAcumulado: GASTO_ACUMULADO_DEFAULT,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    }

    // Seed some initial cupones for the user
    const misSnap = await db.collection('usuarios').doc(USER_ID).collection('mis_cupones').limit(1).get();
    if (misSnap.empty) {
      console.log('🔥 Seeding mis cupones...');
      const seedMis = [
        { cuponId: 'pizza_hut_20', estado: 'nuevo', precioReventa: 0, fechaAdquisicion: new Date().toISOString() },
        { cuponId: 'multicines_2d', estado: 'activo', precioReventa: 0, fechaAdquisicion: new Date(Date.now() - 86400000*3).toISOString() },
        { cuponId: 'kfc_bigbox', estado: 'publicado', precioReventa: 4.50, fechaAdquisicion: new Date(Date.now() - 86400000*5).toISOString(), fechaPublicacion: new Date().toISOString() },
        { cuponId: 'pizza_hut_10', estado: 'revendido', precioReventa: 0.75, fechaAdquisicion: new Date(Date.now() - 86400000*10).toISOString(), fechaReventa: new Date(Date.now() - 86400000*2).toISOString() }
      ];
      for (const mc of seedMis) {
        await db.collection('usuarios').doc(USER_ID).collection('mis_cupones').add(mc);
      }
    }
  } catch (e) {
    console.warn('Firebase seed error (offline mode):', e.message);
  }
}

async function loadData() {
  try {
    // Load catalogo
    const catSnap = await db.collection('catalogo_cupones').get();
    if (!catSnap.empty) {
      catalogoCupones = [];
      catSnap.forEach(doc => catalogoCupones.push({ ...doc.data(), _id: doc.id }));
    } else {
      catalogoCupones = [...CATALOGO_SEED];
    }

    // Load user
    const userSnap = await db.collection('usuarios').doc(USER_ID).get();
    if (userSnap.exists) {
      gastoAcumulado = userSnap.data().gastoAcumulado || GASTO_ACUMULADO_DEFAULT;
    }

    // Load mis cupones
    const misSnap = await db.collection('usuarios').doc(USER_ID).collection('mis_cupones').get();
    misCupones = [];
    misSnap.forEach(doc => {
      const data = doc.data();
      const cat = catalogoCupones.find(c => c.id === data.cuponId) || CATALOGO_SEED[0];
      misCupones.push({ ...data, _docId: doc.id, ...cat });
    });

    // Check caducidad
    checkCaducidad();

    // Update UI
    renderCuponesAdquirir();
    renderMisCupones();
    updateBalanceUI();

    console.log('✅ Data loaded:', { catalogo: catalogoCupones.length, misCupones: misCupones.length, gasto: gastoAcumulado });
  } catch (e) {
    console.warn('Load error (using local data):', e.message);
    catalogoCupones = [...CATALOGO_SEED];
    renderCuponesAdquirir();
    renderMisCupones();
  }
}

// ═══════════════════════════════════════════════
//  CADUCIDAD CHECK
// ═══════════════════════════════════════════════
function checkCaducidad() {
  const hoy = new Date().toISOString().split('T')[0];
  misCupones.forEach(async (mc) => {
    if (mc.estado !== 'caducado' && mc.estado !== 'revendido') {
      if (mc.vigenciaFin && mc.vigenciaFin < hoy) {
        mc.estado = 'caducado';
        // Update Firebase
        try {
          await db.collection('usuarios').doc(USER_ID).collection('mis_cupones').doc(mc._docId).update({ estado: 'caducado' });
          t('⚠️ Cupón ' + mc.nombre + ' ha caducado');
        } catch(e) { console.warn('Update caducidad error:', e); }
      }
    }
  });
}

// ═══════════════════════════════════════════════
//  RENDER: ADQUIRIR TAB
// ═══════════════════════════════════════════════
function renderCuponesAdquirir() {
  const container = document.getElementById('cup-adquirir');
  if (!container) return;

  let html = `<div class="cup-section">
    <h3 class="cup-subtitle">Comprar</h3>
    <p class="cup-desc">Selecciona un cupón para canjear depende a tus gastos acumulados <strong>$${gastoAcumulado}</strong></p>
  </div>`;

  catalogoCupones.forEach((c, i) => {
    const puedeAdquirir = gastoAcumulado >= c.gastoRequerido;
    const caducado = c.vigenciaFin && c.vigenciaFin < new Date().toISOString().split('T')[0];
    const yaAdquirido = misCupones.some(m => m.cuponId === c.id && m.estado !== 'revendido' && m.estado !== 'caducado');

    let statusHtml = '';
    if (caducado) statusHtml = '<span class="status-tag caducado">Caducado</span>';
    else if (yaAdquirido) statusHtml = '<span class="status-tag activo">Ya adquirido</span>';
    else if (puedeAdquirir) statusHtml = '<span class="status-tag nuevo">Disponible</span>';
    else statusHtml = '<span class="status-tag locked">🔒 Bloqueado</span>';

    html += `<div class="cupon-card-v2 ${puedeAdquirir && !caducado && !yaAdquirido ? '' : 'locked'}" onclick="showCuponDetalle(${i})">
      <div class="cv2-img" style="background:${c.bg}"><span>${c.emoji}</span></div>
      <div class="cv2-body">
        ${c.badge ? `<div class="cv2-badge green">${c.badge}</div>` : ''}
        ${c.precio ? `<div class="cv2-price">${c.precio}</div>` : ''}
        <strong>${c.nombre}</strong>
        <p>${c.descCorto || c.desc}</p>
      </div>
      <div class="cv2-right">
        <button class="cupon-btn outline" onclick="event.stopPropagation(); showCuponDetalle(${i})">Ver Detalles</button>
        ${statusHtml}
      </div>
    </div>`;
  });

  container.innerHTML = html;
}

// ═══════════════════════════════════════════════
//  RENDER: MIS CUPONES (Comercializar)
// ═══════════════════════════════════════════════
function renderMisCupones() {
  const container = document.getElementById('cup-comerciar');
  if (!container) return;

  let html = `<div class="cup-section">
    <h3 class="cup-subtitle">Mis Cupones</h3>
    <p class="cup-desc">Selecciona un cupón para comercializar con otro usuario</p>
  </div>`;

  if (misCupones.length === 0) {
    html += '<div style="text-align:center;padding:30px;color:#aaa"><p style="font-size:2rem">🎟️</p><p style="font-size:.8rem">No tienes cupones aún.<br>Adquiere uno desde la pestaña Adquirir.</p></div>';
  }

  misCupones.forEach((mc, i) => {
    const estadoClass = mc.estado;
    const estadoLabel = mc.estado.charAt(0).toUpperCase() + mc.estado.slice(1);
    const isComercializable = mc.estado === 'nuevo' || mc.estado === 'activo';
    const isPublicado = mc.estado === 'publicado';

    let actionBtn = '';
    if (isComercializable) {
      actionBtn = `<button class="cupon-btn purple" onclick="event.stopPropagation(); showComercializarForm(${i})">Comercializar</button>`;
    } else if (isPublicado) {
      actionBtn = `<button class="cupon-btn cancel-btn" onclick="event.stopPropagation(); cancelarPublicacion(${i})">Cancelar Publicación</button>`;
    }

    html += `<div class="cupon-card-v2 ${mc.estado === 'caducado' ? 'locked' : ''}" onclick="${isComercializable ? 'showComercializarForm(' + i + ')' : ''}">
      <div class="cv2-img" style="background:${mc.bg}"><span>${mc.emoji}</span></div>
      <div class="cv2-body">
        ${mc.badge ? `<div class="cv2-badge green">${mc.badge}</div>` : ''}
        ${mc.precio ? `<div class="cv2-price">${mc.precio}</div>` : ''}
        <strong>${mc.nombre}</strong>
        <p>${mc.descCorto || mc.desc}</p>
        ${mc.precioReventa > 0 ? `<p style="font-size:.6rem;color:var(--p);font-weight:700">Precio reventa: $${mc.precioReventa.toFixed(2)}</p>` : ''}
      </div>
      <div class="cv2-right">
        ${actionBtn}
        <button class="cupon-btn outline" onclick="event.stopPropagation(); showCuponInfo(${i})">Ver Detalles</button>
        <span class="status-tag ${estadoClass}">${estadoLabel}</span>
      </div>
    </div>`;
  });

  // ── MARKETPLACE: Cupones de otros usuarios ──
  html += `<div class="cup-section" style="margin-top:16px;border-top:2px solid #f0f0f0;padding-top:14px">
    <h3 class="cup-subtitle">🛒 Cupones en venta de la comunidad</h3>
    <p class="cup-desc">Cupones publicados por otros usuarios</p>
  </div>`;

  if (marketplaceCupones.length === 0) {
    html += '<div style="text-align:center;padding:20px;color:#aaa"><p style="font-size:.75rem">No hay cupones en venta de la comunidad disponibles en este momento.<br>Espera a que otro usuario publique uno.</p></div>';
  } else {
    marketplaceCupones.forEach((mc, i) => {
      html += `<div class="cupon-card-v2 marketplace-card">
        <div class="cv2-img" style="background:${mc.bg || 'linear-gradient(135deg,#7B3FBD,#5B2D8E)'}"><span>${mc.emoji || '🎟️'}</span></div>
        <div class="cv2-body">
          <strong>${mc.nombre}</strong>
          <p style="font-size:.62rem;color:#888">Vendedor: <strong>${mc.vendedor}</strong></p>
        </div>
        <div class="cv2-right">
          <div class="market-price">$${mc.precio.toFixed(2)}</div>
          <button class="cupon-btn green-btn" onclick="event.stopPropagation(); comprarDelMarketplace('${mc._docId}')">Comprar</button>
        </div>
      </div>`;
    });
  }

  container.innerHTML = html;
}

// ═══════════════════════════════════════════════
//  NAVIGATION
// ═══════════════════════════════════════════════
function nav(screen) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nb').forEach(b => b.classList.remove('on'));
  const s = document.getElementById('s-' + screen);
  const b = document.getElementById('nb-' + screen);
  if (s) s.classList.add('active');
  if (b) b.classList.add('on');
  const sa = s ? s.querySelector('.scroll-area') : null;
  if (sa) sa.scrollTop = 0;
  // Close FAB
  const fm = document.getElementById('fab-menu');
  const fb = document.getElementById('fab-btn');
  if (fm) fm.classList.remove('show');
  if (fb) fb.classList.remove('open');
}

function switchTab(tab) {
  ['club', 'promo'].forEach(t => {
    const el = document.getElementById('tc-' + t);
    const btn = document.getElementById('tab-' + t);
    if (el) el.style.display = t === tab ? 'block' : 'none';
    if (btn) btn.classList.toggle('on', t === tab);
  });
}

function switchCuponTab(tab) {
  ['adquirir', 'comerciar'].forEach(t => {
    const el = document.getElementById('cup-' + t);
    const btn = document.getElementById('ctab-' + t);
    if (el) el.style.display = t === tab ? 'block' : 'none';
    if (btn) btn.classList.toggle('on', t === tab);
  });
}

function toggleFab() {
  document.getElementById('fab-menu').classList.toggle('show');
  document.getElementById('fab-btn').classList.toggle('open');
}

// ═══════════════════════════════════════════════
//  CUPON DETALLE (Vista de Adquirir)
// ═══════════════════════════════════════════════
function showCuponDetalle(idx) {
  const c = catalogoCupones[idx];
  if (!c) return;
  currentCuponIdx = idx;

  document.getElementById('detalle-hero-bg').style.background = c.bg;
  document.getElementById('detalle-hero-bg').textContent = '';
  document.getElementById('detalle-hero-bg').innerHTML = `<span style="font-size:4rem">${c.emoji}</span>`;
  document.getElementById('detalle-logo').textContent = c.emoji;
  document.getElementById('detalle-title').textContent = 'Detalles del Cupón Especial';
  document.getElementById('detalle-name').textContent = c.nombre + (c.badge ? ' al ' + c.badge.toLowerCase() : '');
  document.getElementById('detalle-desc').innerHTML = `<strong>Se debe canjear el detalle de las ${c.nombre} por ${c.costoAdquisicion} dolares el cupón.</strong>`;
  document.getElementById('detalle-note').textContent = `(Coste de adquisición: $${c.costoAdquisicion} acumulados)`;
  document.getElementById('progreso-req').textContent = '$' + c.gastoRequerido;
  document.getElementById('progreso-total').textContent = '$' + c.gastoRequerido;

  const pct = Math.min(100, Math.round((gastoAcumulado / c.gastoRequerido) * 100));
  document.getElementById('progreso-fill').style.width = pct + '%';

  const faltan = Math.max(0, c.gastoRequerido - gastoAcumulado);
  document.getElementById('progreso-faltan').innerHTML = faltan > 0
    ? `🟣 Faltan <strong>$${faltan}</strong> para desbloquear este cupón.`
    : `🟢 ¡Has alcanzado el gasto requerido! Puedes adquirir este cupón.`;

  // Adquirir button state
  const btn = document.getElementById('det-adquirir-btn');
  const caducado = c.vigenciaFin && c.vigenciaFin < new Date().toISOString().split('T')[0];
  const yaAdquirido = misCupones.some(m => m.cuponId === c.id && m.estado !== 'revendido' && m.estado !== 'caducado');
  const puedeAdquirir = gastoAcumulado >= c.gastoRequerido && !caducado && !yaAdquirido;

  if (caducado) {
    btn.textContent = '⚠️ Cupón Caducado';
    btn.className = 'btn-adquirir disabled';
    btn.onclick = () => t('Este cupón ha caducado y ya no está disponible.');
  } else if (yaAdquirido) {
    btn.textContent = '✓ Ya Adquirido';
    btn.className = 'btn-adquirir disabled';
    btn.onclick = () => t('Ya tienes este cupón. Ve a Comercializar para revenderlo.');
  } else if (puedeAdquirir) {
    btn.textContent = 'Adquirir';
    btn.className = 'btn-adquirir';
    btn.onclick = () => adquirirCupon(idx);
  } else {
    btn.textContent = `🔒 Necesitas $${faltan} más de gasto`;
    btn.className = 'btn-adquirir disabled';
    btn.onclick = () => t(`Te faltan $${faltan} de gasto acumulado para desbloquear este cupón.`);
  }

  // Vigencia info
  const vigEl = document.getElementById('det-vigencia');
  if (vigEl) {
    const vfin = new Date(c.vigenciaFin);
    const diasRestantes = Math.ceil((vfin - new Date()) / 86400000);
    vigEl.innerHTML = caducado
      ? '<span style="color:#e74c3c;font-weight:700">⚠️ Este cupón ha caducado</span>'
      : `Vigencia hasta: <strong>${vfin.toLocaleDateString('es-EC')}</strong> (${diasRestantes} días restantes)`;
  }

  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('s-cupon-detalle').classList.add('active');
}

// ═══════════════════════════════════════════════
//  ADQUIRIR CUPÓN (LÓGICA REAL)
// ═══════════════════════════════════════════════
async function adquirirCupon(idx) {
  const c = catalogoCupones[idx];
  if (!c) return;

  if (gastoAcumulado < c.gastoRequerido) {
    t(`❌ Necesitas $${c.gastoRequerido - gastoAcumulado} más de gasto acumulado`);
    return;
  }

  const yaAdquirido = misCupones.some(m => m.cuponId === c.id && m.estado !== 'revendido' && m.estado !== 'caducado');
  if (yaAdquirido) {
    t('⚠️ Ya tienes este cupón');
    return;
  }

  // Create the cupon in Firebase
  const nuevoCupon = {
    cuponId: c.id,
    estado: 'nuevo',
    precioReventa: 0,
    fechaAdquisicion: new Date().toISOString()
  };

  try {
    const docRef = await db.collection('usuarios').doc(USER_ID).collection('mis_cupones').add(nuevoCupon);
    misCupones.push({ ...nuevoCupon, _docId: docRef.id, ...c });

    // Log the acquisition in RTDB
    await rtdb.ref('actividad/' + USER_ID).push({
      tipo: 'adquisicion',
      cupon: c.nombre,
      timestamp: Date.now()
    });

    t('🎉 ¡Cupón ' + c.nombre + ' adquirido exitosamente!');
  } catch(e) {
    console.warn('Firebase write error:', e);
    misCupones.push({ ...nuevoCupon, _docId: 'local_' + Date.now(), ...c });
    t('🎉 ¡Cupón ' + c.nombre + ' adquirido! (modo local)');
  }

  renderCuponesAdquirir();
  renderMisCupones();

  // Navigate back to cupones
  setTimeout(() => {
    nav('cupones');
    switchCuponTab('comerciar');
  }, 1500);
}

// ═══════════════════════════════════════════════
//  COMERCIALIZAR FORM
// ═══════════════════════════════════════════════
let currentComercIdx = null;

function showComercializarForm(idx) {
  const mc = misCupones[idx];
  if (!mc) return;
  if (mc.estado === 'caducado') { t('⚠️ Este cupón ha caducado'); return; }
  if (mc.estado === 'publicado') { t('ℹ️ Este cupón ya está publicado'); return; }
  if (mc.estado === 'revendido') { t('ℹ️ Este cupón ya fue revendido'); return; }

  currentComercIdx = idx;

  document.getElementById('comerc-price').value = '$0.00';
  document.getElementById('comerc-slider').value = 0;
  document.getElementById('comerc-slider').max = Math.round(mc.maxReventa * 100);
  document.getElementById('comerc-max-label').textContent = `Precio máximo permitido: $${mc.maxReventa.toFixed(2)}`;

  // Update preview
  const previewArea = document.getElementById('comerc-preview-area');
  if (previewArea) {
    previewArea.innerHTML = `
      <div class="cupon-card-v2 mini">
        <div class="cv2-img" style="background:${mc.bg}"><span>${mc.emoji}</span></div>
        <div class="cv2-body">
          <strong>${mc.nombre}</strong>
          <p>${mc.descCorto || mc.desc}</p>
        </div>
      </div>`;
  }

  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('s-comercializar-form').classList.add('active');
}

function updateSlider() {
  const slider = document.getElementById('comerc-slider');
  const input = document.getElementById('comerc-price');
  const val = (slider.value / 100).toFixed(2);
  input.value = '$' + val;
  const pct = (slider.value / slider.max) * 100;
  slider.style.background = `linear-gradient(90deg, var(--p) ${pct}%, #eee ${pct}%)`;
}

async function publicarCupon() {
  if (currentComercIdx === null) return;
  const mc = misCupones[currentComercIdx];
  if (!mc) return;

  const priceStr = document.getElementById('comerc-price').value.replace('$', '');
  const precio = parseFloat(priceStr);

  if (isNaN(precio) || precio <= 0) {
    t('❌ Ingresa un precio de reventa válido');
    return;
  }

  if (precio > mc.maxReventa) {
    t(`❌ El precio máximo permitido es $${mc.maxReventa.toFixed(2)}`);
    return;
  }

  // Update state
  mc.estado = 'publicado';
  mc.precioReventa = precio;
  mc.fechaPublicacion = new Date().toISOString();

  try {
    await db.collection('usuarios').doc(USER_ID).collection('mis_cupones').doc(mc._docId).update({
      estado: 'publicado',
      precioReventa: precio,
      fechaPublicacion: mc.fechaPublicacion
    });

    // Push to market
    await db.collection('mercado_cupones').add({
      vendedor: USER_ID,
      vendedorDocId: mc._docId,
      cuponId: mc.cuponId,
      nombre: mc.nombre,
      emoji: mc.emoji,
      bg: mc.bg || '',
      badge: mc.badge || '',
      descCorto: mc.descCorto || mc.desc || '',
      precio: precio,
      estado: 'disponible',
      fechaPublicacion: firebase.firestore.FieldValue.serverTimestamp()
    });

    // RTDB notification
    await rtdb.ref('actividad/' + USER_ID).push({
      tipo: 'publicacion',
      cupon: mc.nombre,
      precio: precio,
      timestamp: Date.now()
    });

    t('✅ ¡' + mc.nombre + ' publicado a $' + precio.toFixed(2) + '!');
  } catch(e) {
    console.warn('Publish error:', e);
    t('✅ ¡Publicado a $' + precio.toFixed(2) + '! (modo local)');
  }

  renderMisCupones();
  renderCuponesAdquirir();

  setTimeout(() => {
    nav('cupones');
    switchCuponTab('comerciar');
  }, 1500);
}

async function cancelarPublicacion(idx) {
  const mc = misCupones[idx];
  if (!mc || mc.estado !== 'publicado') return;

  mc.estado = 'activo';
  mc.precioReventa = 0;

  try {
    await db.collection('usuarios').doc(USER_ID).collection('mis_cupones').doc(mc._docId).update({
      estado: 'activo',
      precioReventa: 0
    });
    t('🔄 Publicación de ' + mc.nombre + ' cancelada');
  } catch(e) {
    t('🔄 Publicación cancelada (modo local)');
  }

  renderMisCupones();
}

// ═══════════════════════════════════════════════
//  CUPON INFO (Detalle completo)
// ═══════════════════════════════════════════════
let lastInfoScreen = 'cupones';

function showCuponInfo(idx) {
  const mc = misCupones[idx] || catalogoCupones[idx];
  if (!mc) return;

  document.getElementById('info-hero-bg').style.background = mc.bg;
  document.getElementById('info-emoji').textContent = mc.emoji;
  document.getElementById('info-badge').textContent = mc.badge || mc.precio || '';
  document.getElementById('info-title').textContent = mc.nombre;
  document.getElementById('info-desc').textContent = mc.desc;

  // Vigencia
  const vigEl = document.getElementById('info-vigencia');
  if (vigEl && mc.vigenciaFin) {
    const vfin = new Date(mc.vigenciaFin);
    const caducado = mc.vigenciaFin < new Date().toISOString().split('T')[0];
    vigEl.innerHTML = caducado
      ? '<span style="color:#e74c3c">⚠️ Caducado</span>'
      : `Del 1 al ${vfin.toLocaleDateString('es-EC', { day:'numeric', month:'long' })}`;
  }

  // Estado
  const estadoEl = document.getElementById('info-estado');
  if (estadoEl && mc.estado) {
    estadoEl.innerHTML = `<span class="status-tag ${mc.estado}">${mc.estado.charAt(0).toUpperCase() + mc.estado.slice(1)}</span>`;
  }

  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('s-cupon-info').classList.add('active');
}

function goBackFromInfo() {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('s-cupones').classList.add('active');
}

// ═══════════════════════════════════════════════
//  SALDO BILLETERA (para demo de compra/venta)
// ═══════════════════════════════════════════════
let saldoBilletera = 10.00;

function updateWalletUI() {
  const el = document.getElementById('wallet-amount');
  if (el) el.textContent = '$' + saldoBilletera.toFixed(2);
  // Also update on balance display
  const balExtra = document.getElementById('bal-wallet');
  if (balExtra) balExtra.textContent = 'Billetera: $' + saldoBilletera.toFixed(2);
}

// ═══════════════════════════════════════════════
//  MARKETPLACE: ESCUCHAR CUPONES DE OTROS USERS
// ═══════════════════════════════════════════════
function listenMarketplace() {
  db.collection('mercado_cupones').where('estado', '==', 'disponible')
    .onSnapshot((snap) => {
      marketplaceCupones = [];
      snap.forEach(doc => {
        const data = doc.data();
        // Solo mostrar cupones de OTROS usuarios
        if (data.vendedor !== USER_ID) {
          marketplaceCupones.push({ ...data, _docId: doc.id });
        }
      });
      renderMisCupones();
      if (marketplaceCupones.length > 0) {
        t('🛒 Hay ' + marketplaceCupones.length + ' cupón(es) en venta de la comunidad');
      }
    }, (err) => {
      console.warn('Marketplace listener error:', err);
    });
}

// ═══════════════════════════════════════════════
//  COMPRAR DEL MARKETPLACE (Multi-usuario real)
// ═══════════════════════════════════════════════
async function comprarDelMarketplace(marketDocId) {
  const mc = marketplaceCupones.find(m => m._docId === marketDocId);
  if (!mc) { t('⚠️ Este cupón ya no está disponible'); return; }

  const precio = mc.precio;

  if (saldoBilletera < precio) {
    t(`❌ Saldo insuficiente. Necesitas $${precio.toFixed(2)} y tienes $${saldoBilletera.toFixed(2)}`);
    return;
  }

  const saldoAntes = saldoBilletera;
  saldoBilletera -= precio;

  try {
    // Marcar como vendido en mercado
    await db.collection('mercado_cupones').doc(marketDocId).update({
      estado: 'vendido',
      comprador: USER_ID,
      fechaVenta: firebase.firestore.FieldValue.serverTimestamp()
    });

    // Notificar al vendedor via RTDB
    await rtdb.ref('actividad/' + mc.vendedor).push({
      tipo: 'compra_mercado',
      cupon: mc.nombre,
      cuponId: mc.cuponId,
      precio: precio,
      comprador: USER_ID,
      timestamp: Date.now()
    });

    // Guardar cupón comprado en mis cupones (estado 'comprado' para que no lo revenda)
    const catRef = catalogoCupones.find(c => c.id === mc.cuponId);
    await db.collection('usuarios').doc(USER_ID).collection('mis_cupones').add({
      cuponId: mc.cuponId,
      estado: 'comprado',
      precioReventa: 0,
      fechaAdquisicion: new Date().toISOString(),
      compradoEn: 'comunidad',
      precioCompra: precio
    });

    // Cambiar el estado del cupón del VENDEDOR directamente a 'revendido'
    if (mc.vendedor && mc.vendedorDocId) {
      await db.collection('usuarios').doc(mc.vendedor).collection('mis_cupones').doc(mc.vendedorDocId).update({
        estado: 'revendido',
        fechaReventa: new Date().toISOString()
      });
    }

    // Agregar a mis cupones localmente
    if (catRef) {
      misCupones.push({
        cuponId: mc.cuponId,
        estado: 'comprado',
        precioReventa: 0,
        fechaAdquisicion: new Date().toISOString(),
        _docId: 'market_' + Date.now(),
        ...catRef
      });
    }
  } catch(e) {
    console.warn('Buy error:', e);
  }

  t(`🎉 ¡Compraste ${mc.nombre} por $${precio.toFixed(2)}!`);

  setTimeout(() => {
    showBalanceChange(mc.nombre, mc.vendedor, precio, saldoAntes);
  }, 800);

  renderMisCupones();
  updateWalletUI();
}

function showBalanceChange(cuponName, vendedor, precio, saldoAntes) {
  const existing = document.getElementById('balance-modal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.id = 'balance-modal';
  modal.className = 'modal-bg show';
  modal.innerHTML = `
    <div class="modal" style="max-width:320px">
      <div class="modal-check" style="background:linear-gradient(135deg,#0D6832,#1A7A3C)">💰</div>
      <h3>Transacción completada</h3>
      <div style="text-align:left;margin:16px 0;font-size:.78rem;color:#555">
        <div style="padding:8px 12px;background:#f8f5ff;border-radius:10px;margin-bottom:8px">
          <p style="font-weight:700;color:#5B2D8E;margin-bottom:4px">🛍️ Comprador (${USER_ID})</p>
          <p>Saldo anterior: <strong>$${saldoAntes.toFixed(2)}</strong></p>
          <p>Pagaste: <strong style="color:#e74c3c">-$${precio.toFixed(2)}</strong></p>
          <p>Saldo actual: <strong style="color:#0D6832">$${saldoBilletera.toFixed(2)}</strong></p>
        </div>
        <div style="padding:8px 12px;background:#f0fdf4;border-radius:10px">
          <p style="font-weight:700;color:#0D6832;margin-bottom:4px">💸 Vendedor (${vendedor})</p>
          <p>Recibió: <strong style="color:#0D6832">+$${precio.toFixed(2)}</strong></p>
          <p style="font-size:.62rem;color:#888">Cupón: ${cuponName}</p>
        </div>
      </div>
      <button class="modal-btn" onclick="document.getElementById('balance-modal').remove()">Entendido</button>
    </div>`;
  document.body.appendChild(modal);
}

// ═══════════════════════════════════════════════
//  GASTO ACUMULADO (Simular pago)
// ═══════════════════════════════════════════════
async function simularGasto(monto) {
  gastoAcumulado += monto;
  try {
    await db.collection('usuarios').doc(USER_ID).update({ gastoAcumulado });
  } catch(e) {}
  updateBalanceUI();
  renderCuponesAdquirir();
  t(`💰 +$${monto} de gasto acumulado. Total: $${gastoAcumulado}`);
}

function updateBalanceUI() {
  const el = document.getElementById('bal-amount');
  if (el) el.textContent = '$' + gastoAcumulado.toFixed(2).replace('.', ',');
  const spentEl = document.querySelector('.spent-link');
  if (spentEl) spentEl.textContent = `Gastaste $${gastoAcumulado},00 los últimos 30 días`;
}

// ═══════════════════════════════════════════════
//  TOAST
// ═══════════════════════════════════════════════
let _tt;
function t(msg) {
  const el = document.getElementById('toast');
  if (!el) return;
  clearTimeout(_tt);
  el.textContent = msg;
  el.classList.add('show');
  _tt = setTimeout(() => el.classList.remove('show'), 2800);
}

// ═══════════════════════════════════════════════
//  FIREBASE REALTIME LISTENER
// ═══════════════════════════════════════════════
let listenerInitTime = Date.now();
function listenForActivity() {
  rtdb.ref('actividad/' + USER_ID).orderByChild('timestamp').limitToLast(1).on('child_added', (snap) => {
    const data = snap.val();
    if (data && data.tipo === 'compra_mercado' && data.timestamp > listenerInitTime) {
      // Alguien compró nuestro cupón
      t('🎉 ¡Tu cupón ' + (data.cupon || '') + ' fue comprado por $' + (data.precio||0).toFixed(2) + '!');
      
      // Añadir el saldo a nuestra billetera
      if (data.precio) {
        saldoBilletera += data.precio;
        updateWalletUI();
      }

      // Update status to revendido localmente (Firebase ya lo actualizó el comprador)
      misCupones.forEach(mc => {
        if (mc.cuponId === data.cuponId && mc.estado === 'publicado') {
          mc.estado = 'revendido';
          mc.fechaReventa = new Date().toISOString();
        }
      });
      renderMisCupones();
    }
  });
}

// ═══════════════════════════════════════════════
//  LISTEN FOR NEW COUPONS FROM NEGOCIOS (RTDB)
// ═══════════════════════════════════════════════
function listenForNewCupones() {
  rtdb.ref('cupones_nuevos').on('child_added', (snap) => {
    const c = snap.val();
    if (!c || !c.id) return;

    // Check if we already have this cupon
    const exists = catalogoCupones.some(cat => cat.id === c.id);
    if (!exists) {
      catalogoCupones.push(c);
      renderCuponesAdquirir();
      t('🔔 ¡Nuevo cupón disponible: ' + c.nombre + '!');
      console.log('📥 Nuevo cupón recibido:', c.nombre);
    }
  });
}

// ═══════════════════════════════════════════════
//  INIT
// ═══════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', async () => {
  nav('inicio');
  switchTab('promo');

  // Firebase data
  await seedFirebase();
  await loadData();
  listenForActivity();
  listenForNewCupones();
  listenMarketplace();

  // Dots animation
  let di = 0;
  setInterval(() => {
    document.querySelectorAll('.dot').forEach((d, i) => d.classList.toggle('on', i === di));
    di = (di + 1) % 4;
  }, 2500);

  console.log('🚀 Deuna Usuarios initialized');
  
  // Inject Dev Tools Panel
  renderDevTools();
});

// ═══════════════════════════════════════════════
//  DEV TOOLS PANEL (Modificar usuario, saldo, gasto)
// ═══════════════════════════════════════════════
function renderDevTools() {
  const panel = document.createElement('div');
  panel.style.cssText = 'position:fixed;bottom:70px;right:10px;background:rgba(255,255,255,0.95);border:2px solid #7B3FBD;border-radius:12px;padding:12px;z-index:9999;box-shadow:0 10px 25px rgba(0,0,0,0.2);backdrop-filter:blur(10px);width:180px;transform:translateX(110%);transition:transform 0.3s;color:#333;font-size:0.7rem;';
  panel.id = 'dev-panel';

  const toggleBtn = document.createElement('button');
  toggleBtn.innerHTML = '⚙️';
  toggleBtn.style.cssText = 'position:fixed;bottom:70px;right:10px;background:#7B3FBD;color:white;border:none;border-radius:50%;width:40px;height:40px;font-size:1.2rem;z-index:10000;box-shadow:0 4px 10px rgba(0,0,0,0.3);cursor:pointer;';
  toggleBtn.onclick = () => {
    const isShowing = panel.style.transform === 'translateX(0%)';
    panel.style.transform = isShowing ? 'translateX(110%)' : 'translateX(0%)';
  };
  document.body.appendChild(toggleBtn);

  panel.innerHTML = `
    <strong style="display:block;margin-bottom:8px;color:#7B3FBD;font-size:.8rem">⚙️ Dev Tools</strong>
    <label style="display:block;margin-bottom:4px">User ID:</label>
    <input type="text" id="dev-user" value="${USER_ID}" style="width:100%;margin-bottom:8px;padding:4px;border:1px solid #ccc;border-radius:4px;font-size:.7rem"/>
    
    <label style="display:block;margin-bottom:4px">Saldo Billetera ($):</label>
    <input type="number" id="dev-saldo" value="${saldoBilletera}" style="width:100%;margin-bottom:8px;padding:4px;border:1px solid #ccc;border-radius:4px;font-size:.7rem"/>
    
    <label style="display:block;margin-bottom:4px">Gasto Acumulado ($):</label>
    <input type="number" id="dev-gasto" value="${gastoAcumulado}" style="width:100%;margin-bottom:12px;padding:4px;border:1px solid #ccc;border-radius:4px;font-size:.7rem"/>
    
    <button id="dev-apply" style="width:100%;background:#7B3FBD;color:#fff;border:none;padding:6px;border-radius:6px;font-weight:bold;cursor:pointer">Aplicar Cambios</button>
  `;
  document.body.appendChild(panel);

  document.getElementById('dev-apply').onclick = async () => {
    const newUserId = document.getElementById('dev-user').value.trim();
    const newSaldo = parseFloat(document.getElementById('dev-saldo').value);
    const newGasto = parseFloat(document.getElementById('dev-gasto').value);

    let reloadData = false;
    if (newUserId && newUserId !== USER_ID) {
      USER_ID = newUserId;
      reloadData = true;
    }

    if (!isNaN(newSaldo)) {
      saldoBilletera = newSaldo;
      updateWalletUI();
    }

    if (!isNaN(newGasto)) {
      gastoAcumulado = newGasto;
      updateBalanceUI();
      try {
        await db.collection('usuarios').doc(USER_ID).update({ gastoAcumulado: newGasto });
      } catch(e) {}
    }

    if (reloadData) {
      t('🔄 Cambiando de usuario... cargando datos');
      await seedFirebase();
      await loadData();
    } else {
      renderCuponesAdquirir();
      t('✅ Valores actualizados para testeo');
    }
  };
}

