# 🏆 Reto Deuna — DevIAthon 2026

## Comercialización de Cupones: Monetización Sostenible

### 📋 Problemática
- Solo el **48%** de los usuarios activos de Deuna generan ingresos directos
- Más de la mitad de la base de usuarios es **pasiva**
- No existen suficientes mecanismos que incentiven la frecuencia de uso

### 💡 Nuestra Solución
Un ecosistema de **comercialización de cupones** que conecta negocios, usuarios y la plataforma:

```
Negocio crea cupón → Firebase sync → Usuario lo ve → Adquiere → Comercializa
```

### 📊 Validación (113 encuestados)
- **74%** califica como atractivo (4-5★) vender cupones sin usar
- **80%** usaría Deuna más con esta funcionalidad
- **69%** no conoce los beneficios actuales → oportunidad enorme

### 🛠️ Estructura del Proyecto

```
├── AndroidAppDeunaUsers/        # App Deuna Usuarios (HTML/CSS/JS + Firebase)
│   └── Assets/
│       ├── index.html
│       ├── style.css
│       └── app.js
├── AndroidAppDeunaNegocios/     # App Deuna Negocios (HTML/CSS/JS + Firebase)
│   └── Assets/
│       ├── index.html
│       ├── style.css
│       └── app.js
├── DeunaWebDemo/                # Presentación Web (Vite)
│   ├── src/
│   │   ├── main.js
│   │   └── style.css
│   └── public/
│       ├── usuarios/
│       ├── negocios/
│       └── simulador/
├── index.html                   # Simulador dual (doble clic)
├── style.css                    # CSS del simulador
├── app.js                       # JS del simulador
└── Formulario DeUna Clientes*   # Datos de encuesta (113 respuestas)
```

### 🚀 Cómo correr

**Simulador (sin servidor):**
```bash
# Abrir directamente en el navegador
open index.html
```

**Presentación Web (Vite):**
```bash
cd DeunaWebDemo
npm install
npm run dev
# Abrir http://localhost:5173/
```

### 🔥 Funcionalidades Implementadas
- ✅ Crear Cupón (Negocio → Firebase)
- ✅ Sync en Tiempo Real (Firestore + RTDB)
- ✅ Adquirir Cupón (validación de gasto acumulado)
- ✅ Comercializar Cupón (reventa P2P)
- ✅ 5 Estados de Cupón (Nuevo/Activo/Publicado/Revendido/Caducado)
- ✅ Caducidad Automática
- ✅ Progreso de Gasto (gamificación)
- ✅ Historial de Confirmaciones
- ✅ Notificaciones en Vivo
- ✅ Métricas visuales de encuesta

### 🔗 Tecnologías
- HTML5 / CSS3 / JavaScript ES6+
- Firebase Firestore + Realtime Database
- Vite (presentación web)
- Google Fonts (Inter)

---
**DevIAthon 2026 — Equipo Reto Deuna**
