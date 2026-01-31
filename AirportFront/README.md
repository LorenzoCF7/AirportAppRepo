# ✈️ Airport App - Frontend

Aplicación web moderna para seguimiento de vuelos en tiempo real, compra de billetes y gestión de reservas. Desarrollada con React 19 y Vite.

## 🌟 Características Principales

- **🗺️ Mapa en tiempo real** - Visualiza aviones moviéndose en un mapa interactivo
- **🔍 Búsqueda de vuelos** - Encuentra información de cualquier vuelo por número o aeropuerto
- **🛒 Tienda de billetes** - Compra billetes de avión con precios simulados
- **👛 Wallet de billetes** - Gestiona tus billetes comprados
- **📊 Dashboard** - Vista general de vuelos activos, programados y aterrizados
- **🎨 UI moderna** - Animaciones fluidas y diseño responsive

---

## 🛠️ Stack Tecnológico

| Tecnología | Versión | Uso |
|------------|---------|-----|
| React | 19 | Framework UI |
| Vite | 6.x | Build tool y dev server |
| Axios | - | Cliente HTTP |
| Leaflet | - | Mapas interactivos |
| GSAP | - | Animaciones avanzadas |
| Lucide React | - | Iconos SVG |
| CSS Modules | - | Estilos con scope |

---

## 📁 Estructura del Proyecto

```
src/
│
├── 🎨 components/              # Componentes React
│   ├── DashboardView/          # Vista principal con resumen de vuelos
│   ├── SearchView/             # Búsqueda de vuelos
│   ├── RealTimeMap/            # Mapa con aviones en tiempo real
│   ├── FlightShop/             # Tienda para comprar billetes
│   ├── WalletView/             # Mis billetes comprados
│   ├── FlightCard/             # Tarjeta de información de vuelo
│   ├── FlightDetails/          # Detalles expandidos de un vuelo
│   ├── FlipCard/               # Tarjeta con animación flip
│   ├── SidebarAnimated/        # Barra lateral de navegación
│   ├── FlightSearch/           # Componente de búsqueda
│   ├── PurchaseTicketForm/     # Formulario de compra
│   ├── TicketsModal/           # Modal de billetes
│   ├── SeatSelector/           # Selector de asientos
│   └── ...
│
├── 🔧 services/                # Servicios de conexión
│   ├── flightService.js        # API de vuelos (backend)
│   ├── ticketService.js        # API de billetes (backend)
│   ├── commercialFlightService.js  # Ofertas de vuelos
│   └── flightSimulator.js      # Simulador de movimiento de aviones
│
├── 🪝 hooks/                   # Custom hooks
│   ├── useFlightProgress.js    # Progreso de vuelo
│   ├── useFlightAnimation.js   # Animación de aviones
│   ├── useScrollLock.js        # Bloqueo de scroll
│   └── usePurchaseForm.js      # Lógica de compra
│
├── 📊 constants/               # Constantes y datos
│   ├── airports.js             # Coordenadas de aeropuertos
│   ├── flightStatus.js         # Estados de vuelos
│   └── ui.js                   # Constantes de UI
│
├── 🛠️ utils/                   # Utilidades
│   ├── formatters.js           # Formateo de fechas/números
│   ├── flightStatus.jsx        # Helpers de estado
│   └── strings.js              # Manipulación de strings
│
├── 🎨 styles/                  # Estilos globales
│   └── variables.css           # Variables CSS
│
├── App.jsx                     # Componente principal
├── App.css                     # Estilos de App
├── main.jsx                    # Entry point
└── index.css                   # Estilos globales
```

---

## 🚀 Guía de Instalación Rápida

### Requisitos Previos

