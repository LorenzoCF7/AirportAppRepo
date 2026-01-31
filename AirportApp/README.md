# ✈️ Airport App - Backend API

API REST para la aplicación de seguimiento de vuelos en tiempo real y gestión de billetes de avión. Desarrollado con Spring Boot 4 y Java 21.

## 🌟 Características Principales

- **🛫 Seguimiento de vuelos en tiempo real** con datos de AviationStack API
- **💰 Búsqueda de ofertas de vuelos** con Amadeus API
- **🎫 Gestión completa de billetes** (compra, cancelación, consulta)
- **🎭 Modo mock inteligente** - funciona sin API keys configuradas
- **⚡ Cache de vuelos** para optimizar rendimiento
- **🔗 CORS configurado** para desarrollo frontend

---

## 🛠️ Stack Tecnológico

| Tecnología | Versión | Uso |
|------------|---------|-----|
| Java | 21 | Lenguaje principal |
| Spring Boot | 4.0.1 | Framework backend |
| Spring Data JPA | - | Persistencia de datos |
| Spring Security | - | Seguridad (preparado) |
| MySQL | 8.0+ | Base de datos |
| Lombok | - | Reducción de boilerplate |
| Maven | 3.9+ | Gestión de dependencias |

---

## 📁 Estructura del Proyecto

```
src/main/java/com/galacticos/AirportApp/
│
├── 🎮 controller/                    # Controladores REST
│   ├── FlightController.java         # Endpoints de vuelos
│   └── TicketController.java         # Endpoints de billetes
│
├── ⚙️ config/                        # Configuración
│   ├── ApiProperties.java            # Props de APIs externas
│   ├── SecurityConfig.java           # Configuración de seguridad
│   └── WebConfig.java                # CORS y configuración web
│
├── 📦 dto/                           # Data Transfer Objects
│   ├── request/
│   │   ├── CreateTicketRequest.java  # DTO crear billete
│   │   └── UpdateTicketRequest.java  # DTO actualizar billete
│   └── response/
│       ├── ApiResponse.java          # Respuesta estándar API
│       ├── FlightResponse.java       # Respuesta de vuelos
│       └── TicketResponse.java       # Respuesta de billetes
│
├── 🗃️ entity/                        # Entidades JPA
│   ├── Ticket.java                   # Entidad billete
│   ├── TicketClass.java              # Enum: ECONOMY, BUSINESS, FIRST
│   └── TicketStatus.java             # Enum: CONFIRMED, CANCELLED, etc.
│
├── ⚠️ exception/                     # Manejo de excepciones
│   ├── GlobalExceptionHandler.java   # Handler global
│   └── ResourceNotFoundException.java
│
├── 🔍 repository/                    # Repositorios JPA
│   └── TicketRepository.java
│
└── 🔧 service/                       # Lógica de negocio
    ├── FlightService.java            # Interfaz vuelos
    ├── TicketService.java            # Interfaz billetes
    └── impl/
        ├── FlightServiceImpl.java    # Implementación vuelos
        └── TicketServiceImpl.java    # Implementación billetes
```

---

## 🚀 Guía de Instalación Rápida

### Requisitos Previos

