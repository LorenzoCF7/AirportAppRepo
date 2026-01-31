# ✈️ Airport App - Full Stack Application

Sistema completo de seguimiento de vuelos en tiempo real, compra de billetes y gestión de reservas.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4.0.1-6DB33F?logo=springboot)
![Java](https://img.shields.io/badge/Java-21-007396?logo=openjdk)
![MySQL](https://img.shields.io/badge/MySQL-8-4479A1?logo=mysql)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite)

## 🌟 Características

- **🗺️ Mapa en tiempo real** - Aviones moviéndose con coordenadas GPS
- **🔍 Búsqueda de vuelos** - Por número de vuelo o aeropuerto
- **🛒 Tienda de billetes** - Compra con selección de clase y asiento
- **👛 Wallet** - Gestión de billetes comprados
- **📊 Dashboard** - Estadísticas de vuelos activos, programados y aterrizados
- **🎭 Modo Mock** - Funciona sin API keys externas

## 🛠️ Stack Tecnológico

| Capa | Tecnología | Versión | Descripción |
|------|------------|---------|-------------|
| **Backend** | Spring Boot | 4.0.1 | Framework Java para API REST |
| | Spring Data JPA | - | Persistencia y ORM |
| | MySQL | 8+ | Base de datos relacional |
| | Lombok | - | Reducción de boilerplate |
| | Jakarta Validation | - | Validación de datos |
| **Frontend** | React | 19 | Librería UI |
| | Vite | 6 | Build tool y dev server |
| | Axios | - | Cliente HTTP |
| | Leaflet | - | Mapas interactivos |
| | GSAP | - | Animaciones avanzadas |
| | CSS Modules | - | Estilos con scope |

## 📁 Estructura del Repositorio

```
AirportAppRepo/
├── AirportApp/          # 🔧 Backend (Spring Boot)
│   ├── src/
│   │   └── main/java/com/galacticos/AirportApp/
│   │       ├── config/       # Configuración (CORS, APIs)
│   │       ├── controller/   # Endpoints REST
│   │       ├── dto/          # Data Transfer Objects
│   │       ├── entity/       # Entidades JPA
│   │       ├── exception/    # Manejo de errores
│   │       ├── repository/   # Acceso a datos
│   │       └── service/      # Lógica de negocio
│   └── pom.xml
│
├── AirportFront/        # 🎨 Frontend (React + Vite)
│   ├── src/
│   │   ├── components/   # Componentes React
│   │   ├── services/     # Conexión con API
│   │   ├── hooks/        # Custom hooks
│   │   ├── constants/    # Datos y constantes
│   │   └── utils/        # Utilidades
│   └── package.json
│
└── README.md            # Este archivo
```

## 🚀 Inicio Rápido

### Requisitos

- **Java 21+**
- **Node.js 18+**
- **MySQL 8+**

### 1. Base de Datos

```sql
CREATE DATABASE airport_db;
```

### 2. Backend

```bash
cd AirportApp
./mvnw spring-boot:run
```
Arranca en `http://localhost:8080`

### 3. Frontend

```bash
cd AirportFront
npm install
npm run dev
```
Arranca en `http://localhost:5173`

## 🔌 API Endpoints

### Vuelos
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/flights` | Todos los vuelos |
| GET | `/api/flights/active` | Vuelos en aire |
| GET | `/api/flights/search?query=` | Buscar vuelos |
| GET | `/api/flights/stats` | Estadísticas |

### Tickets
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/tickets` | Todos los tickets |
| POST | `/api/tickets` | Crear ticket |
| DELETE | `/api/tickets/{id}` | Eliminar ticket |

## 🎨 Screenshots

### Dashboard
Vista principal con resumen de vuelos activos, programados y aterrizados.

### Mapa en Tiempo Real
Aviones moviéndose sobre el mapa con rutas y progreso.

### Tienda de Billetes
Busca y compra billetes con selección de clase (Economy, Business, First).

### Wallet
Gestiona tus billetes comprados con detalles completos.

## ⚙️ Configuración

### Backend (`application.properties`)

```properties
# Base de datos
spring.datasource.url=jdbc:mysql://127.0.0.1:3306/airport_db
spring.datasource.username=root
spring.datasource.password=

# APIs externas (opcional - funciona sin ellas)
aviationstack.api.key=
amadeus.api.key=
amadeus.api.secret=
```

### Frontend (`src/config/index.js`)

```javascript
export const API_BASE_URL = 'http://localhost:8080/api';
```
