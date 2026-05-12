# 📋 Documentación TFG - AirportApp

## Índice

1. [Casos de Uso](#1-casos-de-uso)
2. [Diagrama de Gantt](#2-diagrama-de-gantt)
3. [Tecnologías y Plataformas](#3-tecnologías-y-plataformas)
4. [Requisitos Funcionales y No Funcionales](#4-requisitos-funcionales-y-no-funcionales)
5. [Esquema Entidad-Relación y Normalización](#5-esquema-entidad-relación-y-normalización)
6. [Análisis DAFO](#6-análisis-dafo)
7. [Apéndice: API Endpoints](#7-apéndice-api-endpoints-completa)

---

## 1. Casos de Uso

### 1.1 Diagrama General de Casos de Uso

```
┌─────────────────────────────────────────────────────────────────────┐
│                          AIRPORT APP                                │
│                                                                     │
│   ┌──────────────────┐     ┌──────────────────────────────────┐    │
│   │  CU-01: Registrar│     │ CU-06: Ver Dashboard             │    │
│   │  cuenta           │     │ (estadísticas de vuelos)         │    │
│   └────────┬─────────┘     └──────────────────────────────────┘    │
│            │                                                        │
│   ┌────────▼─────────┐     ┌──────────────────────────────────┐    │
│   │ CU-02: Iniciar   │     │ CU-07: Ver mapa en tiempo real   │    │
│   │ sesión            │     │ (buscar y seguir aviones)        │    │
│   └────────┬─────────┘     └──────────────────────────────────┘    │
│            │                                                        │
│   ┌────────▼─────────┐     ┌──────────────────────────────────┐    │
│   │ CU-03: Cerrar    │     │ CU-08: Buscar vuelos             │    │
│   │ sesión            │     │ (origen, destino, fecha, clase)  │    │
│   └──────────────────┘     └──────────────────────────────────┘    │
│                                                                     │
│   ┌──────────────────┐     ┌──────────────────────────────────┐    │
│   │ CU-04: Comprar   │     │ CU-09: Seleccionar asiento       │    │
│   │ billete «auth»   │     │ y clase  «auth»                  │    │
│   └──────────────────┘     └──────────────────────────────────┘    │
│                                                                     │
│   ┌──────────────────┐     ┌──────────────────────────────────┐    │
│   │ CU-05: Gestionar │     │ CU-10: Cancelar billete          │    │
│   │ wallet «auth»    │     │ «auth»                           │    │
│   └──────────────────┘     └──────────────────────────────────┘    │
│                                                                     │
│   ┌──────────────────┐     ┌──────────────────────────────────┐    │
│   │ CU-11: Buscar    │     │ CU-12: Ver detalles de vuelo     │    │
│   │ ofertas de vuelos│     │                                   │    │
│   └──────────────────┘     └──────────────────────────────────┘    │
│                                                                     │
│   ┌──────────────────┐     ┌──────────────────────────────────┐    │
│   │ CU-13: Pagar con │     │ CU-14: Escanear/validar QR       │    │
│   │ Stripe o demo    │     │ del billete                       │    │
│   └──────────────────┘     └──────────────────────────────────┘    │
│                                                                     │
│   ┌──────────────────┐                                             │
│   │ CU-15: Consultar │                                             │
│   │ AirBot (IA)      │                                             │
│   └──────────────────┘                                             │
└─────────────────────────────────────────────────────────────────────┘

Actores:
  👤 Usuario no autenticado → CU-01, CU-02, CU-06, CU-07, CU-08, CU-11, CU-12, CU-14, CU-15
  🔑 Usuario autenticado   → Todos los casos de uso
```

### 1.2 Descripción Detallada de Casos de Uso

---

#### CU-01: Registrar cuenta

| Campo    | Descripción |
|----------|-------------|
| **ID**   | CU-01 |
| **Actor** | Usuario no autenticado |
| **Descripción** | El usuario crea una nueva cuenta proporcionando nombre de usuario, email y contraseña |
| **Precondiciones** | El usuario no tiene una cuenta previa con el mismo email/username |
| **Flujo principal** | 1. El usuario hace clic en "Iniciar Sesión" en el Header<br>2. Se muestra el modal de autenticación<br>3. El usuario selecciona "Regístrate"<br>4. Introduce username, email y contraseña<br>5. El sistema valida los datos<br>6. El sistema crea la cuenta y genera un token JWT<br>7. El usuario queda autenticado automáticamente |
| **Flujo alternativo** | 5a. Si el email ya existe → Se muestra error "El email ya está registrado"<br>5b. Si el username ya existe → Se muestra error "El usuario ya existe"<br>5c. Si la contraseña es menor de 6 caracteres → Se muestra error de validación |
| **Postcondiciones** | El usuario queda registrado y autenticado con sesión activa |

---

#### CU-02: Iniciar sesión

| Campo    | Descripción |
|----------|-------------|
| **ID**   | CU-02 |
| **Actor** | Usuario no autenticado |
| **Descripción** | El usuario inicia sesión con email y contraseña |
| **Precondiciones** | El usuario tiene una cuenta registrada |
| **Flujo principal** | 1. El usuario hace clic en "Iniciar Sesión" en el Header<br>2. Se muestra el modal de autenticación<br>3. Introduce email y contraseña<br>4. El sistema valida las credenciales<br>5. El sistema genera un token JWT<br>6. Se almacena la sesión en localStorage |
| **Flujo alternativo** | 4a. Email no encontrado → "Usuario no encontrado"<br>4b. Contraseña incorrecta → "Contraseña incorrecta" |
| **Postcondiciones** | El usuario queda autenticado; se muestra su nombre en el Header |

---

#### CU-03: Cerrar sesión

| Campo    | Descripción |
|----------|-------------|
| **ID**   | CU-03 |
| **Actor** | Usuario autenticado |
| **Descripción** | El usuario cierra su sesión activa |
| **Precondiciones** | El usuario está autenticado |
| **Flujo principal** | 1. El usuario hace clic en su nombre en el Header<br>2. Selecciona "Cerrar Sesión"<br>3. Se elimina el token del localStorage<br>4. Se redirige al Dashboard |
| **Postcondiciones** | El usuario queda desautenticado; el Header muestra "Iniciar Sesión" |

---

#### CU-04: Comprar billete

| Campo    | Descripción |
|----------|-------------|
| **ID**   | CU-04 |
| **Actor** | Usuario autenticado |
| **Descripción** | El usuario compra un billete de avión seleccionando vuelo, clase y asiento |
| **Precondiciones** | El usuario está autenticado; existen vuelos disponibles |
| **Flujo principal** | 1. El usuario accede a "Comprar Billetes" desde el sidebar<br>2. Se muestran vuelos disponibles con autocompletado de origen/destino<br>3. El usuario filtra por fecha (ida / ida y vuelta), clase y número de pasajeros<br>4. Selecciona un vuelo de los resultados<br>5. Elige clase (Economy, Business, First)<br>6. Selecciona asiento disponible en el mapa de asientos<br>7. Introduce datos del pasajero (nombre, documento)<br>8. Completa el pago con Stripe o en modo demo<br>9. El sistema genera un código de reserva único (6 caracteres)<br>10. El billete se almacena en base de datos con código QR |
| **Flujo alternativo** | 1a. Si no está autenticado → Se abre el modal de login<br>3a. No hay vuelos disponibles → Se muestra mensaje informativo<br>8a. Si no hay clave Stripe configurada → Se activa modo demo automáticamente |
| **Postcondiciones** | El billete queda registrado con estado CONFIRMED y QR escaneable |

---

#### CU-05: Gestionar wallet (billetes comprados)

| Campo    | Descripción |
|----------|-------------|
| **ID**   | CU-05 |
| **Actor** | Usuario autenticado |
| **Descripción** | El usuario consulta y gestiona sus billetes comprados |
| **Precondiciones** | El usuario está autenticado |
| **Flujo principal** | 1. El usuario accede a "Wallet" desde el sidebar<br>2. Se muestran todos sus billetes<br>3. Puede ver detalles de cada billete incluyendo el QR<br>4. Puede cancelar billetes |
| **Postcondiciones** | El usuario visualiza el estado actual de sus billetes |

---

#### CU-06: Ver Dashboard

| Campo    | Descripción |
|----------|-------------|
| **ID**   | CU-06 |
| **Actor** | Usuario (autenticado o no) |
| **Descripción** | El usuario visualiza el panel principal con ofertas de vuelo y destinos populares |
| **Precondiciones** | Ninguna |
| **Flujo principal** | 1. El usuario accede a la aplicación<br>2. Se muestra el hero con buscador integrado<br>3. Se muestran estadísticas (vuelos activos, programados, aterrizados)<br>4. Se muestran ofertas de vuelo con imágenes y precios<br>5. Se muestran destinos populares con fotos |
| **Postcondiciones** | Se muestra el panel principal con información actualizada |

---

#### CU-07: Ver mapa en tiempo real

| Campo    | Descripción |
|----------|-------------|
| **ID**   | CU-07 |
| **Actor** | Usuario (autenticado o no) |
| **Descripción** | El usuario busca y sigue la posición de aviones en un mapa interactivo |
| **Precondiciones** | Ninguna |
| **Flujo principal** | 1. El usuario selecciona "Mapa" desde el Header<br>2. Se carga el mapa satelital (MapTiler)<br>3. El usuario introduce un número o prefijo de vuelo (ej: IB, LH1088)<br>4. El sistema busca en AviationStack o en datos mock<br>5. Se muestran los aviones con iconos animados y ruta origen→posición→destino<br>6. Las posiciones se actualizan cada 2 segundos<br>7. El usuario puede clicar un avión para ver datos (altitud, velocidad, dirección)<br>8. Puede activar seguimiento automático del avión |
| **Flujo alternativo** | 4a. Límite de API alcanzado → Se usan datos mock con vuelos simulados<br>4b. Vuelo no encontrado → Mensaje "Vuelo no encontrado" |
| **Postcondiciones** | El mapa muestra los aviones moviéndose en tiempo real con su ruta |

---

#### CU-08: Buscar vuelos

| Campo    | Descripción |
|----------|-------------|
| **ID**   | CU-08 |
| **Actor** | Usuario (autenticado o no) |
| **Descripción** | El usuario busca vuelos por origen, destino, fecha y clase |
| **Precondiciones** | Ninguna |
| **Flujo principal** | 1. El usuario accede a la tienda de billetes<br>2. Usa el autocompletado de aeropuertos para origen y destino<br>3. Selecciona fecha(s) con el calendario desplegable<br>4. Elige tipo de viaje (solo ida / ida y vuelta)<br>5. El sistema filtra los vuelos del backend<br>6. Se muestran los resultados con aerolínea, horarios, duración y precio |
| **Flujo alternativo** | 6a. Sin resultados → Mensaje informativo |
| **Postcondiciones** | Se presenta la lista de vuelos disponibles para esa ruta y fecha |

---

#### CU-09: Seleccionar asiento y clase

| Campo    | Descripción |
|----------|-------------|
| **ID**   | CU-09 |
| **Actor** | Usuario autenticado |
| **Descripción** | El usuario selecciona la clase del billete y un asiento específico |
| **Precondiciones** | El usuario ha seleccionado un vuelo para comprar |
| **Flujo principal** | 1. Se muestra el selector de clase (Economy, Business, First)<br>2. El precio se actualiza según la clase seleccionada<br>3. Se muestra el mapa de asientos del avión<br>4. El usuario selecciona un asiento disponible (verde)<br>5. Se confirma la selección |
| **Postcondiciones** | La clase y el asiento quedan asociados al billete |

---

#### CU-10: Cancelar billete

| Campo    | Descripción |
|----------|-------------|
| **ID**   | CU-10 |
| **Actor** | Usuario autenticado |
| **Descripción** | El usuario cancela un billete previamente comprado |
| **Precondiciones** | El billete existe y está en estado CONFIRMED |
| **Flujo principal** | 1. El usuario accede a su Wallet<br>2. Selecciona el billete a cancelar<br>3. Confirma la cancelación<br>4. El sistema actualiza el estado a CANCELLED |
| **Postcondiciones** | El billete queda en estado CANCELLED |

---

#### CU-11: Buscar ofertas de vuelos

| Campo    | Descripción |
|----------|-------------|
| **ID**   | CU-11 |
| **Actor** | Usuario (autenticado o no) |
| **Descripción** | El usuario busca ofertas de vuelos comerciales por origen, destino y fecha |
| **Precondiciones** | Ninguna |
| **Flujo principal** | 1. El usuario accede a la tienda de billetes<br>2. Introduce aeropuerto de origen, destino y fecha<br>3. El sistema consulta la API de Amadeus (o datos mock)<br>4. Se muestran las ofertas disponibles con precios |
| **Postcondiciones** | Se presenta la lista de ofertas de vuelos |

---

#### CU-12: Ver detalles de vuelo

| Campo    | Descripción |
|----------|-------------|
| **ID**   | CU-12 |
| **Actor** | Usuario (autenticado o no) |
| **Descripción** | El usuario consulta la información detallada de un vuelo específico |
| **Precondiciones** | El vuelo existe en el sistema |
| **Flujo principal** | 1. El usuario hace clic en un vuelo desde cualquier vista<br>2. Se muestra información completa: aerolínea, origen, destino, horarios, estado, progreso |
| **Postcondiciones** | Se muestra la ficha completa del vuelo |

---

#### CU-13: Pagar con Stripe o modo demo

| Campo    | Descripción |
|----------|-------------|
| **ID**   | CU-13 |
| **Actor** | Usuario autenticado |
| **Descripción** | El usuario completa el pago del billete mediante Stripe o modo demo si no hay clave configurada |
| **Precondiciones** | El usuario ha seleccionado vuelo, asiento y clase; ha introducido datos del pasajero |
| **Flujo principal** | 1. Se detecta automáticamente si hay clave Stripe configurada<br>2a. **Con Stripe**: Se carga el formulario de tarjeta de Stripe Elements; el usuario introduce sus datos y confirma el pago; Stripe procesa el cobro<br>2b. **Sin Stripe (demo)**: Se muestran campos de tarjeta simulados; cualquier dato es válido; el sistema simula el pago exitoso<br>3. Se confirma la transacción y se genera el billete |
| **Flujo alternativo** | 2a-error. Tarjeta rechazada → Mensaje de error de Stripe |
| **Postcondiciones** | El billete queda confirmado y se añade a la Wallet del usuario |

---

#### CU-14: Escanear y validar QR del billete

| Campo    | Descripción |
|----------|-------------|
| **ID**   | CU-14 |
| **Actor** | Cualquier usuario / personal de control |
| **Descripción** | El QR del billete puede escanearse con cualquier lector para validar su autenticidad |
| **Precondiciones** | El billete ha sido comprado y tiene estado CONFIRMED |
| **Flujo principal** | 1. El usuario abre su billete desde la Wallet<br>2. Se muestra el boarding pass con un QR real (generado con qrcode.react)<br>3. El personal o el usuario escanea el QR con la cámara del móvil<br>4. En entorno local: el QR codifica texto con los datos del vuelo y pasajero<br>5. En producción: el QR abre la URL `/validate.html?ref=...` con los parámetros del vuelo<br>6. La página de validación muestra el sello "VÁLIDO" en verde o "INVÁLIDO" si el billete está cancelado |
| **Postcondiciones** | Se muestra la información del billete con su estado de validez |

---

#### CU-15: Consultar AirBot (IA)

| Campo    | Descripción |
|----------|-------------|
| **ID**   | CU-15 |
| **Actor** | Usuario (autenticado o no) |
| **Descripción** | El usuario consulta al asistente IA para recomendaciones de vuelos y ayuda con la app |
| **Precondiciones** | Ninguna |
| **Flujo principal** | 1. El usuario hace clic en el botón "AirBot" flotante<br>2. Se abre el panel del chatbot<br>3. El usuario escribe su consulta (destinos, precios, fechas, etc.)<br>4. El sistema consulta Claude (Anthropic) o LLaMA3 (Groq) según disponibilidad<br>5. Se muestra la respuesta con recomendaciones personalizadas<br>6. El bot puede sugerir navegar directamente a la tienda con parámetros prefijados |
| **Flujo alternativo** | 4a. Sin API key IA configurada → Respuestas predefinidas de fallback |
| **Postcondiciones** | El usuario recibe orientación sobre vuelos y funcionalidades de la app |

---

## 2. Diagrama de Gantt

### 2.1 Planificación del Proyecto

```
PROYECTO AIRPORTAPP - DIAGRAMA DE GANTT
═══════════════════════════════════════════════════════════════════════════════

Fase                              │ Sem1 │ Sem2 │ Sem3 │ Sem4 │ Sem5 │ Sem6 │ Sem7 │ Sem8 │ Sem9 │S10 │S11 │S12 │
──────────────────────────────────┼──────┼──────┼──────┼──────┼──────┼──────┼──────┼──────┼──────┼────┼────┼────┤
                                  │      │      │      │      │      │      │      │      │      │    │    │    │
📋 FASE 1: ANÁLISIS Y DISEÑO     │██████│██████│      │      │      │      │      │      │      │    │    │    │
  Análisis de requisitos          │██████│      │      │      │      │      │      │      │      │    │    │    │
  Diseño de BBDD (E-R)            │██████│      │      │      │      │      │      │      │      │    │    │    │
  Diseño de la arquitectura       │      │██████│      │      │      │      │      │      │      │    │    │    │
  Casos de uso                    │      │██████│      │      │      │      │      │      │      │    │    │    │
  Mockups/Wireframes UI           │      │██████│      │      │      │      │      │      │      │    │    │    │
                                  │      │      │      │      │      │      │      │      │      │    │    │    │
🔧 FASE 2: BACKEND               │      │      │██████│██████│██████│      │      │      │      │    │    │    │
  Configuración Spring Boot       │      │      │██████│      │      │      │      │      │      │    │    │    │
  Modelo de datos (JPA)           │      │      │██████│      │      │      │      │      │      │    │    │    │
  API REST de Vuelos              │      │      │      │██████│      │      │      │      │      │    │    │    │
  API REST de Tickets             │      │      │      │██████│      │      │      │      │      │    │    │    │
  Autenticación (JWT)             │      │      │      │      │██████│      │      │      │      │    │    │    │
  Integración APIs externas       │      │      │      │      │██████│      │      │      │      │    │    │    │
  Integración Stripe              │      │      │      │      │██████│      │      │      │      │    │    │    │
                                  │      │      │      │      │      │      │      │      │      │    │    │    │
🎨 FASE 3: FRONTEND (React)      │      │      │      │      │██████│██████│██████│██████│      │    │    │    │
  Estructura y componentes base   │      │      │      │      │██████│      │      │      │      │    │    │    │
  Dashboard y estadísticas        │      │      │      │      │      │██████│      │      │      │    │    │    │
  Mapa en tiempo real (Leaflet)   │      │      │      │      │      │██████│      │      │      │    │    │    │
  Búsqueda con autocompletado     │      │      │      │      │      │      │██████│      │      │    │    │    │
  Tienda + Selector asientos      │      │      │      │      │      │      │██████│      │      │    │    │    │
  Wallet y gestión de billetes    │      │      │      │      │      │      │██████│      │      │    │    │    │
  Pago Stripe + modo demo         │      │      │      │      │      │      │██████│      │      │    │    │    │
  QR codes en billetes            │      │      │      │      │      │      │      │██████│      │    │    │    │
  Footer + AirBot IA              │      │      │      │      │      │      │      │██████│      │    │    │    │
                                  │      │      │      │      │      │      │      │      │      │    │    │    │
📱 FASE 4: FLUTTER (Móvil)       │      │      │      │      │      │      │      │      │██████│████│    │    │
  Setup proyecto Flutter          │      │      │      │      │      │      │      │      │██████│    │    │    │
  Pantallas principales           │      │      │      │      │      │      │      │      │██████│████│    │    │
  Integración con API backend     │      │      │      │      │      │      │      │      │      │████│    │    │
  Build Android (APK/AAB)         │      │      │      │      │      │      │      │      │      │████│    │    │
                                  │      │      │      │      │      │      │      │      │      │    │    │    │
🧪 FASE 5: TESTING Y DEPLOY      │      │      │      │      │      │      │      │      │      │    │████│    │
  Pruebas unitarias               │      │      │      │      │      │      │      │      │      │    │████│    │
  Pruebas de integración          │      │      │      │      │      │      │      │      │      │    │████│    │
  Corrección de bugs              │      │      │      │      │      │      │      │      │      │    │████│    │
                                  │      │      │      │      │      │      │      │      │      │    │    │    │
📝 FASE 6: DOCUMENTACIÓN         │      │      │      │      │      │      │      │      │      │    │    │████│
  Memoria del TFG                 │      │      │      │      │      │      │      │      │      │    │    │████│
  Manual de usuario               │      │      │      │      │      │      │      │      │      │    │    │████│
  Preparación de la defensa       │      │      │      │      │      │      │      │      │      │    │    │████│
```

### 2.2 Resumen de Fases

| Fase | Duración | Semanas |
|------|----------|---------|
| **Fase 1:** Análisis y Diseño | 2 semanas | S1 - S2 |
| **Fase 2:** Backend (Spring Boot) | 3 semanas | S3 - S5 |
| **Fase 3:** Frontend (React + Vite) | 4 semanas | S5 - S8 |
| **Fase 4:** Flutter (Android) | 2 semanas | S9 - S10 |
| **Fase 5:** Testing y Deploy | 1 semana | S11 |
| **Fase 6:** Documentación | 1 semana | S12 |
| **TOTAL** | **12 semanas** | |

---

## 3. Tecnologías y Plataformas

### 3.1 Stack Tecnológico

| Capa | Tecnología | Versión | Propósito |
|------|------------|---------|-----------|
| **Backend** | Spring Boot | 4.0.1 | Framework Java para API REST |
| | Spring Data JPA | - | ORM y persistencia |
| | Spring Security | - | Autenticación y autorización |
| | JWT (jjwt) | 0.12.3 | Tokens de autenticación |
| | Lombok | - | Reducción de boilerplate |
| | Jakarta Validation | - | Validación de datos |
| | Stripe Java SDK | - | Pasarela de pago |
| **Base de datos** | MySQL | 8+ | Base de datos relacional |
| **Frontend Web** | React | 19 | Librería UI |
| | Vite | 6 | Bundler y dev server |
| | Axios | - | Cliente HTTP |
| | Leaflet / React-Leaflet | - | Mapas interactivos |
| | GSAP | - | Animaciones |
| | CSS Modules | - | Estilos con scope |
| | qrcode.react | 4.2.0 | Generación de QR codes reales |
| | Stripe.js / React Stripe | - | Formularios de pago seguros |
| | Lucide React | - | Iconografía |
| **APIs externas** | AviationStack | Free/Basic | Vuelos en tiempo real |
| | Amadeus | Test | Ofertas de vuelos comerciales |
| | MapTiler | - | Tiles del mapa satelital |
| | Anthropic Claude | API | Asistente IA AirBot (opción premium) |
| | Groq / LLaMA3 | API | Asistente IA AirBot (opción gratuita) |
| | Stripe | Test/Live | Procesamiento de pagos |

### 3.2 Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENTE (Navegador)                       │
│  React 19 + Vite │ CSS Modules │ Leaflet │ qrcode.react     │
│  Stripe.js Elements │ AirBot chatbot                        │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP / REST (JSON)
                           │ localhost:5173 → localhost:8080
┌──────────────────────────▼──────────────────────────────────┐
│                   BACKEND (Spring Boot)                      │
│                                                              │
│  Controller Layer  →  Service Layer  →  Repository Layer     │
│  /api/auth            FlightService      UserRepository      │
│  /api/flights         TicketService      TicketRepository    │
│  /api/tickets         AuthService                           │
│                                                              │
│  Spring Security + JWT Filter                               │
│  Stripe SDK (pagos)                                         │
└────────┬──────────────────────────────┬─────────────────────┘
         │                              │
         ▼                              ▼
┌─────────────────┐          ┌──────────────────────────┐
│   MySQL 8+      │          │   APIs Externas           │
│   airport_db    │          │   • AviationStack (HTTP)  │
│   - users       │          │   • Amadeus (HTTPS)       │
│   - tickets     │          │   • Stripe (pagos)        │
└─────────────────┘          │   • Anthropic/Groq (IA)   │
                             └──────────────────────────┘
```

### 3.3 Modo Mock vs APIs Reales

El sistema detecta automáticamente la disponibilidad de APIs externas:

| API | Sin configurar | Con API key |
|-----|---------------|-------------|
| **AviationStack** | Genera 70+ vuelos mock (10 activos en vuelo) | Datos reales; fallback a mock si 429 |
| **Amadeus** | Genera ofertas mock aleatorias | Ofertas reales de vuelo |
| **Stripe** | Modo demo (tarjeta simulada) | Cobro real con Stripe Elements |
| **Claude/Groq** | Respuestas predefinidas de fallback | IA generativa con LLM |

### 3.4 Flutter - Migración a Móvil

| Aspecto | Detalle |
|---------|---------|
| **Framework** | Flutter (Dart) |
| **IDE** | Visual Studio Code con extensiones Flutter/Dart |
| **Plataformas objetivo** | Android (APK/AAB) |
| **Estrategia** | Reutilizar la API REST existente del backend Spring Boot |
| **Paquetes clave** | `http` (API), `flutter_map` (mapas), `provider`/`riverpod` (estado), `shared_preferences` (sesión) |

---

## 4. Requisitos Funcionales y No Funcionales

### 4.1 Requisitos Funcionales

| ID | Requisito | Prioridad | Estado |
|----|-----------|-----------|--------|
| **RF-01** | El sistema debe permitir a los usuarios registrarse con username, email y contraseña | Alta | ✅ Implementado |
| **RF-02** | El sistema debe permitir iniciar sesión con email y contraseña | Alta | ✅ Implementado |
| **RF-03** | El sistema debe generar tokens JWT para la autenticación | Alta | ✅ Implementado |
| **RF-04** | El sistema debe mostrar un dashboard con estadísticas y ofertas de vuelos | Alta | ✅ Implementado |
| **RF-05** | El sistema debe mostrar un mapa interactivo con búsqueda y seguimiento de aviones | Alta | ✅ Implementado |
| **RF-06** | El sistema debe permitir buscar vuelos por origen, destino, fecha y clase con autocompletado | Media | ✅ Implementado |
| **RF-07** | El sistema debe permitir la compra de billetes con selección de clase (Economy, Business, First) | Alta | ✅ Implementado |
| **RF-08** | El sistema debe ofrecer un selector de asientos interactivo | Media | ✅ Implementado |
| **RF-09** | El sistema debe generar un código de reserva único de 6 caracteres por billete | Alta | ✅ Implementado |
| **RF-10** | El sistema debe permitir consultar los billetes comprados (Wallet) | Alta | ✅ Implementado |
| **RF-11** | El sistema debe permitir cancelar billetes | Media | ✅ Implementado |
| **RF-12** | El sistema debe funcionar con datos Mock cuando no haya API keys externas configuradas | Media | ✅ Implementado |
| **RF-13** | El sistema debe integrarse con la API de AviationStack para obtener vuelos reales | Baja | ✅ Implementado |
| **RF-14** | El sistema debe integrarse con la API de Amadeus para ofertas comerciales | Baja | ✅ Implementado |
| **RF-15** | El sistema debe proteger las rutas de compra para usuarios no autenticados | Alta | ✅ Implementado |
| **RF-16** | El sistema debe simular movimiento de aviones con coordenadas calculadas entre aeropuertos | Media | ✅ Implementado |
| **RF-17** | El sistema debe integrarse con Stripe para procesar pagos reales con tarjeta | Alta | ✅ Implementado |
| **RF-18** | El sistema debe activar modo de pago demo automáticamente si no hay clave Stripe | Media | ✅ Implementado |
| **RF-19** | Cada billete debe incluir un código QR real y escaneable con los datos del vuelo | Alta | ✅ Implementado |
| **RF-20** | Debe existir una página de validación de billetes accesible por QR | Media | ✅ Implementado |
| **RF-21** | El mapa debe dibujar la ruta real del vuelo (origen → posición actual → destino) | Media | ✅ Implementado |
| **RF-22** | El sistema debe incluir un asistente IA (AirBot) para recomendaciones de vuelos | Baja | ✅ Implementado |
| **RF-23** | Los datos mock deben incluir vuelos activos en vuelo para poder demostrarse en el mapa | Media | ✅ Implementado |
| **RF-24** | El sistema debe detectar el límite de API (429) y hacer fallback a mock automáticamente | Media | ✅ Implementado |
| **RF-25** | El footer debe enlazar a páginas externas, vistas internas o mostrar modal "Próximamente" | Baja | ✅ Implementado |

### 4.2 Requisitos No Funcionales

| ID | Requisito | Categoría | Descripción |
|----|-----------|-----------|-------------|
| **RNF-01** | Rendimiento | Eficiencia | La aplicación web debe cargar en menos de 3 segundos (lazy loading con React.lazy) |
| **RNF-02** | Seguridad | Seguridad | Las contraseñas deben almacenarse cifradas con BCrypt |
| **RNF-03** | Seguridad | Seguridad | La autenticación debe basarse en tokens JWT con expiración configurable (24h por defecto) |
| **RNF-04** | Seguridad | Seguridad | Los endpoints de la API deben estar protegidos con CORS configurado |
| **RNF-05** | Seguridad | Seguridad | Los secretos (claves API, Stripe) nunca deben commitearse en el repositorio; usar variables de entorno |
| **RNF-06** | Disponibilidad | Fiabilidad | El sistema debe funcionar en modo offline con datos Mock si las APIs externas no están disponibles |
| **RNF-07** | Usabilidad | Usabilidad | La interfaz debe ser responsive y adaptarse a diferentes tamaños de pantalla |
| **RNF-08** | Usabilidad | Usabilidad | La navegación debe ser intuitiva mediante sidebar con iconos descriptivos |
| **RNF-09** | Mantenibilidad | Mantenibilidad | El código frontend debe usar CSS Modules para evitar conflictos de estilos |
| **RNF-10** | Mantenibilidad | Mantenibilidad | El backend debe seguir arquitectura por capas (Controller → Service → Repository) |
| **RNF-11** | Portabilidad | Portabilidad | La aplicación móvil (Flutter) debe compilar para Android desde el mismo código base |
| **RNF-12** | Escalabilidad | Eficiencia | La base de datos debe usar índices en campos de búsqueda frecuente (email, username, flight_iata) |
| **RNF-13** | Compatibilidad | Compatibilidad | El frontend debe ser compatible con navegadores modernos (Chrome, Firefox, Safari, Edge) |
| **RNF-14** | Internacionalización | Usabilidad | La interfaz debe estar en idioma español |
| **RNF-15** | Infraestructura | Despliegue | El backend requiere Java 21+ y MySQL 8+ |
| **RNF-16** | Infraestructura | Despliegue | El frontend requiere Node.js 18+ |
| **RNF-17** | Fiabilidad | Robustez | El simulador de vuelos debe seguir funcionando sin datos GPS reales, calculando posiciones por interpolación |

---

## 5. Esquema Entidad-Relación y Normalización

### 5.1 Diagrama Entidad-Relación

```
┌─────────────────────────────────────────────────┐
│                    USERS                         │
├─────────────────────────────────────────────────┤
│ PK  id            BIGINT AUTO_INCREMENT          │
│     username      VARCHAR(255) NOT NULL UNIQUE    │
│     email         VARCHAR(255) NOT NULL UNIQUE    │
│     password      VARCHAR(255) NOT NULL           │
│     created_at    TIMESTAMP DEFAULT NOW()         │
├─────────────────────────────────────────────────┤
│ IDX idx_email (email)                            │
│ IDX idx_username (username)                      │
└───────────────────────┬─────────────────────────┘
                        │
                        │ 1:N (un usuario tiene muchos tickets)
                        │ users.id → tickets.owner_user_id
                        │
┌───────────────────────▼─────────────────────────┐
│                   TICKETS                        │
├─────────────────────────────────────────────────┤
│ PK  id                 BIGINT AUTO_INCREMENT     │
│ FK  owner_user_id      VARCHAR(255) NOT NULL     │
│                                                  │
│ --- Información del vuelo ---                    │
│     flight_number      VARCHAR(255) NOT NULL     │
│     flight_iata        VARCHAR(10) NOT NULL      │
│     airline_name       VARCHAR(255) NOT NULL     │
│     airline_iata       VARCHAR(5) NOT NULL       │
│                                                  │
│ --- Información de salida ---                    │
│     departure_airport  VARCHAR(255) NOT NULL     │
│     departure_iata     VARCHAR(5) NOT NULL       │
│     departure_city     VARCHAR(255) NOT NULL     │
│     departure_date     DATE NOT NULL             │
│     departure_time     TIME NOT NULL             │
│                                                  │
│ --- Información de llegada ---                   │
│     arrival_airport    VARCHAR(255) NOT NULL     │
│     arrival_iata       VARCHAR(5) NOT NULL       │
│     arrival_city       VARCHAR(255) NOT NULL     │
│     arrival_date       DATE NOT NULL             │
│     arrival_time       TIME NOT NULL             │
│                                                  │
│ --- Información del pasajero ---                 │
│     passenger_name     VARCHAR(255) NOT NULL     │
│     passenger_document VARCHAR(255) NOT NULL     │
│     seat_number        VARCHAR(5) NOT NULL       │
│                                                  │
│ --- Detalles del billete ---                     │
│     ticket_class       ENUM('ECONOMY',           │
│                         'BUSINESS','FIRST')      │
│     price              DECIMAL(10,2) NOT NULL    │
│     currency           VARCHAR(3) DEFAULT 'EUR'  │
│     booking_reference  VARCHAR(6) UNIQUE         │
│     ticket_status      ENUM('CONFIRMED',         │
│                         'CANCELLED','PENDING')   │
│     purchase_date      DATETIME DEFAULT NOW()    │
│     updated_at         DATETIME                  │
├─────────────────────────────────────────────────┤
│ IDX idx_owner_user_id (owner_user_id)            │
│ IDX idx_flight_iata (flight_iata)                │
│ IDX idx_booking_reference (booking_reference)    │
│ IDX idx_ticket_status (ticket_status)            │
│ IDX idx_departure_date (departure_date)          │
└─────────────────────────────────────────────────┘
```

### 5.2 Relaciones

| Relación | Tipo | Descripción |
|----------|------|-------------|
| Users → Tickets | 1:N | Un usuario puede tener muchos billetes |
| Tickets → Users | N:1 | Cada billete pertenece a un usuario (owner_user_id) |

### 5.3 Normalización

#### Primera Forma Normal (1FN) ✅
- **Todas las columnas contienen valores atómicos** (no hay listas ni conjuntos)
- **Cada fila es única** (todas las tablas tienen PK con `id`)
- No hay grupos repetidos de columnas

#### Segunda Forma Normal (2FN) ✅
- **Cumple 1FN**
- **Todos los atributos no clave dependen completamente de la clave primaria**
  - En `users`: username, email, password, created_at → dependen de `id`
  - En `tickets`: todos los campos → dependen de `id`
- No hay dependencias parciales (las claves primarias son simples, no compuestas)

#### Tercera Forma Normal (3FN) ✅
- **Cumple 2FN**
- **No hay dependencias transitivas** entre atributos no clave:
  - En `tickets`: los campos de salida (departure_airport, departure_iata, departure_city) podrían normalizarse en una tabla `airports`, pero se mantienen desnormalizados intencionalmente para:
    - ✅ **Rendimiento**: evitar JOINs innecesarios en consultas frecuentes
    - ✅ **Snapshot**: mantener un registro histórico del billete tal como fue comprado
    - ✅ **Independencia**: los datos del billete no deben cambiar si un aeropuerto cambia de nombre

#### Justificación de la desnormalización controlada

| Campo desnormalizado | Justificación |
|---------------------|---------------|
| `airline_name` + `airline_iata` | Snapshot del billete; la aerolínea podría cambiar de nombre |
| `departure_*` / `arrival_*` | Datos históricos del vuelo en el momento de la compra |
| `passenger_name` + `passenger_document` | El pasajero puede no ser el usuario registrado |

> **Nota**: Los datos de vuelos en tiempo real (posiciones, estados) NO se almacenan en la base de datos. Se obtienen en tiempo real de las APIs externas (AviationStack/Amadeus) o del simulador Mock y se mantienen en memoria caché del backend.

---

## 6. Análisis DAFO

### 6.1 Matriz DAFO

```
┌─────────────────────────────────────────┬─────────────────────────────────────────┐
│            FACTORES POSITIVOS           │           FACTORES NEGATIVOS            │
├─────────────────────────────────────────┼─────────────────────────────────────────┤
│                                         │                                         │
│           🟢 FORTALEZAS                 │           🔴 DEBILIDADES                │
│           (Internas)                    │           (Internas)                     │
│                                         │                                         │
│  • Stack tecnológico moderno            │  • Dependencia de APIs externas         │
│    (Spring Boot 4, React 19, Java 21)   │    con planes freemium limitados        │
│                                         │    (AviationStack: 100 req/mes)         │
│  • Arquitectura por capas bien          │                                         │
│    definida (MVC + REST)                │  • Datos de vuelos no persistidos       │
│                                         │    (solo en memoria/cache)              │
│  • Modo Mock completo con vuelos        │                                         │
│    activos simulados en el mapa         │  • Falta de testing automatizado        │
│                                         │    (unitarios, integración)             │
│  • Autenticación segura con JWT         │                                         │
│    y contraseñas cifradas (BCrypt)      │  • Un solo rol de usuario               │
│                                         │    (sin admin/moderador)                │
│  • Pasarela de pago real (Stripe)       │                                         │
│    con modo demo automático             │  • Sin persistencia de historial        │
│                                         │    de posiciones de vuelo               │
│  • QR codes reales y escaneables        │                                         │
│    en los billetes                      │                                         │
│                                         │                                         │
│  • Asistente IA (AirBot) integrado      │                                         │
│    con Claude y Groq como fallback      │                                         │
│                                         │                                         │
│  • UI moderna con animaciones,          │                                         │
│    mapa satelital y seguimiento         │                                         │
│    de vuelos en tiempo real             │                                         │
│                                         │                                         │
│  • Seguridad: secretos por variables    │                                         │
│    de entorno, nunca en el código       │                                         │
│                                         │                                         │
├─────────────────────────────────────────┼─────────────────────────────────────────┤
│                                         │                                         │
│          🔵 OPORTUNIDADES               │          🟠 AMENAZAS                    │
│          (Externas)                     │          (Externas)                      │
│                                         │                                         │
│  • Sector de aviación en crecimiento    │  • Competencia de apps consolidadas     │
│    (demanda de apps de seguimiento)     │    (FlightAware, Flightradar24)         │
│                                         │                                         │
│  • Integración con más APIs            │  • Cambios en las APIs externas         │
│    (Google Flights, Skyscanner)         │    (precios, límites, deprecaciones)    │
│                                         │                                         │
│  • Añadir notificaciones push          │  • Regulaciones de datos de aviación    │
│    de cambios en vuelos                 │    (restricciones de acceso)            │
│                                         │                                         │
│  • Despliegue en la nube              │  • Requisitos de seguridad cada vez     │
│    (AWS, Azure, GCP, Railway)          │    más estrictos (GDPR, PCI-DSS)        │
│                                         │                                         │
│  • Añadir comparador de precios        │  • Costes de APIs en producción         │
│    entre aerolíneas                     │    (planes freemium limitados)          │
│                                         │                                         │
│  • Gamificación (puntos de             │  • Evolución rápida de frameworks       │
│    fidelización, logros de viaje)       │    que puede hacer obsoleto el stack    │
│                                         │                                         │
└─────────────────────────────────────────┴─────────────────────────────────────────┘
```

### 6.2 Estrategias derivadas del DAFO

| Estrategia | Tipo | Descripción |
|------------|------|-------------|
| **E1: Explotar el modo Mock** | FO (Fortaleza + Oportunidad) | Usar el modo Mock + vuelos activos simulados como demo completa sin necesidad de APIs reales de pago |
| **E2: Flutter multiplataforma** | FO | Lanzar en Android reutilizando la API REST existente |
| **E3: Implementar testing** | DA (Debilidad + Amenaza) | Añadir tests unitarios y de integración para garantizar estabilidad ante cambios en APIs externas |
| **E4: Sistema de roles** | DO (Debilidad + Oportunidad) | Implementar roles (admin, usuario premium) para monetización y gestión avanzada |
| **E5: Cache con Redis** | DA | Implementar cache Redis para reducir dependencia de APIs externas y mejorar rendimiento |
| **E6: Abstracción de APIs** | FA (Fortaleza + Amenaza) | La arquitectura por capas permite cambiar proveedores de API sin afectar al frontend |
| **E7: Stripe en producción** | FO | Activar pagos reales configurando las claves de producción de Stripe sin cambiar el código |

---

## 7. Apéndice: API Endpoints Completa

### Autenticación (`/api/auth`)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Registrar nuevo usuario | ❌ No |
| POST | `/api/auth/login` | Iniciar sesión | ❌ No |
| POST | `/api/auth/logout` | Cerrar sesión | ✅ Sí |

### Vuelos (`/api/flights`)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/api/flights` | Obtener todos los vuelos (real o mock) | ❌ No |
| GET | `/api/flights?forceRefresh=true` | Forzar actualización desde API | ❌ No |
| GET | `/api/flights/refresh` | Alias de forceRefresh | ❌ No |
| GET | `/api/flights/offers?origin=&destination=&departureDate=&adults=&cabinClass=` | Buscar ofertas de vuelo | ❌ No |

### Tickets (`/api/tickets`)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/api/tickets` | Crear ticket | ✅ Sí |
| GET | `/api/tickets/{id}` | Obtener ticket por ID | ✅ Sí |
| GET | `/api/tickets/reference/{ref}` | Obtener por referencia | ✅ Sí |
| GET | `/api/tickets/user/{userId}` | Tickets del usuario | ✅ Sí |
| GET | `/api/tickets/user/{userId}?status=` | Tickets por estado | ✅ Sí |
| GET | `/api/tickets/flight/{flightIATA}` | Tickets por vuelo | ✅ Sí |
| GET | `/api/tickets/user/{userId}/flight/{iata}` | Tickets usuario+vuelo | ✅ Sí |
| PATCH | `/api/tickets/{id}` | Actualizar ticket | ✅ Sí |
| PATCH | `/api/tickets/{id}/cancel` | Cancelar ticket | ✅ Sí |
| DELETE | `/api/tickets/{id}` | Eliminar ticket | ✅ Sí |

---

## 8. Variables de Entorno

### Frontend (`AirportFront/.env`)

| Variable | Descripción | Requerida |
|----------|-------------|-----------|
| `VITE_MAPTILER_API_KEY` | Clave para los tiles del mapa satelital | ✅ Sí |
| `VITE_AVIATION_API_KEY` | Clave AviationStack (100 req/mes gratis) | ⚠️ Opcional |
| `VITE_STRIPE_PUBLIC_KEY` | Clave pública Stripe (`pk_test_...`) | ⚠️ Opcional |
| `VITE_AMADEUS_CLIENT_ID` | ID de cliente Amadeus | ⚠️ Opcional |
| `VITE_AMADEUS_CLIENT_SECRET` | Secreto de cliente Amadeus | ⚠️ Opcional |
| `VITE_USE_MOCK_FLIGHTS` | Forzar datos mock (`true`/`false`) | ❌ No |

### Backend (variables de entorno del sistema)

| Variable | Descripción | Requerida |
|----------|-------------|-----------|
| `STRIPE_API_KEY` | Clave secreta Stripe (`sk_test_...`) | ⚠️ Opcional* |
| `STRIPE_PUBLISHABLE_KEY` | Clave pública Stripe | ⚠️ Opcional* |
| `AVIATIONSTACK_API_KEY` | Clave AviationStack | ⚠️ Opcional* |
| `AMADEUS_CLIENT_ID` | ID de cliente Amadeus | ⚠️ Opcional* |
| `AMADEUS_CLIENT_SECRET` | Secreto de cliente Amadeus | ⚠️ Opcional* |
| `ANTHROPIC_API_KEY` | Clave API de Claude (IA) | ⚠️ Opcional* |
| `GROQ_API_KEY` | Clave API de Groq/LLaMA3 (IA gratuita) | ⚠️ Opcional* |

> **(*) Opcional con fallback**: Si no se configura, el sistema activa el modo mock/demo correspondiente automáticamente. La app es completamente funcional sin ninguna API key externa.
