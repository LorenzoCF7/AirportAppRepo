// Simulador de vuelos en tiempo real con transiciones automáticas de estado

import { getAirportCoordinates } from '../constants/airports';

class FlightSimulator {
  constructor() {
    this.flights = new Map(); // Vuelos activos: id -> flightData
    this.scheduledFlights = new Map(); // Vuelos programados: id -> flightData
    this.landedFlights = new Map(); // Vuelos aterrizados: id -> flightData
    this.simulationInterval = null;
    this.isRunning = false;
  }

  // Inicializa simulador con todos los vuelos (clasifica automáticamente por estado)
  initializeFlights(flightsData) {
    console.log('🎮 Inicializando simulador con', flightsData.length, 'vuelos');

    flightsData.forEach(flight => {
      const flightId = flight.id || flight.flightNumber;

      if (flight.flight_status === 'active' && flight.live) {
        this._initializeActiveFlight(flight, flightId);
      } else if (flight.flight_status === 'scheduled') {
        this.scheduledFlights.set(flightId, flight);
        console.log(`  🕐 ${flight.flightNumber}: Programado para ${new Date(flight.departure.scheduled).toLocaleTimeString()}`);
      } else if (flight.flight_status === 'landed') {
        this.landedFlights.set(flightId, flight);
        console.log(`  ✅ ${flight.flightNumber}: Aterrizado`);
      }
    });

    console.log('✅ Simulador inicializado:');
    console.log(`   - Activos: ${this.flights.size}`);
    console.log(`   - Programados: ${this.scheduledFlights.size}`);
    console.log(`   - Aterrizados: ${this.landedFlights.size}`);
  }

  // Inicializa un vuelo activo con datos de simulación
  _initializeActiveFlight(flight, flightId) {
    const departureTime = new Date(flight.departure?.scheduled || Date.now() - 3600000).getTime();
    const arrivalTime = new Date(flight.arrival?.estimated || flight.arrival?.scheduled || Date.now() + 3600000).getTime();

    const now = Date.now();
    const totalDuration = arrivalTime - departureTime;
    const elapsedTime = now - departureTime;
    let realProgress = Math.max(0.1, Math.min(0.95, elapsedTime / totalDuration));

    // Obtener coordenadas de aeropuertos (con fallback a coordenadas aleatorias)
    let originCoords = getAirportCoordinates(flight.departure?.iata);
    let destCoords = getAirportCoordinates(flight.arrival?.iata);

    // Si no encontramos las coordenadas, usar posiciones aleatorias pero realistas
    if (!originCoords || !destCoords) {
      console.warn(`  ⚠️ ${flight.flightNumber}: Aeropuertos desconocidos (${flight.departure?.iata} / ${flight.arrival?.iata}) - Usando ruta simulada`);

      // Generar coordenadas aleatorias en rangos realistas
      originCoords = originCoords || {
        lat: -60 + Math.random() * 120,  // Entre -60 y 60 grados
        lng: -180 + Math.random() * 360  // Entre -180 y 180 grados
      };
      destCoords = destCoords || {
        lat: -60 + Math.random() * 120,
        lng: -180 + Math.random() * 360
      };

      // Asegurar distancia mínima realista (al menos 500km de separación)
      const distance = Math.sqrt(
        Math.pow(destCoords.lat - originCoords.lat, 2) +
        Math.pow(destCoords.lng - originCoords.lng, 2)
      );

      if (distance < 5) { // Si están muy cerca, separar más
        destCoords.lat += 5;
        destCoords.lng += 5;
      }
    }

    // Calcular posición actual
    const currentLat = originCoords.lat + (destCoords.lat - originCoords.lat) * realProgress;
    const currentLng = originCoords.lng + (destCoords.lng - originCoords.lng) * realProgress;

    // Calcular dirección
    const deltaLat = destCoords.lat - currentLat;
    const deltaLng = destCoords.lng - currentLng;
    const direction = (Math.atan2(deltaLng, deltaLat) * 180 / Math.PI + 360) % 360;

    const speedKmh = flight.live?.speed || 500;
    const altitude = flight.live?.altitude || 35000;

    // Crear objeto live con coordenadas GPS actualizadas
    const updatedLive = {
      ...(flight.live || {}),
      latitude: currentLat,
      longitude: currentLng,
      altitude: altitude,
      speed: speedKmh,
      direction: direction,
      is_ground: false,
      updated: new Date().toISOString()
    };

    // Almacenar vuelo con datos completos
    const storedFlight = {
      ...flight,
      live: updatedLive,
      simulation: {
        originLat: originCoords.lat,
        originLng: originCoords.lng,
        destLat: destCoords.lat,
        destLng: destCoords.lng,
        currentLat,
        currentLng,
        speedKmh,
        altitude,
        direction,
        departureTime,
        arrivalTime,
        realProgress,
        lastUpdate: Date.now()
      }
    };

    this.flights.set(flightId, storedFlight);

    const arrivalTimeStr = new Date(arrivalTime).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    console.log(`  ✈️ ${flight.flightNumber}: ${flight.departure?.iata} → ${flight.arrival?.iata} | Progreso: ${(realProgress * 100).toFixed(0)}% | Llega: ${arrivalTimeStr}`);
  }