- ☕ **Java 21** o superior ([Descargar](https://adoptium.net/))
- 🐬 **MySQL 8.0** o superior ([Descargar](https://dev.mysql.com/downloads/))
- 📦 **Maven 3.9+** (incluido con el wrapper `mvnw`)

### Paso 1: Crear la Base de Datos

Abre MySQL y ejecuta:

```sql
CREATE DATABASE airport_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;
```

> 💡 **Nota:** Las tablas se crean automáticamente al iniciar la aplicación (JPA `ddl-auto=update`)

### Paso 2: Configurar Credenciales

Edita `src/main/resources/application.properties`:

```properties
# ==========================================
# CONFIGURACIÓN DE BASE DE DATOS
# ==========================================
spring.datasource.url=jdbc:mysql://127.0.0.1:3306/airport_db
spring.datasource.username=root
spring.datasource.password=           # Tu password de MySQL (vacío si no tienes)

# ==========================================
# APIs EXTERNAS (OPCIONAL)
# ==========================================
# Si no configuras las API keys, el sistema usa datos MOCK automáticamente

# AviationStack - Datos de vuelos en tiempo real
# Obtener en: https://aviationstack.com/
api.aviationstack.api-key=

# Amadeus - Ofertas de vuelos comerciales  
# Obtener en: https://developers.amadeus.com/
api.amadeus.client-id=
api.amadeus.client-secret=
```

### Paso 3: Ejecutar la Aplicación

```bash
# Desde la carpeta AirportApp/

# Windows (PowerShell)
.\mvnw.cmd spring-boot:run

# Linux/Mac
./mvnw spring-boot:run

# Alternativa: Compilar y ejecutar JAR
./mvnw clean package -DskipTests
java -jar target/AirportApp-0.0.1-SNAPSHOT.jar
```

✅ **La API estará disponible en:** `http://localhost:8080`

---

## 📡 API Endpoints

### 🎫 Billetes (Tickets)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/api/tickets` | Comprar un billete |
| `GET` | `/api/tickets/{id}` | Obtener billete por ID |
| `GET` | `/api/tickets/reference/{ref}` | Buscar por referencia de reserva |
| `GET` | `/api/tickets/user/{userId}` | Obtener billetes de un usuario |
| `GET` | `/api/tickets/flight/{flightIATA}` | Obtener billetes de un vuelo |
| `PATCH` | `/api/tickets/{id}` | Actualizar billete |
| `PATCH` | `/api/tickets/{id}/cancel` | Cancelar billete |
| `DELETE` | `/api/tickets/{id}` | Eliminar billete |

### ✈️ Vuelos (Flights)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/flights` | Obtener todos los vuelos (cached) |
| `GET` | `/api/flights?forceRefresh=true` | Forzar actualización de vuelos |
| `GET` | `/api/flights/refresh` | Refrescar datos de vuelos |
| `GET` | `/api/flights/offers?origin=MAD&destination=BCN&departureDate=2026-02-15&adults=1` | Buscar ofertas |

---

## 🔄 Cómo Funciona el Sistema de Vuelos

### Flujo de Datos

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Frontend      │────▶│  FlightController │────▶│  FlightService  │
│   (React)       │     │                  │     │                 │
└─────────────────┘     └──────────────────┘     └────────┬────────┘
                                                          │
                    ┌─────────────────────────────────────┼─────────────────────────────────────┐
                    │                                     │                                     │
                    ▼                                     ▼                                     ▼
           ┌─────────────────┐                ┌─────────────────┐                ┌─────────────────┐
           │  ¿API Key válida?│                │  ¿Cache válido?  │                │   Generar Mock  │
           │  ───────────────│                │   (< 30 min)     │                │   Data          │
           │  Sí → AviationStack              │  ───────────────│                │  ───────────────│
           │  API Call       │                │  Sí → Retornar   │                │  20 vuelos      │
           └─────────────────┘                │  desde cache     │                │  simulados      │
                                              └─────────────────┘                └─────────────────┘
```

### Estados de Vuelos Mock

Los vuelos se generan con estados **relativos a la hora actual**:

| Estado | Cantidad | Descripción | Datos GPS |
|--------|----------|-------------|-----------|
| `landed` | 7 vuelos | Aterrizados (salieron hace 2-5h) | ❌ No |
| `active` | 6 vuelos | En vuelo ahora mismo | ✅ Sí (live) |
| `scheduled` | 7 vuelos | Programados (salen en 0.5-4h) | ❌ No |

### Datos Live de Vuelos Activos

Los vuelos con `flight_status: "active"` incluyen coordenadas GPS en tiempo real:

```json
{
  "flight_status": "active",
  "live": {
    "latitude": 45.234,
    "longitude": 2.456,
    "altitude": 37000,
    "speed": 520,
    "direction": 45.5,
    "is_ground": false
  }
}
```

---

## 📋 Ejemplos de Uso con cURL

### Obtener Todos los Vuelos

```bash
curl http://localhost:8080/api/flights
```

### Forzar Actualización de Vuelos

```bash
curl "http://localhost:8080/api/flights?forceRefresh=true"
```

### Comprar un Billete

```bash
curl -X POST http://localhost:8080/api/tickets \
  -H "Content-Type: application/json" \
  -d '{
    "ownerUserId": "user-123",
    "flightNumber": "IB1077",
    "flightIATA": "IB1077",
    "airlineName": "Iberia",
    "airlineIATA": "IB",
    "departureAirport": "Madrid-Barajas",
    "departureIATA": "MAD",
    "departureCity": "Madrid",
    "departureDate": "2026-02-15",
    "departureTime": "10:30",
    "arrivalAirport": "Barcelona-El Prat",
    "arrivalIATA": "BCN",
    "arrivalCity": "Barcelona",
    "arrivalDate": "2026-02-15",
    "arrivalTime": "11:45",
    "passengerName": "Juan García",
    "passengerDocument": "12345678A",
    "seatNumber": "14A",
    "ticketClass": "ECONOMY",
    "price": 89.99,
    "currency": "EUR"
  }'
```

### Respuesta Exitosa

```json
{
  "success": true,
  "message": "Ticket creado exitosamente",
  "data": {
    "id": 1,
    "bookingReference": "A1B2C3",
    "ticketStatus": "CONFIRMED",
    "flightNumber": "IB1077",
    "passengerName": "Juan García",
    "seatNumber": "14A",
    "price": 89.99,
    "createdAt": "2026-01-31T18:30:00"
  }
}
```

### Obtener Billetes de un Usuario

```bash
curl http://localhost:8080/api/tickets/user/user-123
```

### Cancelar un Billete

```bash
curl -X PATCH http://localhost:8080/api/tickets/1/cancel
```

---

## ⚙️ Configuración Avanzada

### Variables de Configuración

| Propiedad | Valor Default | Descripción |
|-----------|---------------|-------------|
| `server.port` | 8080 | Puerto del servidor |
| `spring.jpa.hibernate.ddl-auto` | update | Estrategia de creación de tablas |
| `spring.jpa.show-sql` | false | Mostrar queries SQL en consola |
| `api.aviationstack.base-url` | https://api.aviationstack.com/v1 | URL base AviationStack |
| `api.amadeus.base-url` | https://test.api.amadeus.com/v2 | URL base Amadeus (test) |
| `api.amadeus.auth-url` | https://test.api.amadeus.com/v1/security/oauth2/token | URL auth Amadeus |

### Cache de Vuelos

- Los vuelos se cachean en memoria durante **30 minutos**
- Se puede forzar refresh con el parámetro `?forceRefresh=true`
- Sin API keys configuradas, siempre genera datos mock frescos

---

## 🔐 Seguridad

> ⚠️ **Estado actual:** API abierta para desarrollo

La configuración de Spring Security está preparada pero permisiva para desarrollo local:

```java
// SecurityConfig.java - Actual
http.authorizeHttpRequests(auth -> auth.anyRequest().permitAll())
```

**Para producción, se recomienda:**
1. Implementar autenticación JWT
2. Configurar roles y permisos
3. Habilitar HTTPS
4. Restringir CORS a dominios específicos

---

## 🐛 Solución de Problemas

### ❌ Error: "Communications link failure"
```
No se puede conectar a MySQL
```
**Solución:** 
1. Verifica que MySQL está corriendo: `systemctl status mysql` o revisar servicios de Windows
2. Comprueba las credenciales en `application.properties`
3. Asegúrate de que la base de datos `airport_db` existe

### ❌ Error: "No hay API key configurada"
```
INFO: No hay API key de AviationStack configurada - Usando datos MOCK
```
**Esto es normal.** El sistema funciona perfectamente con datos simulados sin necesidad de API keys.

### ❌ Los vuelos no aparecen en el mapa
**Causa:** Solo los vuelos con `flight_status: "active"` tienen datos `live` con coordenadas GPS.

**Solución:** Fuerza una actualización: `GET /api/flights?forceRefresh=true`

### ❌ Error de CORS
**Solución:** El backend ya tiene CORS configurado para `http://localhost:5173`. Si usas otro puerto, edita `WebConfig.java`.

---

## 📊 Rutas de Vuelos Mock

El sistema genera vuelos entre estos aeropuertos europeos:

| Código | Aeropuerto | Ciudad |
|--------|------------|--------|
| MAD | Madrid-Barajas | Madrid |
| BCN | Barcelona-El Prat | Barcelona |
| LHR | London Heathrow | Londres |
| CDG | Paris CDG | París |
| FRA | Frankfurt | Frankfurt |
| AMS | Amsterdam Schiphol | Ámsterdam |
| FCO | Rome Fiumicino | Roma |
| MUC | Munich | Múnich |
| LIS | Lisbon | Lisboa |
| VIE | Vienna | Viena |

---

## 📝 Licencia

MIT License - Proyecto educativo

---

## 👥 Equipo

Desarrollado por **Galácticos** 🚀
