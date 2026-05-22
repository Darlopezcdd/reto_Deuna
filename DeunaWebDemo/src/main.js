import './style.css';

// ═══ SURVEY DATA ANALYSIS ═══
const surveyData = {
  total: 142,
  usaDeuna: { si: 89, no: 53 },
  conoceDescuentos: { si: 44, no: 98 },
  atractivo: { '1': 9, '2': 6, '3': 30, '4': 33, '5': 64 },
  motivacion: {
    'definitivamente sí': 57,
    'probablemente sí': 65,
    'Probablemente no': 8,
    'no cambiaría mi uso actual': 12,
    'Definitivamente no': 0
  }
};

// Calculate metrics
const pctUsaDeuna = Math.round((surveyData.usaDeuna.si / surveyData.total) * 100);
const pctNoConoceDesc = Math.round((surveyData.conoceDescuentos.no / surveyData.total) * 100);
const pctAtractivo45 = Math.round(((surveyData.atractivo['4'] + surveyData.atractivo['5']) / surveyData.total) * 100);
const pctMotivaSi = Math.round(((surveyData.motivacion['definitivamente sí'] + surveyData.motivacion['probablemente sí']) / surveyData.total) * 100);
const promedioAtractivo = ((1*9 + 2*6 + 3*30 + 4*33 + 5*64) / surveyData.total).toFixed(1);