  // Inicia simulación con actualizaciones automáticas
  start(updateCallback, intervalMs = 2000) {
    if (this.isRunning) {
      console.warn('⚠️ Simulador ya está corriendo');
      return;
    }

    console.log('▶️ Iniciando simulador automático (actualización cada', intervalMs / 1000, 'segundos)');
    this.isRunning = true;

    let updateCount = 0;

    this.simulationInterval = setInterval(() => {
      this._updateSimulation();
      updateCount++;

      if (updateCount % 15 === 0) {
        const now = new Date();
        console.log(`🔄 Simulador [${now.toLocaleTimeString('es-ES')}]: ${this.flights.size} activos | ${this.scheduledFlights.size} programados | ${this.landedFlights.size} aterrizados`);

        // Mostrar progreso de vuelos activos
        this.flights.forEach(flight => {
          const arrivalTime = new Date(flight.simulation.arrivalTime);
          const minutesRemaining = Math.round((arrivalTime - now) / 60000);
          console.log(`  ✈️ ${flight.flightNumber}: ${(flight.simulation.realProgress * 100).toFixed(1)}% | Llega en ${minutesRemaining}min (${arrivalTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })})`);
        });
      }

      if (updateCallback) {
        updateCallback(this.getAllFlights());
      }
    }, intervalMs);
  }

  // Actualiza simulación: mover activos, activar programados, aterrizar llegadas
  _updateSimulation() {
    const now = Date.now();

    // 1. Activar vuelos programados que ya deben despegar
    this._checkScheduledFlights(now);

    // 2. Actualizar posición de vuelos activos
    this._updateActiveFlights(now);

    // 3. Aterrizar vuelos que llegaron a destino
    this._checkArrivals(now);

    // 4. Actualizar sessionStorage con todos los vuelos actualizados
    this._updateSessionStorage();
  }

  // Verifica si vuelos programados deben activarse
  _checkScheduledFlights(now) {
    const toActivate = [];

    this.scheduledFlights.forEach((flight, flightId) => {
      const departureTime = new Date(flight.departure.scheduled).getTime();

      // Si ya pasó la hora de salida, activar el vuelo
      if (now >= departureTime) {
        toActivate.push({ flight, flightId });
      }
    });

    toActivate.forEach(({ flight, flightId }) => {
      console.log(`🛫 ${flight.flightNumber}: Despegando ahora (${flight.departure.iata} → ${flight.arrival.iata})`);

      // Crear datos GPS iniciales
      const originCoords = getAirportCoordinates(flight.departure.iata);
      const destCoords = getAirportCoordinates(flight.arrival.iata);

      if (originCoords && destCoords) {
        flight.live = {
          latitude: originCoords.lat,
          longitude: originCoords.lng,
          altitude: 1000, // Despegando
          speed: 250, // Velocidad inicial
          speed_horizontal: 250,
          speed_vertical: 30, // Subiendo
          direction: Math.atan2(destCoords.lng - originCoords.lng, destCoords.lat - originCoords.lat) * 180 / Math.PI,
          is_ground: false,
          updated: new Date().toISOString()
        };

        flight.flight_status = 'active';
        flight.flight_status_label = 'En Vuelo';

        this.scheduledFlights.delete(flightId);
        this._initializeActiveFlight(flight, flightId);

        // Actualizar sessionStorage con el nuevo estado
        this._updateStorageFlightStatus(flightId, 'active');

        // Mostrar notificación de despegue
        this._showNotification(
          '🛫 Vuelo Despegado',
          `El vuelo ${flight.flightNumber} ha despegado de ${flight.departure.airport || flight.departure.iata}`,
          'info'
        );
      }
    });
  }

