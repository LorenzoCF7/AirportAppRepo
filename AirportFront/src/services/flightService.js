import axios from 'axios';
import { getAirportCoordinates } from '../constants/airports';
import { flightSimulator } from './flightSimulator';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

// Cliente HTTP para el backend
const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/flights`,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' }
});

console.log('✈️ Flight Tracker - Sistema de Vuelos conectado al Backend');

// Servicio principal de vuelos
export const flightService = {
  // Obtiene vuelos (desde el backend)
  async getAllFlights(forceRefresh = false) {
    console.log('✈️ Obteniendo vuelos desde el backend...');
    
    try {
      const response = await apiClient.get('', {
        params: { forceRefresh }
      });
      
      if (response.data.success) {
        const flightData = response.data.data;
        console.log(`✅ ${flightData.data.length} vuelos obtenidos (source: ${flightData.source})`);
        return flightData;
      }
      
      throw new Error('Error obteniendo vuelos');
    } catch (error) {
      console.error('❌ Error obteniendo vuelos:', error);
      throw error;
    }
  },

  // Fuerza actualización de vuelos
  async refreshFlights() {
    console.log('🔄 Actualizando vuelos...');
    
    try {
      const response = await apiClient.get('/refresh');
      
      if (response.data.success) {
        const flightData = response.data.data;
        console.log(`✅ ${flightData.data.length} vuelos actualizados`);
        return flightData;
      }
      
      throw new Error('Error actualizando vuelos');
    } catch (error) {
      console.error('❌ Error actualizando vuelos:', error);
      throw error;
    }
  },

  // Busca vuelo por número de vuelo (IATA)
  async searchFlight(flightNumber) {
    try {
      const response = await this.getAllFlights();
      const searchTerm = flightNumber.toUpperCase().trim();
      
      console.log('🔍 Buscando vuelo:', searchTerm);
      console.log('📊 Total vuelos disponibles:', response.data.length);
      
      const filtered = response.data.filter(flight => {
        const iata = (flight.flight?.iata || '').toUpperCase();
        const icao = (flight.flight?.icao || '').toUpperCase();
        const num = (flight.flightNumber || '').toUpperCase();
        return iata.includes(searchTerm) || icao.includes(searchTerm) || num.includes(searchTerm);
      });
      
      console.log('✅ Vuelos encontrados:', filtered.length);
      return { data: filtered, fromStorage: false };
    } catch (error) {
      console.error('❌ Error en búsqueda:', error.message);
      return { data: [], error: error.message };
    }
  },

  // Busca vuelos por código de aeropuerto
  async getFlightsByAirport(airportCode) {
    try {
      const response = await this.getAllFlights();
      const searchTerm = airportCode.toUpperCase().trim();
      
      console.log('🔍 Buscando por aeropuerto:', searchTerm);
      
      const filtered = response.data.filter(flight => {
        const depIata = (flight.departure?.iata || '').toUpperCase();
        const arrIata = (flight.arrival?.iata || '').toUpperCase();
        const depCity = (flight.departure?.city || '').toUpperCase();
        const arrCity = (flight.arrival?.city || '').toUpperCase();
        return depIata.includes(searchTerm) || arrIata.includes(searchTerm) ||
               depCity.includes(searchTerm) || arrCity.includes(searchTerm);
      });
      
      console.log('✅ Vuelos encontrados:', filtered.length);
      return { data: filtered, fromStorage: false };
    } catch (error) {
      console.error('❌ Error en búsqueda:', error.message);
      return { data: [], error: error.message };
    }
  },

  // Normaliza los datos de un vuelo para asegurar consistencia
  _normalizeFlightData(flight) {
    return {
      ...flight,
      // Asegurar que flightNumber existe (usado por el simulador)
      flightNumber: flight.flightNumber || flight.flight?.iata || flight.flight?.number || 'UNKNOWN',
      // Asegurar que id existe
      id: flight.id || flight.flight?.iata || `flight-${Math.random().toString(36).substr(2, 9)}`
    };
  },

  // Obtiene vuelos activos para el mapa en tiempo real
  async getActiveFlights(forceRefresh = false) {
    try {
      const response = await this.getAllFlights(forceRefresh);
      
      // Normalizar TODOS los vuelos
      const allFlights = response.data.map(f => this._normalizeFlightData(f));
      
      // Filtrar solo vuelos activos con datos de posición
      const activeFlights = allFlights.filter(f => 
        f.flight_status === 'active' && f.live
      );
      
      console.log(`✈️ Vuelos activos para el mapa: ${activeFlights.length}`);
      
      // Inicializar simulador con TODOS los vuelos (para manejar transiciones)
      if (allFlights.length > 0) {
        flightSimulator.clear();
        flightSimulator.initializeFlights(allFlights);
        flightSimulator.start(null, 2000); // Iniciar actualización automática
        console.log('📊 Simulador iniciado con todos los vuelos');
      }
      
      return {
        data: activeFlights,
        pagination: {
          limit: activeFlights.length,
          offset: 0,
          count: activeFlights.length,
          total: activeFlights.length
        },
        fromStorage: response.fromStorage,
        source: 'aviationstack-adapted'
      };
    } catch (error) {
      console.error('❌ Error obteniendo vuelos activos:', error);
      return { data: [], error: error.message };
    }
  },

  // Busca un vuelo por su código IATA
  findFlightByIATA(flights, flightIATA) {
    if (!flights || !Array.isArray(flights)) return null;
    return flights.find(f => f.flight?.iata === flightIATA) || null;
  },

  // Obtiene posición actual de un vuelo (para el mapa)
  getFlightCurrentPosition(flight) {
    if (!flight) return null;

    const depIata = flight.departure?.iata;
    const arrIata = flight.arrival?.iata;
    const status = flight.flight_status;

    const depCoords = getAirportCoordinates(depIata);
    const arrCoords = getAirportCoordinates(arrIata);

    if (!depCoords || !arrCoords) return null;

    // Si está en tierra, devolver posición del aeropuerto correspondiente
    if (status === 'scheduled') {
      return { lat: depCoords.lat, lng: depCoords.lng, progress: 0 };
    }
    if (status === 'landed') {
      return { lat: arrCoords.lat, lng: arrCoords.lng, progress: 1 };
    }

    // Si está en vuelo, calcular posición basada en el simulador
    const simulated = flightSimulator.getFlightState(flight.flight?.iata);
    if (simulated) {
      const progress = simulated.progress || 0.5;
      return {
        lat: depCoords.lat + (arrCoords.lat - depCoords.lat) * progress,
        lng: depCoords.lng + (arrCoords.lng - depCoords.lng) * progress,
        progress
      };
    }

    // Fallback: mitad del trayecto
    return {
      lat: (depCoords.lat + arrCoords.lat) / 2,
      lng: (depCoords.lng + arrCoords.lng) / 2,
      progress: 0.5
    };
  },

  // Obtiene el ángulo de rotación del avión
  getFlightBearing(flight) {
    if (!flight) return 0;

    const depCoords = getAirportCoordinates(flight.departure?.iata);
    const arrCoords = getAirportCoordinates(flight.arrival?.iata);

    if (!depCoords || !arrCoords) return 0;

    const dLng = arrCoords.lng - depCoords.lng;
    const y = Math.sin(dLng * Math.PI / 180) * Math.cos(arrCoords.lat * Math.PI / 180);
    const x = Math.cos(depCoords.lat * Math.PI / 180) * Math.sin(arrCoords.lat * Math.PI / 180) -
              Math.sin(depCoords.lat * Math.PI / 180) * Math.cos(arrCoords.lat * Math.PI / 180) * Math.cos(dLng * Math.PI / 180);
    
    return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
  },

  // Limpia el storage (para desarrollo)
  clearStorage() {
    console.log('🗑️ Limpiando cache de vuelos...');
    // El cache ahora está en el backend
  }
};
