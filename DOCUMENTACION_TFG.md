# 📋 Documentación TFG - AirportApp

## Índice

1. [Casos de Uso](#1-casos-de-uso)
2. [Diagrama de Gantt](#2-diagrama-de-gantt)
3. [Tecnologías y Plataformas](#3-tecnologías-y-plataformas)
4. [Requisitos Funcionales y No Funcionales](#4-requisitos-funcionales-y-no-funcionales)
5. [Esquema Entidad-Relación y Normalización](#5-esquema-entidad-relación-y-normalización)
6. [Análisis DAFO](#6-análisis-dafo)

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
│   │ sesión            │     │ (posición de aviones)            │    │
│   └────────┬─────────┘     └──────────────────────────────────┘    │
│            │                                                        │
│   ┌────────▼─────────┐     ┌──────────────────────────────────┐    │
│   │ CU-03: Cerrar    │     │ CU-08: Buscar vuelos             │    │
│   │ sesión            │     │ (por número o aeropuerto)        │    │
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
└─────────────────────────────────────────────────────────────────────┘

Actores:
  👤 Usuario no autenticado → CU-01, CU-02, CU-06, CU-07, CU-08, CU-11, CU-12
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
| **Flujo principal** | 1. El usuario accede a "Comprar Billetes" desde el sidebar<br>2. Se muestran vuelos disponibles (reales o mock)<br>3. El usuario selecciona un vuelo<br>4. Elige clase (Economy, Business, First)<br>5. Selecciona asiento disponible<br>6. Introduce datos del pasajero (nombre, documento)<br>7. Confirma la compra<br>8. El sistema genera un código de reserva único (6 caracteres)<br>9. El billete se almacena en base de datos |
| **Flujo alternativo** | 1a. Si no está autenticado → Se abre el modal de login<br>3a. No hay vuelos disponibles → Se muestra mensaje informativo |
| **Postcondiciones** | El billete queda registrado con estado CONFIRMED |

---

#### CU-05: Gestionar wallet (billetes comprados)

| Campo    | Descripción |
|----------|-------------|
| **ID**   | CU-05 |
| **Actor** | Usuario autenticado |
| **Descripción** | El usuario consulta y gestiona sus billetes comprados |
| **Precondiciones** | El usuario está autenticado |
| **Flujo principal** | 1. El usuario accede a "Wallet" desde el sidebar<br>2. Se muestran todos sus billetes<br>3. Puede ver detalles de cada billete<br>4. Puede cancelar billetes |
| **Postcondiciones** | El usuario visualiza el estado actual de sus billetes |

---

#### CU-06: Ver Dashboard

| Campo    | Descripción |
|----------|-------------|
| **ID**   | CU-06 |
| **Actor** | Usuario (autenticado o no) |
| **Descripción** | El usuario visualiza el panel principal con estadísticas de vuelos |
| **Precondiciones** | Ninguna |
| **Flujo principal** | 1. El usuario accede a la aplicación<br>2. Se muestra el Dashboard con estadísticas: vuelos activos, programados y aterrizados<br>3. Los datos se actualizan mediante el simulador de vuelos |
| **Postcondiciones** | Se muestran las estadísticas en tiempo real |

---

#### CU-07: Ver mapa en tiempo real

| Campo    | Descripción |
|----------|-------------|
| **ID**   | CU-07 |
| **Actor** | Usuario (autenticado o no) |
| **Descripción** | El usuario visualiza la posición de los aviones en un mapa interactivo |
| **Precondiciones** | Ninguna |
| **Flujo principal** | 1. El usuario selecciona "Mapa" desde el sidebar<br>2. Se carga un mapa con Leaflet<br>3. Se muestran los aviones en sus posiciones actuales<br>4. Las posiciones se actualizan periódicamente<br>5. El usuario puede hacer zoom, desplazarse y clicar aviones |
| **Postcondiciones** | El mapa muestra las posiciones actualizadas de los aviones |

---

#### CU-08: Buscar vuelos

| Campo    | Descripción |
|----------|-------------|
| **ID**   | CU-08 |
| **Actor** | Usuario (autenticado o no) |
| **Descripción** | El usuario busca vuelos por número de vuelo o aeropuerto |
| **Precondiciones** | Ninguna |
| **Flujo principal** | 1. El usuario selecciona "Buscar" desde el sidebar<br>2. Introduce un término de búsqueda<br>3. El sistema filtra los vuelos coincidentes<br>4. Se muestran los resultados con información detallada |
| **Flujo alternativo** | 3a. No se encuentran resultados → Se muestra mensaje "Sin resultados" |
| **Postcondiciones** | Se presenta la lista de vuelos que coinciden con la búsqueda |

---

#### CU-09: Seleccionar asiento y clase

| Campo    | Descripción |
|----------|-------------|
| **ID**   | CU-09 |
| **Actor** | Usuario autenticado |
| **Descripción** | El usuario selecciona la clase del billete y un asiento específico |
| **Precondiciones** | El usuario ha seleccionado un vuelo para comprar |
| **Flujo principal** | 1. Se muestra el selector de clase (Economy, Business, First)<br>2. El precio se actualiza según la clase<br>3. Se muestra el mapa de asientos<br>4. El usuario selecciona un asiento disponible<br>5. Se confirma la selección |
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
                                  │      │      │      │      │      │      │      │      │      │    │    │    │
🎨 FASE 3: FRONTEND (React)      │      │      │      │      │██████│██████│██████│      │      │    │    │    │
  Estructura y componentes base   │      │      │      │      │██████│      │      │      │      │    │    │    │
  Dashboard y estadísticas        │      │      │      │      │      │██████│      │      │      │    │    │    │
  Mapa en tiempo real (Leaflet)   │      │      │      │      │      │██████│      │      │      │    │    │    │
  Búsqueda de vuelos              │      │      │      │      │      │      │██████│      │      │    │    │    │
  Tienda + Selector asientos      │      │      │      │      │      │      │██████│      │      │    │    │    │
  Wallet y gestión de billetes    │      │      │      │      │      │      │██████│      │      │    │    │    │
  Header + Login/Register         │      │      │      │      │      │      │██████│      │      │    │    │    │
                                  │      │      │      │      │      │      │      │      │      │    │    │    │
📱 FASE 4: FLUTTER (Móvil)       │      │      │      │      │      │      │      │██████│██████│████│    │    │
  Setup proyecto Flutter          │      │      │      │      │      │      │      │██████│      │    │    │    │
  Pantallas principales           │      │      │      │      │      │      │      │██████│██████│    │    │    │
  Integración con API backend     │      │      │      │      │      │      │      │      │██████│    │    │    │
  Build Android (APK/AAB)         │      │      │      │      │      │      │      │      │      │████│    │    │
  Build macOS (si Apple Dev)      │      │      │      │      │      │      │      │      │      │████│    │    │
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
| **Fase 3:** Frontend (React + Vite) | 3 semanas | S5 - S7 |
| **Fase 4:** Flutter (Android + macOS) | 3 semanas | S8 - S10 |
| **Fase 5:** Testing y Deploy | 1 semana | S11 |
| **Fase 6:** Documentación | 1 semana | S12 |
| **TOTAL** | **12 semanas** | |

---

## 3. Tecnologías y Plataformas

### 3.1 Stack Tecnológico Actual

| Capa | Tecnología | Versión | Propósito |
|------|------------|---------|-----------|
| **Backend** | Spring Boot | 4.0.1 | Framework Java para API REST |
| | Spring Data JPA | - | ORM y persistencia |
| | Spring Security | - | Autenticación y autorización |
| | JWT (jjwt) | 0.12.3 | Tokens de autenticación |
| | Lombok | - | Reducción de boilerplate |
| | Jakarta Validation | - | Validación de datos |
| **Base de datos** | MySQL | 8+ | Base de datos relacional |
| **Frontend Web** | React | 19 | Librería UI |
| | Vite | 6 | Bundler y dev server |
| | Axios | - | Cliente HTTP |
| | Leaflet | - | Mapas interactivos |
| | GSAP | - | Animaciones |
| | CSS Modules | - | Estilos con scope |

### 3.2 Flutter - Migración a Móvil

| Aspecto | Detalle |
|---------|---------|
| **Framework** | Flutter (Dart) |
| **IDE** | Visual Studio Code con extensiones Flutter/Dart |
| **Plataformas objetivo** | Android (APK/AAB) y macOS |
| **Estrategia** | Reutilizar la API REST existente del backend Spring Boot |
| **Paquetes clave** | `http` (API), `flutter_map` o `google_maps_flutter` (mapas), `provider`/`riverpod` (estado), `shared_preferences` (sesión) |

#### Pasos para la migración a Flutter:

1. **Configurar el proyecto Flutter** en VS Code con extensiones Flutter y Dart
2. **Crear las pantallas** equivalentes a las vistas React:
   - Dashboard → `DashboardScreen`
   - Mapa → `MapScreen` (usando `flutter_map`)
   - Búsqueda → `SearchScreen`
   - Tienda → `ShopScreen`
   - Wallet → `WalletScreen`
   - Login/Register → `AuthScreen`
3. **Conectar con la API REST** existente usando el paquete `http` o `dio`
4. **Build Android**: `flutter build apk` / `flutter build appbundle`
5. **Build macOS**: `flutter build macos` (requiere macOS con Xcode)

---

## 4. Requisitos Funcionales y No Funcionales

### 4.1 Requisitos Funcionales

| ID | Requisito | Prioridad | Estado |
|----|-----------|-----------|--------|
| **RF-01** | El sistema debe permitir a los usuarios registrarse con username, email y contraseña | Alta | ✅ Implementado |
| **RF-02** | El sistema debe permitir iniciar sesión con email y contraseña | Alta | ✅ Implementado |
| **RF-03** | El sistema debe generar tokens JWT para la autenticación | Alta | ✅ Implementado |
| **RF-04** | El sistema debe mostrar un dashboard con estadísticas de vuelos (activos, programados, aterrizados) | Alta | ✅ Implementado |
| **RF-05** | El sistema debe mostrar un mapa interactivo con la posición en tiempo real de los aviones | Alta | ✅ Implementado |
| **RF-06** | El sistema debe permitir buscar vuelos por número de vuelo o aeropuerto | Media | ✅ Implementado |
| **RF-07** | El sistema debe permitir la compra de billetes con selección de clase (Economy, Business, First) | Alta | ✅ Implementado |
| **RF-08** | El sistema debe ofrecer un selector de asientos interactivo | Media | ✅ Implementado |
| **RF-09** | El sistema debe generar un código de reserva único de 6 caracteres por billete | Alta | ✅ Implementado |
| **RF-10** | El sistema debe permitir consultar los billetes comprados (Wallet) | Alta | ✅ Implementado |
| **RF-11** | El sistema debe permitir cancelar billetes | Media | ✅ Implementado |
| **RF-12** | El sistema debe funcionar con datos Mock cuando no haya API keys externas configuradas | Media | ✅ Implementado |
| **RF-13** | El sistema debe integrarse con la API de AviationStack para obtener vuelos reales | Baja | ✅ Implementado |
| **RF-14** | El sistema debe integrarse con la API de Amadeus para ofertas comerciales | Baja | ✅ Implementado |
| **RF-15** | El sistema debe proteger las rutas de compra para usuarios no autenticados | Alta | ✅ Implementado |
| **RF-16** | Al cerrar sesión, el sistema debe redirigir al Dashboard | Baja | ✅ Implementado |
| **RF-17** | El sistema debe simular movimiento de aviones cuando no hay datos reales | Media | ✅ Implementado |

### 4.2 Requisitos No Funcionales

| ID | Requisito | Categoría | Descripción |
|----|-----------|-----------|-------------|
| **RNF-01** | Rendimiento | Eficiencia | La aplicación web debe cargar en menos de 3 segundos (lazy loading con React.lazy) |
| **RNF-02** | Seguridad | Seguridad | Las contraseñas deben almacenarse cifradas con BCrypt |
| **RNF-03** | Seguridad | Seguridad | La autenticación debe basarse en tokens JWT con expiración configurable (24h por defecto) |
| **RNF-04** | Seguridad | Seguridad | Los endpoints de la API deben estar protegidos con CORS configurado |
| **RNF-05** | Disponibilidad | Fiabilidad | El sistema debe funcionar en modo offline con datos Mock si las APIs externas no están disponibles |
| **RNF-06** | Usabilidad | Usabilidad | La interfaz debe ser responsive y adaptarse a diferentes tamaños de pantalla |
| **RNF-07** | Usabilidad | Usabilidad | La navegación debe ser intuitiva mediante sidebar con iconos descriptivos |
| **RNF-08** | Mantenibilidad | Mantenibilidad | El código frontend debe usar CSS Modules para evitar conflictos de estilos |
| **RNF-09** | Mantenibilidad | Mantenibilidad | El backend debe seguir arquitectura por capas (Controller → Service → Repository) |
| **RNF-10** | Portabilidad | Portabilidad | La aplicación móvil (Flutter) debe compilar para Android y macOS desde el mismo código base |
| **RNF-11** | Escalabilidad | Eficiencia | La base de datos debe usar índices en campos de búsqueda frecuente (email, username, flight_iata) |
| **RNF-12** | Compatibilidad | Compatibilidad | El frontend debe ser compatible con navegadores modernos (Chrome, Firefox, Safari, Edge) |
| **RNF-13** | Internacionalización | Usabilidad | La interfaz debe soportar el idioma español |
| **RNF-14** | Infraestructura | Despliegue | El backend requiere Java 21+ y MySQL 8+ |
| **RNF-15** | Infraestructura | Despliegue | El frontend requiere Node.js 18+ |

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

> **Nota**: Los datos de vuelos en tiempo real (posiciones, estados) NO se almacenan en la base de datos. Se obtienen en tiempo real de las APIs externas (AviationStack/Amadeus) o del simulador Mock y se mantienen en memoria.

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
│    (Spring Boot 4, React 19, Java 21)   │    (AviationStack, Amadeus)             │
│                                         │                                         │
│  • Arquitectura por capas bien          │  • Datos de vuelos no persistidos       │
│    definida (MVC + REST)                │    (solo en memoria/cache)              │
│                                         │                                         │
│  • Modo Mock integrado que permite      │  • Falta de testing automatizado        │
│    funcionar sin APIs externas          │    (unitarios, integración)             │
│                                         │                                         │
│  • Autenticación segura con JWT         │  • Un solo rol de usuario               │
│    y contraseñas cifradas (BCrypt)      │    (sin admin/moderador)                │
│                                         │                                         │
│  • UI moderna con animaciones           │  • Sin sistema de pago real             │
│    (GSAP) y mapas interactivos          │    (simulación de compra)               │
│    (Leaflet)                            │                                         │
│                                         │  • Documentación técnica limitada       │
│  • Frontend con code splitting          │    durante el desarrollo inicial        │
│    y lazy loading (rendimiento)         │                                         │
│                                         │                                         │
│  • Multiplataforma con Flutter          │                                         │
│    (Android + macOS)                    │                                         │
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
│  • Implementar sistema de pagos        │  • Requisitos de seguridad cada vez     │
│    real (Stripe, PayPal)               │    más estrictos (GDPR, etc.)           │
│                                         │                                         │
│  • Despliegue en la nube              │  • Costes de APIs en producción         │
│    (AWS, Azure, GCP)                   │    (planes freemium limitados)          │
│                                         │                                         │
│  • Añadir comparador de precios        │  • Evolución rápida de frameworks       │
│    entre aerolíneas                     │    que puede hacer obsoleto el stack    │
│                                         │                                         │
│  • Gamificación (puntos de             │                                         │
│    fidelización, logros)               │                                         │
│                                         │                                         │
└─────────────────────────────────────────┴─────────────────────────────────────────┘
```

### 6.2 Estrategias derivadas del DAFO

| Estrategia | Tipo | Descripción |
|------------|------|-------------|
| **E1: Explotar el modo Mock** | FO (Fortaleza + Oportunidad) | Usar el modo Mock como demo comercial para captar usuarios antes de integrar APIs reales de pago |
| **E2: Flutter multiplataforma** | FO | Lanzar en Android (mayor cuota de mercado) y macOS para diferenciarse con una app nativa fluida |
| **E3: Implementar testing** | DA (Debilidad + Amenaza) | Añadir tests unitarios y de integración para garantizar estabilidad ante cambios en APIs externas |
| **E4: Sistema de roles** | DO (Debilidad + Oportunidad) | Implementar roles (admin, usuario premium) para monetización y gestión avanzada |
| **E5: Cache de datos** | DA | Implementar cache Redis para reducir dependencia de APIs externas y mejorar rendimiento |
| **E6: Abstracción de APIs** | FA (Fortaleza + Amenaza) | La arquitectura por capas permite cambiar proveedores de API sin afectar al frontend |

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
| GET | `/api/flights` | Obtener todos los vuelos | ❌ No |
| GET | `/api/flights/refresh` | Forzar actualización | ❌ No |
| GET | `/api/flights/offers?origin=&destination=&departureDate=&adults=&cabinClass=` | Buscar ofertas | ❌ No |

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
