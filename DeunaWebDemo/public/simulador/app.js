/* ============================================================
   DEUNA SIMULADOR — APP LOGIC (sincronizado con index.html)
   ============================================================ */

/* ── USER NAVIGATION ── */
function switchUserScreen(name) {
  document.querySelectorAll('#screen-usuario .app-screen').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('#nav-usuario .nav-btn').forEach(b => b.classList.remove('active'));
  const s = document.getElementById('u-' + name);
  const b = document.getElementById('navbtn-u-' + name);
  if (s) s.classList.add('active');
  if (b) b.classList.add('active');
}

/* ── VENDOR NAVIGATION ── */
function switchVendorScreen(name) {
  document.querySelectorAll('#screen-vendedor .app-screen').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('#nav-vendedor .nav-btn').forEach(b => b.classList.remove('active'));
  const s = document.getElementById('v-' + name);
  const b = document.getElementById('navbtn-v-' + name);
  if (s) s.classList.add('active');
  if (b) b.classList.add('active');
}

/* ── BENEFIT TABS (user) ── */
function switchBenefitTab(tab) {
  ['club', 'promo'].forEach(t => {
    const el = document.getElementById('bc-' + t);
    const btn = document.getElementById('tab-' + t);
    if (el) el.style.display = t === tab ? 'block' : 'none';
    if (btn) btn.classList.toggle('active', t === tab);
  });
}

/* ── VENDOR COBRAR/GESTIONAR TABS ── */
function switchVendorTab(tab) {
  ['cobrar', 'gestionar'].forEach(t => {
    const el = document.getElementById('vc-' + t);
    const btn = document.getElementById('vtab-' + t);
    if (el) el.style.display = t === tab ? 'block' : 'none';
    if (btn) btn.classList.toggle('active', t === tab);
  });
}

/* ── CAJA TABS ── */
function switchCajaTab(tab) {
  ['activa', 'historial'].forEach(t => {
    const el = document.getElementById('cc-' + t);
    const btn = document.getElementById('ctab-' + t);
    if (el) el.style.display = t === tab ? 'block' : 'none';
    if (btn) btn.classList.toggle('active', t === tab);
  });
}

/* ── PAYMENT METHOD TABS ── */
function switchPayMethod(method) {
  ['qr', 'tarjeta', 'manual'].forEach(m => {
    const btn = document.getElementById('pm-' + m);
    if (btn) btn.classList.toggle('active', m === method);
  });
}

/* ── NUMPAD ── */
let amount = '';
function numpadPress(val) {
  if (val === ',' && amount.includes(',')) return;
  if (amount.length >= 8) return;
  if (amount === '0' && val !== ',') amount = '';
  amount += val;
  updateMonto();
}
function numpadDelete() {
  amount = amount.slice(0, -1);
  updateMonto();
}
function updateMonto() {
  const el  = document.getElementById('monto-val');
  const btn = document.getElementById('cobrar-btn');
  if (el) el.textContent = amount || '0';
  const hasAmt = amount !== '' && amount !== '0' && amount !== ',';
  if (btn) {
    btn.classList.toggle('ready', hasAmt);
    btn.textContent = hasAmt ? `Cobrar $${amount}` : 'Continuar para Cobrar';
  }
}

/* ── PROCESS PAYMENT ── */
function processPay() {
  if (!amount || amount === '0' || amount === ',') {
    showToast('Ingresa un monto para cobrar');
    return;
  }
  const amtEl = document.getElementById('pay-modal-amount');
  if (amtEl) amtEl.textContent = '$' + amount;
  document.getElementById('pay-modal').classList.add('show');
}

function closeModal() {
  document.getElementById('pay-modal').classList.remove('show');
  // Show sale in historial
  const histEl = document.getElementById('historial-amount');
  if (histEl) histEl.textContent = '$' + amount;
  const empty = document.getElementById('historial-empty');
  const sales = document.getElementById('historial-sales');
  if (empty) empty.style.display = 'none';
  if (sales) sales.style.display = 'block';
  // Navigate to caja > historial
  switchVendorScreen('caja');
  switchCajaTab('historial');
  // Reset
  amount = '';
  updateMonto();
  showToast('✓ Venta registrada exitosamente');
}