  // Actualiza posición de vuelos activos
  _updateActiveFlights(now) {
    this.flights.forEach((flight, flightId) => {
      const sim = flight.simulation;

      // Calcular progreso REAL basado en tiempo transcurrido vs duración total
      const totalDuration = sim.arrivalTime - sim.departureTime; // Duración total del vuelo
      const elapsedTime = now - sim.departureTime; // Tiempo transcurrido desde despegue

      // Progreso real = tiempo transcurrido / duración total (permitir llegar a 100%)
      sim.realProgress = Math.max(0.01, Math.min(1.0, elapsedTime / totalDuration));

      // Calcular nueva posición basada en progreso real
      sim.currentLat = sim.originLat + (sim.destLat - sim.originLat) * sim.realProgress;
      sim.currentLng = sim.originLng + (sim.destLng - sim.originLng) * sim.realProgress;

      // Recalcular dirección
      const deltaLat = sim.destLat - sim.currentLat;
      const deltaLng = sim.destLng - sim.currentLng;
      sim.direction = (Math.atan2(deltaLng, deltaLat) * 180 / Math.PI + 360) % 360;

      // Actualizar datos GPS del vuelo
      flight.live.latitude = sim.currentLat;
      flight.live.longitude = sim.currentLng;
      flight.live.direction = sim.direction;
      flight.live.updated = new Date().toISOString();

      // Ajustar altitud según progreso
      if (sim.realProgress < 0.1) {
        // Despegue: subiendo
        sim.altitude = 1000 + (35000 * sim.realProgress / 0.1);
        flight.live.speed_vertical = 25;
      } else if (sim.realProgress > 0.9) {
        // Descenso
        sim.altitude = 35000 - ((35000 - 1000) * (sim.realProgress - 0.9) / 0.1);
        flight.live.speed_vertical = -25;
      } else {
        // Crucero
        sim.altitude += (Math.random() - 0.5) * 100;
        sim.altitude = Math.max(30000, Math.min(42000, sim.altitude));
        flight.live.speed_vertical = (Math.random() - 0.5) * 5;
      }

      flight.live.altitude = sim.altitude;

      // Variar velocidad ligeramente
      sim.speedKmh += (Math.random() - 0.5) * 10;
      sim.speedKmh = Math.max(400, Math.min(600, sim.speedKmh));
      flight.live.speed = sim.speedKmh;
      flight.live.speed_horizontal = sim.speedKmh;

      sim.lastUpdate = now;
    });
  }

  // Verifica si vuelos deben aterrizar
  _checkArrivals(now) {
    const toLand = [];

    this.flights.forEach((flight, flightId) => {
      const arrivalTime = flight.simulation.arrivalTime;
      const progress = flight.simulation.realProgress;

      // Aterrizar cuando:
      // 1. El progreso alcanza o supera 100% (llegó al destino)
      // 2. O si pasó la hora de llegada Y el progreso está muy avanzado (>95%)
      const shouldLand = progress >= 1.0 || (now >= arrivalTime && progress >= 0.95);

      if (shouldLand) {
        toLand.push({ flight, flightId });
      }
    });

    toLand.forEach(({ flight, flightId }) => {
      console.log(`🛬 ${flight.flightNumber}: Aterrizando en ${flight.arrival.iata}`);

      flight.flight_status = 'landed';
      flight.flight_status_label = 'Aterrizado';
      flight.live = null; // Quitar GPS
      flight.arrival.actual = new Date().toISOString();

      this.flights.delete(flightId);
      this.landedFlights.set(flightId, flight);

      // Actualizar sessionStorage con el nuevo estado
      this._updateStorageFlightStatus(flightId, 'landed');

      // Mostrar notificación de aterrizaje
      this._showNotification(
        '✈️ Vuelo Aterrizado',
        `El vuelo ${flight.flightNumber} ha aterrizado en ${flight.arrival.airport || flight.arrival.iata}`,
        'success'
      );
    });
  }