document.querySelector('#app').innerHTML = `
  <!-- NAV -->
  <nav class="nav">
    <div class="nav-logo">
      <img src="/logo.png" alt="Deuna"/>
      <span>Deuna</span>
    </div>
    <div class="nav-links">
      <a href="#problema">Problema</a>
      <a href="#metricas">Métricas</a>
      <a href="#solucion">Solución</a>
      <a href="#features">Funcionalidades</a>
      <a href="#apps">Simulador</a>
    </div>
  </nav>

  <!-- HERO -->
  <section class="hero">
    <div class="hero-badge">🏆 DevIAthon Deuna — Reto Categoría Deuna</div>
    <h1>
      Comercialización de Cupones:<br/>
      <span class="gradient">Monetización Sostenible</span>
    </h1>
    <p>
      ¿Cómo crear funcionalidades digitales que los usuarios realmente quieran usar 
      y que permitan <strong>monetización sostenible</strong> en Deuna?
    </p>
    <div class="hero-btns">
      <button class="btn-primary" onclick="document.getElementById('problema').scrollIntoView({behavior:'smooth'})">
        Ver Problemática
      </button>
      <button class="btn-secondary" onclick="document.getElementById('apps').scrollIntoView({behavior:'smooth'})">
        Ver Simulador
      </button>
    </div>

    <div class="hero-stats">
      <div class="hero-stat">
        <span class="hs-num">${surveyData.total}</span>
        <span class="hs-label">Encuestados</span>
      </div>
      <div class="hero-stat">
        <span class="hs-num">${pctMotivaSi}%</span>
        <span class="hs-label">Usaría más Deuna</span>
      </div>
      <div class="hero-stat">
        <span class="hs-num">${promedioAtractivo}/5</span>
        <span class="hs-label">Atractivo</span>
      </div>
    </div>
  </section>

  <!-- PROBLEMA -->
  <section class="section" id="problema">
    <div class="section-header">
      <h2>La Problemática</h2>
      <p>El reto real que enfrenta Deuna hoy</p>
    </div>

    <div class="problema-grid">
      <div class="problema-card prob-red">
        <div class="prob-number">48%</div>
        <div class="prob-text">
          <strong>Usuarios activos que generan ingresos</strong>
          <p>Solo el 48% de los usuarios activos generan ingresos directos mediante compras, pagos de servicios, recargas y transferencias.</p>
        </div>
      </div>
      <div class="problema-card prob-orange">
        <div class="prob-number">52%</div>
        <div class="prob-text">
          <strong>Usuarios pasivos</strong>
          <p>Más de la mitad de la base de usuarios utiliza la plataforma sin activar mecanismos de monetización.</p>
        </div>
      </div>
      <div class="problema-card prob-purple">
        <div class="prob-icon">⚠️</div>
        <div class="prob-text">
          <strong>Falta de incentivos</strong>
          <p>No existen suficientes mecanismos que incentiven la frecuencia de uso ni la adopción de funcionalidades monetizables.</p>
        </div>
      </div>
      <div class="problema-card prob-blue">
        <div class="prob-icon">🎯</div>
        <div class="prob-text">
          <strong>Oportunidad no cubierta</strong>
          <p>Se requiere identificar necesidades financieras no cubiertas y transformarlas en oportunidades de valor sostenido.</p>
        </div>
      </div>
    </div>

    <div class="objectives-wrap">
      <h3>Objetivos Secundarios del Reto</h3>
      <div class="obj-grid">
        <div class="obj-item"><span>📈</span> Incrementar la frecuencia de uso</div>
        <div class="obj-item"><span>🔄</span> Convertir usuarios pasivos en activos</div>
        <div class="obj-item"><span>💰</span> Modelos de ingresos recurrentes</div>
        <div class="obj-item"><span>✨</span> Experiencia simple y de alto valor</div>
      </div>
    </div>
  </section>

  <!-- MÉTRICAS -->
  <section class="section" id="metricas">
    <div class="section-header">
      <h2>Validación con Usuarios Reales</h2>
      <p>Resultados del formulario aplicado a ${surveyData.total} personas</p>
    </div>

    <div class="metrics-grid">
      <!-- Pregunta 1 -->
      <div class="metric-card">
        <h3>¿Usas Deuna actualmente?</h3>
        <div class="donut-wrap">
          <svg viewBox="0 0 120 120" class="donut">
            <circle cx="60" cy="60" r="50" fill="none" stroke="var(--surface2)" stroke-width="12"/>
            <circle cx="60" cy="60" r="50" fill="none" stroke="#7B3FBD" stroke-width="12"
              stroke-dasharray="${(pctUsaDeuna/100)*314.16} ${314.16 - (pctUsaDeuna/100)*314.16}" 
              stroke-dashoffset="78.54" stroke-linecap="round"/>
            <text x="60" y="58" text-anchor="middle" class="donut-text">${pctUsaDeuna}%</text>
            <text x="60" y="72" text-anchor="middle" class="donut-sub">Sí usan</text>
          </svg>
        </div>
        <div class="metric-legend">
          <span class="ml-dot" style="background:#7B3FBD"></span> Sí: ${surveyData.usaDeuna.si}
          <span class="ml-dot" style="background:#333"></span> No: ${surveyData.usaDeuna.no}
        </div>
      </div>

      <!-- Pregunta 2 -->
      <div class="metric-card">
        <h3>¿Conoces los descuentos QR?</h3>
        <div class="donut-wrap">
          <svg viewBox="0 0 120 120" class="donut">
            <circle cx="60" cy="60" r="50" fill="none" stroke="var(--surface2)" stroke-width="12"/>
            <circle cx="60" cy="60" r="50" fill="none" stroke="#e74c3c" stroke-width="12"
              stroke-dasharray="${(pctNoConoceDesc/100)*314.16} ${314.16 - (pctNoConoceDesc/100)*314.16}" 
              stroke-dashoffset="78.54" stroke-linecap="round"/>
            <text x="60" y="58" text-anchor="middle" class="donut-text">${pctNoConoceDesc}%</text>
            <text x="60" y="72" text-anchor="middle" class="donut-sub">No conocen</text>
          </svg>
        </div>
        <div class="metric-legend">
          <span class="ml-dot" style="background:#e74c3c"></span> No: ${surveyData.conoceDescuentos.no}
          <span class="ml-dot" style="background:#2ecc71"></span> Sí: ${surveyData.conoceDescuentos.si}
        </div>
        <p class="metric-insight">⚠️ <strong>${pctNoConoceDesc}% no conoce</strong> los beneficios actuales — oportunidad enorme</p>
      </div>

      <!-- Pregunta 3 -->
      <div class="metric-card metric-wide">
        <h3>¿Qué tan atractivo es vender cupones sin usar? (1-5)</h3>
        <div class="bar-chart">
          ${Object.entries(surveyData.atractivo).map(([k,v]) => {
            const pct = Math.round((v/surveyData.total)*100);
            return `<div class="bar-row">
              <span class="bar-label">${k}★</span>
              <div class="bar-track"><div class="bar-fill" style="width:${pct}%;background:${parseInt(k)>=4?'#7B3FBD':'#555'}"></div></div>
              <span class="bar-val">${v} (${pct}%)</span>
            </div>`;
          }).join('')}
        </div>
        <p class="metric-insight">🟣 <strong>${pctAtractivo45}%</strong> califica con 4-5 estrellas — alta demanda</p>
        <p class="metric-insight">📊 Promedio: <strong>${promedioAtractivo}/5</strong></p>
      </div>

      <!-- Pregunta 4 -->
      <div class="metric-card metric-wide">
        <h3>¿Comercializar cupones te motivaría a usar Deuna más?</h3>
        <div class="bar-chart">
          ${Object.entries(surveyData.motivacion).map(([k,v]) => {
            const pct = Math.round((v/surveyData.total)*100);
            const color = k.includes('definitivamente sí') ? '#1A7A3C' : k.includes('probablemente sí') ? '#2ecc71' : k.includes('Probablemente no') ? '#e74c3c' : '#888';
            return `<div class="bar-row">
              <span class="bar-label">${k}</span>
              <div class="bar-track"><div class="bar-fill" style="width:${pct}%;background:${color}"></div></div>
              <span class="bar-val">${v} (${pct}%)</span>
            </div>`;
          }).join('')}
        </div>
        <p class="metric-insight">🟢 <strong>${pctMotivaSi}% usaría más Deuna</strong> con comercialización de cupones</p>
      </div>
    </div>

    <!-- KEY INSIGHTS -->
    <div class="insights-section">
      <h3>🔑 Insights Clave</h3>
      <div class="insight-grid">
        <div class="insight-card">
          <div class="ins-num">${pctNoConoceDesc}%</div>
          <p>no conoce los descuentos actuales → los cupones necesitan más <strong>visibilidad y distribución</strong></p>
        </div>
        <div class="insight-card">
          <div class="ins-num">${pctAtractivo45}%</div>
          <p>encuentra atractivo vender cupones → la <strong>comercialización entre pares</strong> es viable</p>
        </div>
        <div class="insight-card">
          <div class="ins-num">${pctMotivaSi}%</div>
          <p>usaría Deuna más → convierte <strong>usuarios pasivos en activos</strong> directamente</p>
        </div>
      </div>
    </div>
  </section>

  <!-- SOLUCIÓN -->
  <section class="section" id="solucion">
    <div class="section-header">
      <h2>Nuestra Solución</h2>
      <p>Un ecosistema de cupones que conecta negocios, usuarios y la plataforma</p>
    </div>

    <div class="flow-diagram">
      <div class="flow-step">
        <div class="flow-icon">🏪</div>
        <h4>Negocio crea cupón</h4>
        <p>El comercio define descuento, puntos, vigencia y publica en la plataforma</p>
      </div>
      <div class="flow-arrow">→</div>
      <div class="flow-step">
        <div class="flow-icon">🔥</div>
        <h4>Firebase sync</h4>
        <p>El cupón se guarda en Firestore y se propaga en tiempo real vía RTDB</p>
      </div>
      <div class="flow-arrow">→</div>
      <div class="flow-step">
        <div class="flow-icon">👤</div>
        <h4>Usuario lo ve</h4>
        <p>Aparece en la sección "Adquirir Cupón" basado en gasto acumulado</p>
      </div>
      <div class="flow-arrow">→</div>
      <div class="flow-step">
        <div class="flow-icon">🎟️</div>
        <h4>Adquiere el cupón</h4>
        <p>Si cumple el gasto mínimo, lo adquiere y pasa a "Mis Cupones"</p>
      </div>
      <div class="flow-arrow">→</div>
      <div class="flow-step">
        <div class="flow-icon">💰</div>
        <h4>Comercializa</h4>
        <p>Puede revender el cupón a otro usuario a un precio controlado</p>
      </div>
    </div>

    <div class="value-prop">
      <h3>¿Por qué funciona?</h3>
      <div class="vp-grid">
        <div class="vp-item">
          <strong>Para el Usuario</strong>
          <ul>
            <li>Gana dinero vendiendo cupones que no usa</li>
            <li>Accede a descuentos de comercios por su actividad</li>
            <li>Motivación para usar Deuna con más frecuencia</li>
          </ul>
        </div>
        <div class="vp-item">
          <strong>Para el Negocio</strong>
          <ul>
            <li>Canal de distribución de promociones directo</li>
            <li>Atrae clientes que ya usan Deuna</li>
            <li>Visibilidad automática en la app</li>
          </ul>
        </div>
        <div class="vp-item">
          <strong>Para Deuna</strong>
          <ul>
            <li>Se notará un aumento significativo en el porcentaje de usuarios activos (${pctMotivaSi}% lo confirma)</li>
            <li>Comisión por cada transacción de cupón</li>
            <li>Incrementa volumen de transacciones</li>
          </ul>
        </div>
      </div>
    </div>
  </section>

  <!-- FEATURES -->
  <section class="section" id="features">
    <div class="section-header">
      <h2>Funcionalidades Implementadas</h2>
      <p>Todo lo que construimos para demostrar la solución</p>
    </div>

    <div class="feature-grid">
      <div class="feature-card">
        <div class="fc-icon">🏪</div>
        <h3>Crear Cupón (Negocio)</h3>
        <p>El comercio crea cupones digitales con título, descuento, puntos y vigencia. Se sube a Firebase en tiempo real.</p>
        <span class="fc-tag new">✅ Implementado</span>
      </div>
      <div class="feature-card">
        <div class="fc-icon">🔥</div>
        <h3>Sync Tiempo Real</h3>
        <p>Firestore + Realtime Database. Cuando el negocio crea un cupón, el usuario lo ve instantáneamente.</p>
        <span class="fc-tag new">✅ Implementado</span>
      </div>
      <div class="feature-card">
        <div class="fc-icon">🎟️</div>
        <h3>Adquirir Cupón</h3>
        <p>Validación de gasto acumulado. Barra de progreso. Bloqueo si no cumple el mínimo. Vista de detalle completa.</p>
        <span class="fc-tag new">✅ Implementado</span>
      </div>
      <div class="feature-card">
        <div class="fc-icon">🏷️</div>
        <h3>Comercializar Cupón</h3>
        <p>Reventa P2P de cupones. Formulario con slider de precio, precio máximo controlado, publicación en la comunidad.</p>
        <span class="fc-tag new">✅ Implementado</span>
      </div>
      <div class="feature-card">
        <div class="fc-icon">🔄</div>
        <h3>5 Estados de Cupón</h3>
        <p>Nuevo → Activo → Publicado → Revendido / Caducado. Cada estado con badge visual y lógica diferente.</p>
        <span class="fc-tag new">✅ Implementado</span>
      </div>
      <div class="feature-card">
        <div class="fc-icon">⏰</div>
        <h3>Caducidad Automática</h3>
        <p>Los cupones se bloquean automáticamente al pasar su fecha de vigencia. Incentiva uso rápido.</p>
        <span class="fc-tag new">✅ Implementado</span>
      </div>
      <div class="feature-card">
        <div class="fc-icon">📊</div>
        <h3>Progreso de Gasto</h3>
        <p>Gamificación: barra de progreso que muestra cuánto falta para desbloquear cada cupón.</p>
        <span class="fc-tag new">✅ Implementado</span>
      </div>
      <div class="feature-card">
        <div class="fc-icon">📋</div>
        <h3>Historial de Confirmaciones</h3>
        <p>El negocio ve qué cupones fueron adquiridos y cuáles están pendientes. Control total.</p>
        <span class="fc-tag new">✅ Implementado</span>
      </div>
      <div class="feature-card">
        <div class="fc-icon">🔔</div>
        <h3>Notificaciones en Vivo</h3>
        <p>El negocio recibe alertas cuando un usuario adquiere un cupón. El usuario recibe cuando hay cupones nuevos.</p>
        <span class="fc-tag new">✅ Implementado</span>
      </div>
    </div>
  </section>

  <!-- SIMULADOR -->
  <section class="section section-wide" id="apps">
    <div class="section-header">
      <h2>Simulador Interactivo</h2>
      <p>Prueba el flujo completo: Negocio crea cupón → Usuario lo adquiere → Comercializa</p>
    </div>
    <div class="simulador-embed">
      <iframe src="/simulador/index.html" title="Deuna Simulador" class="simulador-iframe"></iframe>
    </div>
  </section>

  <!-- FOOTER -->
  <footer class="footer">
    <div class="footer-logo">
      <img src="/logo.png" alt="Deuna"/>
      <span>d! deuna</span>
    </div>
    <p>DevIAthon 2026 • Reto Deuna — Comercialización de Cupones</p>
  </footer>
`;

// Smooth scroll
document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById(link.getAttribute('href').slice(1))?.scrollIntoView({ behavior: 'smooth' });
  });
});

// Animate on scroll
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.feature-card, .rm-item, .problema-card, .metric-card, .flow-step, .insight-card, .vp-item').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = 'opacity .5s, transform .5s';
  observer.observe(el);
});