/* ── HISTORY FILTER ── */
const histData = {
  hoy:    { val: '$0,00',   sales: false },
  ayer:   { val: '$23,50',  sales: true  },
  semana: { val: '$156,80', sales: true  },
};
function filterHistory(period, btn) {
  document.querySelectorAll('.filter-pill').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  const data = histData[period] || histData.hoy;
  const valEl   = document.getElementById('historial-amount');
  const emptyEl = document.getElementById('historial-empty');
  const salesEl = document.getElementById('historial-sales');
  if (valEl)   valEl.textContent  = data.val;
  if (emptyEl) emptyEl.style.display = data.sales ? 'none'  : 'block';
  if (salesEl) salesEl.style.display = data.sales ? 'block' : 'none';
}

/* ── TOAST ── */
let toastTimer;
function showToast(msg) {
  const el = document.getElementById('toast');
  if (!el) return;
  clearTimeout(toastTimer);
  el.textContent = msg;
  el.classList.add('show');
  toastTimer = setTimeout(() => el.classList.remove('show'), 2400);
}

/* ── CUPON DATA ── */
const webCupones = [
  { emoji: '🍕', name: 'Pizza Hut', badge: '20% de Descuento', desc: 'Combo pizza familiar Crown, incluye: 16 bordes rellenos de queso importado, chorizo ahumado y chistorra + gaseosa 1L + choco sticks x8', price: null, bg: 'linear-gradient(135deg,#c0392b,#e74c3c)', cost: 150, req: 400, vigencia: '2026-06-30', maxReventa: 1.60 },
  { emoji: '🎬', name: 'Multicines', badge: null, desc: 'Boletos 2D solo lunes y jueves. Válido en todas las salas a nivel nacional.', price: '$2,60', bg: 'linear-gradient(135deg,#FFD700,#FF8C00)', cost: 80, req: 250, vigencia: '2026-05-31', maxReventa: 1.20 },
  { emoji: '🍗', name: 'KFC', badge: null, desc: 'Big Box Recargado: 2 presas, 2 alitas picantes, papas fritas medianas y refresco de 16oz.', price: '$4,99', bg: 'linear-gradient(135deg,#cc0000,#ff4444)', cost: 100, req: 300, vigencia: '2026-07-15', maxReventa: 2.00 },
  { emoji: '🍕', name: 'Pizza Hut', badge: '10% de Descuento', desc: 'Pizza mediana de cualquier especialidad con 10% de descuento pagando con Deuna.', price: null, bg: 'linear-gradient(135deg,#8e44ad,#9b59b6)', cost: 40, req: 200, vigencia: '2026-06-15', maxReventa: 0.80 }
];
let webGasto = 250;

/* ── CUPONES NAVIGATION ── */
function showUserCupones(tab) {
  document.querySelectorAll('#screen-usuario .app-screen').forEach(s => s.classList.remove('active'));
  document.getElementById('u-cupones').classList.add('active');
  switchCuponTab(tab || 'adquirir');
}

function switchCuponTab(tab) {
  ['adquirir', 'comerciar'].forEach(t => {
    const el = document.getElementById('ucupc-' + t);
    const btn = document.getElementById('ucup-' + t);
    if (el) el.style.display = t === tab ? 'block' : 'none';
    if (btn) btn.classList.toggle('active', t === tab);
  });
}

/* ── CUPON DETALLE ── */
function showCuponDetalle(idx) {
  const c = webCupones[idx];
  if (!c) return;

  document.getElementById('det-hero').style.background = c.bg;
  document.getElementById('det-emoji').textContent = c.emoji;
  document.getElementById('det-icon').textContent = c.emoji;
  document.getElementById('det-title').textContent = c.name + (c.badge ? ' al ' + c.badge.toLowerCase() : '');
  document.getElementById('det-desc').innerHTML = `<strong>Se debe canjear el detalle de las ${c.name} por ${c.cost} dolares el cupón.</strong>`;
  document.getElementById('det-note').textContent = `(Coste de adquisición: $${c.cost} acumulados)`;
  document.getElementById('det-req').textContent = '$' + c.req;
  document.getElementById('det-total').textContent = '$' + c.req;

  const pct = Math.min(100, Math.round((webGasto / c.req) * 100));
  document.getElementById('det-fill').style.width = pct + '%';
  const faltan = Math.max(0, c.req - webGasto);
  document.getElementById('det-faltan').innerHTML = faltan > 0
    ? `🟣 Faltan <strong>$${faltan}</strong> para desbloquear este cupón.`
    : `🟢 ¡Puedes adquirir este cupón!`;

  const btn = document.getElementById('det-adquirir-btn');
  const caducado = c.vigencia < new Date().toISOString().split('T')[0];
  if (caducado) {
    btn.textContent = '⚠️ Cupón Caducado';
    btn.className = 'adquirir-btn disabled';
    btn.onclick = () => showToast('Este cupón ha caducado.');
  } else if (webGasto >= c.req) {
    btn.textContent = 'Adquirir';
    btn.className = 'adquirir-btn';
    btn.onclick = () => {
      showToast('🎉 ¡Cupón ' + c.name + ' adquirido!');
      setTimeout(() => { showUserCupones('comerciar'); }, 1000);
    };
  } else {
    btn.textContent = `🔒 Necesitas $${faltan} más`;
    btn.className = 'adquirir-btn disabled';
    btn.onclick = () => showToast(`Te faltan $${faltan} de gasto acumulado.`);
  }

  document.querySelectorAll('#screen-usuario .app-screen').forEach(s => s.classList.remove('active'));
  document.getElementById('u-cupon-detalle').classList.add('active');
}