  // Actualiza estado de un vuelo en sessionStorage
  _updateStorageFlightStatus(flightId, newStatus) {
    try {
      const stored = sessionStorage.getItem('flight_tracker_data');
      if (!stored) return;

      const data = JSON.parse(stored);
      if (!data.data || !Array.isArray(data.data)) return;

      // Buscar el vuelo por múltiples criterios
      const flightIndex = data.data.findIndex(f => {
        const fId = f.id || f.flightNumber || f.flight?.iata;
        return fId === flightId ||
          f.flightNumber === flightId ||
          f.flight?.iata === flightId;
      });

      if (flightIndex === -1) {
        console.warn(`⚠️ Vuelo no encontrado en sessionStorage: ${flightId}`);
        return;
      }

      // Actualizar el estado del vuelo
      data.data[flightIndex].flight_status = newStatus;

      if (newStatus === 'landed') {
        data.data[flightIndex].flight_status_label = 'Aterrizado';
        data.data[flightIndex].live = null;
        data.data[flightIndex].arrival.actual = new Date().toISOString();
      } else if (newStatus === 'active') {
        data.data[flightIndex].flight_status_label = 'En Vuelo';
      }

      sessionStorage.setItem('flight_tracker_data', JSON.stringify(data));
      console.log(`💾 Estado actualizado en sessionStorage: ${flightId} → ${newStatus}`);
    } catch (error) {
      console.warn('⚠️ Error actualizando sessionStorage:', error.message);
    }
  }

  // Dispara evento de notificación para que la app lo capture
  _showNotification(title, message, type = 'info') {
    // Crear evento personalizado para que la app lo capture
    const event = new CustomEvent('flight-notification', {
      detail: { title, message, type }
    });
    window.dispatchEvent(event);
  }

  // Actualiza sessionStorage con todos los vuelos actualizados
  _updateSessionStorage() {
    try {
      const stored = sessionStorage.getItem('flight_tracker_data');
      if (!stored) return;

      const data = JSON.parse(stored);
      if (!data.data || !Array.isArray(data.data)) return;

      // Obtener todos los vuelos del simulador
      const allFlights = this.getAllFlights();

      // Actualizar cada vuelo en sessionStorage
      allFlights.forEach(updatedFlight => {
        const flightId = updatedFlight.id || updatedFlight.flightNumber || updatedFlight.flight?.iata;

        const index = data.data.findIndex(f => {
          const fId = f.id || f.flightNumber || f.flight?.iata;
          return fId === flightId || f.flightNumber === flightId || f.flight?.iata === flightId;
        });

        if (index !== -1) {
          // Reemplazar con el vuelo actualizado
          data.data[index] = updatedFlight;
        }
      });

      sessionStorage.setItem('flight_tracker_data', JSON.stringify(data));
    } catch (error) {
      console.warn('⚠️ Error actualizando sessionStorage:', error.message);
    }
  }


  // Detiene simulación
  stop() {
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
      this.simulationInterval = null;
      this.isRunning = false;
      console.log('⏸️ Simulador detenido');
    }
  }

  // Obtiene todos los vuelos (todos los estados)
  getAllFlights() {
    return [
      ...Array.from(this.flights.values()),
      ...Array.from(this.scheduledFlights.values()),
      ...Array.from(this.landedFlights.values())
    ];
  }

  // Obtiene solo vuelos activos
  getActiveFlights() {
    return Array.from(this.flights.values());
  }

  // Limpia todos los vuelos
  clear(stopSimulation = true) {
    if (stopSimulation) {
      this.stop();
    }
    this.flights.clear();
    this.scheduledFlights.clear();
    this.landedFlights.clear();
    console.log('🗑️ Simulador limpiado' + (stopSimulation ? ' y detenido' : ' (sigue corriendo)'));
  }

  // Obtiene estadísticas del simulador
  getStats() {
    return {
      totalFlights: this.flights.size + this.scheduledFlights.size + this.landedFlights.size,
      activeFlights: this.flights.size,
      scheduledFlights: this.scheduledFlights.size,
      landedFlights: this.landedFlights.size,
      isRunning: this.isRunning,
      avgSpeed: this._calculateAvgSpeed(),
      avgAltitude: this._calculateAvgAltitude()
    };
  }

  _calculateAvgSpeed() {
    if (this.flights.size === 0) return 0;
    let total = 0;
    this.flights.forEach(f => total += f.simulation.speedKmh);
    return Math.round(total / this.flights.size);
  }

  _calculateAvgAltitude() {
    if (this.flights.size === 0) return 0;
    let total = 0;
    this.flights.forEach(f => total += f.simulation.altitude);
    return Math.round(total / this.flights.size);
  }
}

// Exportar instancia única (singleton)
export const flightSimulator = new FlightSimulator();