- 📦 **Node.js 18** o superior ([Descargar](https://nodejs.org/))
- 🔧 **npm** (incluido con Node.js) o **yarn**
- ⚡ **Backend corriendo** en `http://localhost:8080`

### Paso 1: Instalar Dependencias

```bash
# Desde la carpeta AirportFront/
npm install
```

### Paso 2: Configurar Variables de Entorno (Opcional)

Crea un archivo `.env` en la raíz del proyecto:

```env
# URL del Backend API (opcional, por defecto usa localhost:8080)
VITE_API_URL=http://localhost:8080/api
```

### Paso 3: Ejecutar en Desarrollo

```bash
npm run dev
```

✅ **La aplicación estará disponible en:** `http://localhost:5173`

---

## 🔧 Scripts Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Inicia servidor de desarrollo con hot reload |
| `npm run build` | Compila para producción (output en `dist/`) |
| `npm run preview` | Previsualiza build de producción localmente |
| `npm run lint` | Ejecuta ESLint para análisis de código |

---

## 📱 Vistas de la Aplicación

### 1. 📊 Dashboard
Vista principal con resumen de todos los vuelos:
- Vuelos en el aire (activos)
- Vuelos aterrizados
- Vuelos programados
- Tarjetas flip interactivas con detalles

### 2. 🔍 Búsqueda
Busca vuelos por:
- **Número de vuelo** (ej: IB1077, BA256)
- **Código de aeropuerto** (ej: MAD, BCN, LHR)

Incluye autocompletado con sugerencias en tiempo real.

### 3. 🗺️ Mapa en Tiempo Real
Mapa interactivo con:
- Aviones moviéndose en tiempo real
- Click en avión para ver detalles
- Panel lateral con lista de vuelos activos
- Seguimiento automático de un vuelo seleccionado

### 4. 🛒 Tienda de Billetes
Compra billetes de avión:
- Búsqueda por origen/destino/fecha
- Precios simulados (Economy, Business, First Class)
- Selector de asientos interactivo
- Formulario de compra con validación

### 5. 👛 Wallet
Gestiona tus billetes comprados:
- Lista de billetes activos
- Detalles de cada billete
- Opción de cancelar billetes

---

## 🔄 Cómo Funciona el Sistema

### Flujo de Datos

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐        │
│   │  Dashboard  │    │   Search    │    │    Map      │        │
│   └──────┬──────┘    └──────┬──────┘    └──────┬──────┘        │
│          │                  │                  │                │
│          └──────────────────┼──────────────────┘                │
│                             │                                   │
│                    ┌────────▼────────┐                          │
│                    │  flightService  │                          │
│                    └────────┬────────┘                          │
│                             │                                   │
└─────────────────────────────┼───────────────────────────────────┘
                              │ HTTP (Axios)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     BACKEND (Spring Boot)                       │
│                    http://localhost:8080/api                    │
└─────────────────────────────────────────────────────────────────┘
```

### Simulador de Vuelos

El frontend incluye un **simulador de vuelos** (`flightSimulator.js`) que:

1. **Recibe vuelos del backend** con coordenadas iniciales
2. **Calcula posiciones en tiempo real** basándose en:
   - Hora de salida programada
   - Hora de llegada estimada
   - Progreso actual del vuelo
3. **Actualiza el mapa cada 2 segundos** con nuevas posiciones
4. **Maneja transiciones de estado**:
   - `scheduled` → `active` (cuando despega)
   - `active` → `landed` (cuando aterriza)

```javascript
// El simulador interpola la posición del avión
currentLat = originLat + (destLat - originLat) * progress;
currentLng = originLng + (destLng - originLng) * progress;
```

---

## 🌐 Conexión con el Backend

### Servicios Disponibles

#### flightService.js
```javascript
// Obtener todos los vuelos
flightService.getAllFlights()

// Buscar vuelo por número
flightService.searchFlight('IB1077')

// Buscar por aeropuerto
flightService.getFlightsByAirport('MAD')

// Obtener vuelos activos (para el mapa)
flightService.getActiveFlights()
```

#### ticketService.js
```javascript
// Comprar billete
ticketService.purchaseTicket(ticketData)

// Obtener mis billetes
ticketService.getUserTickets('user-123')

// Cancelar billete
ticketService.cancelTicket(ticketId)
```

#### commercialFlightService.js
```javascript
// Buscar ofertas de vuelos
commercialFlightService.searchFlights({
  origin: 'MAD',
  destination: 'BCN',
  departureDate: '2026-02-15'
})

// Obtener vuelos destacados
commercialFlightService.getFeaturedFlights()
```

---

## 🎨 Personalización de Estilos

### Variables CSS Globales

Edita `src/styles/variables.css`:

```css
:root {
  /* Colores principales */
  --primary-color: #667eea;
  --secondary-color: #764ba2;
  
  /* Estados de vuelo */
  --status-active: #10b981;
  --status-landed: #6366f1;
  --status-scheduled: #f59e0b;
  
  /* Fondos */
  --bg-dark: #0f172a;
  --bg-card: #1e293b;
}
```

### CSS Modules

Cada componente tiene su propio archivo de estilos con scope local:

```
FlightCard/
├── FlightCard.jsx
└── FlightCard.module.css
```

---

## 🐛 Solución de Problemas

### ❌ Error: "Network Error" o "CORS"
**Causa:** El backend no está corriendo o hay problemas de CORS.

**Solución:**
1. Asegúrate de que el backend está corriendo en `http://localhost:8080`
2. Verifica en la consola del backend que no hay errores
3. El backend debe tener CORS configurado para `http://localhost:5173`

### ❌ El mapa no muestra aviones
**Causa:** No hay vuelos activos o el simulador no se inicializó.

**Solución:**
1. Abre la consola del navegador (F12)
2. Busca mensajes como `✈️ Vuelos activos para el mapa: X`
3. Si dice 0 vuelos, fuerza refresh en el backend: `GET /api/flights?forceRefresh=true`

### ❌ Error: "Cannot read property of undefined"
**Causa:** Datos de vuelo incompletos.

**Solución:**
1. Verifica que el backend devuelve datos correctos
2. Limpia el cache del navegador (Ctrl+Shift+R)

### ❌ Las animaciones van lentas
**Solución:**
1. Desactiva extensiones del navegador
2. Cierra otras pestañas pesadas
3. Usa Chrome o Edge (mejor rendimiento con CSS transforms)

---

## 📊 Estructura de Datos

### Vuelo (Flight)

```javascript
{
  flight_status: "active",           // "scheduled" | "active" | "landed"
  flightNumber: "IB1077",
  flight: {
    iata: "IB1077",
    number: "1077"
  },
  airline: {
    name: "Iberia",
    iata: "IB"
  },
  departure: {
    airport: "Madrid-Barajas",
    iata: "MAD",
    city: "Madrid",
    scheduled: "2026-01-31T10:30:00"
  },
  arrival: {
    airport: "Barcelona-El Prat",
    iata: "BCN",
    city: "Barcelona",
    scheduled: "2026-01-31T11:45:00"
  },
  live: {                            // Solo en vuelos activos
    latitude: 40.234,
    longitude: -1.456,
    altitude: 35000,
    speed: 520,
    direction: 85.5
  }
}
```

### Billete (Ticket)

```javascript
{
  id: 1,
  bookingReference: "A1B2C3",
  ticketStatus: "CONFIRMED",
  flightNumber: "IB1077",
  passengerName: "Juan García",
  passengerDocument: "12345678A",
  seatNumber: "14A",
  ticketClass: "ECONOMY",
  price: 89.99,
  currency: "EUR",
  departureIATA: "MAD",
  arrivalIATA: "BCN",
  departureDate: "2026-02-15"
}
```

---

## 🔮 Próximas Funcionalidades

- [ ] Autenticación de usuarios
- [ ] Notificaciones push de cambios de vuelo
- [ ] Modo offline con Service Workers
- [ ] Exportar billete a PDF
- [ ] Integración con calendarios

---

## 📝 Licencia

MIT License - Proyecto educativo

---

## 👥 Equipo

Desarrollado por **Galácticos** 🚀

---

## 🚀 Arranque Rápido (TL;DR)

```bash
# 1. Backend (en otra terminal)
cd AirportApp
.\mvnw.cmd spring-boot:run   # Windows
./mvnw spring-boot:run       # Linux/Mac

# 2. Frontend
cd AirportFront
npm install
npm run dev

# 3. Abrir navegador
# http://localhost:5173
```