function tryAdquirir() {
  showToast('🎉 ¡Cupón adquirido exitosamente!');
}

/* ── COMERCIALIZAR FORM ── */
function showComercForm(idx) {
  document.querySelectorAll('#screen-usuario .app-screen').forEach(s => s.classList.remove('active'));
  document.getElementById('u-comerc-form').classList.add('active');
}

function updateWebSlider() {
  const slider = document.getElementById('web-comerc-slider');
  const input = document.getElementById('web-comerc-price');
  const val = (slider.value / 100).toFixed(2);
  input.value = '$' + val;
  const pct = (slider.value / slider.max) * 100;
  slider.style.background = `linear-gradient(90deg, #5B2D8E ${pct}%, #eee ${pct}%)`;
}

/* ── CUPON INFO ── */
function showCuponInfo(idx) {
  const c = webCupones[idx] || webCupones[0];
  document.getElementById('info-hero').style.background = c.bg;
  document.getElementById('info-emoji').textContent = c.emoji;
  document.getElementById('info-badge').textContent = c.badge || c.price || '';
  document.getElementById('info-title').textContent = c.name;
  document.getElementById('info-desc').textContent = c.desc;

  document.querySelectorAll('#screen-usuario .app-screen').forEach(s => s.classList.remove('active'));
  document.getElementById('u-cupon-info').classList.add('active');
}

function goBackFromInfoWeb() {
  document.querySelectorAll('#screen-usuario .app-screen').forEach(s => s.classList.remove('active'));
  document.getElementById('u-cupones').classList.add('active');
}

/* ── TOGGLE BALANCE ── */
function toggleBalance() {
  const el = document.getElementById('u-balance');
  if (!el) return;
  if (el.dataset.hidden === 'true') {
    el.textContent = '$0,00';
    el.dataset.hidden = 'false';
  } else {
    el.textContent = '••••';
    el.dataset.hidden = 'true';
  }
}

/* ── INIT ── */
document.addEventListener('DOMContentLoaded', () => {
  // Activate default screens
  const uInicio = document.getElementById('u-inicio');
  const vInicio = document.getElementById('v-inicio');
  if (uInicio) uInicio.classList.add('active');
  if (vInicio) vInicio.classList.add('active');

  // Active nav buttons
  const uBtn = document.getElementById('navbtn-u-inicio');
  const vBtn = document.getElementById('navbtn-v-inicio');
  if (uBtn) uBtn.classList.add('active');
  if (vBtn) vBtn.classList.add('active');

  // Default tabs
  switchBenefitTab('promo');
  switchVendorTab('cobrar');
  switchCajaTab('historial');

  // Entrance animation
  document.querySelectorAll('.phone').forEach((f, i) => {
    f.style.opacity = '0';
    f.style.transform = 'translateY(40px)';
    requestAnimationFrame(() => {
      setTimeout(() => {
        f.style.transition = 'opacity .65s cubic-bezier(.4,0,.2,1), transform .65s cubic-bezier(.4,0,.2,1)';
        f.style.opacity = '1';
        f.style.transform = 'translateY(0)';
      }, 150 + i * 200);
    });
  });

  // Promo dots animation
  let dotIdx = 0;
  setInterval(() => {
    document.querySelectorAll('.dot').forEach((d, i) => d.classList.toggle('active', i === dotIdx));
    dotIdx = (dotIdx + 1) % 4;
  }, 2500);
});
