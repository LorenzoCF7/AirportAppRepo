// Servicio de vuelos comerciales (ofertas de compra)

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

// Cliente HTTP para el backend
const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/flights`,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' }
});

class CommercialFlightService {
  constructor() {
    this.cache = new Map();
    this.featuredFlightsCache = null;
    this.featuredFlightsCacheTime = null;
  }

  // Transforma vuelos de tracking (AviationStack) a formato de tienda (comercial)
  _transformToCommercialFormat(trackingFlights) {
    return trackingFlights.map((flight, index) => {
      // Generar precios aleatorios pero consistentes basados en el ID
      const seed = flight.flight?.iata?.charCodeAt(0) || index;
      const basePrice = 50 + (seed * 7) % 150;
      
      // Parsear fechas y horas
      const depScheduled = flight.departure?.scheduled || '';
      const arrScheduled = flight.arrival?.scheduled || '';
      const depTime = depScheduled.split('T')[1]?.substring(0, 5) || '12:00';
      const arrTime = arrScheduled.split('T')[1]?.substring(0, 5) || '14:00';
      
      // Calcular duración aproximada
      const depHour = parseInt(depTime.split(':')[0]) || 12;
      const arrHour = parseInt(arrTime.split(':')[0]) || 14;
      const durationHours = Math.abs(arrHour - depHour) || 2;
      const durationMinutes = Math.floor(Math.random() * 45);

      return {
        id: flight.flight?.iata || `FL-${index}`,
        flightIATA: flight.flight?.iata || `XX${1000 + index}`,
        flightNumber: flight.flight?.number || flight.flight?.iata || `${1000 + index}`,
        airline: {
          name: flight.airline?.name || 'Aerolínea',
          iata: flight.airline?.iata || 'XX'
        },
        origin: {
          iata: flight.departure?.iata || 'MAD',
          city: flight.departure?.airport?.split(' ')[0] || 'Madrid',
          airport: flight.departure?.airport || 'Aeropuerto'
        },
        destination: {
          iata: flight.arrival?.iata || 'BCN',
          city: flight.arrival?.airport?.split(' ')[0] || 'Barcelona',
          airport: flight.arrival?.airport || 'Aeropuerto'
        },
        departure: {
          date: depScheduled.split('T')[0] || new Date().toISOString().split('T')[0],
          time: depTime,
          dateTime: depScheduled
        },
        arrival: {
          date: arrScheduled.split('T')[0] || new Date().toISOString().split('T')[0],
          time: arrTime,
          dateTime: arrScheduled
        },
        duration: {
          hours: durationHours,
          minutes: durationMinutes,
          formatted: `${durationHours}h ${durationMinutes}m`
        },
        prices: {
          economy: basePrice,
          business: basePrice * 2.5,
          first: basePrice * 4
        },
        availableSeats: {
          economy: 50 + Math.floor(Math.random() * 100),
          business: 10 + Math.floor(Math.random() * 20),
          first: 5 + Math.floor(Math.random() * 10)
        },
        // Mantener datos originales para la compra
        _originalFlight: flight
      };
    });
  }

  // Obtiene vuelos destacados (vuelos en tiempo real para la tienda)
  async getFeaturedFlights(forceRefresh = false) {
    console.log('🛒 Obteniendo vuelos destacados...');

    // Verificar cache (15 minutos)
    const now = Date.now();
    const cacheMaxAge = 15 * 60 * 1000;
    
    if (!forceRefresh && this.featuredFlightsCache && this.featuredFlightsCacheTime) {
      if (now - this.featuredFlightsCacheTime < cacheMaxAge) {
        console.log('✅ Usando vuelos destacados de cache');
        return this.featuredFlightsCache;
      }
    }

    try {
      const response = await apiClient.get('', {
        params: { forceRefresh }
      });

      if (response.data.success) {
        const trackingData = response.data.data;
        
        // Transformar a formato comercial
        const commercialFlights = this._transformToCommercialFormat(trackingData.data || []);
        
        const result = {
          data: commercialFlights,
          source: trackingData.source,
          fromCache: trackingData.fromCache
        };
        
        // Guardar en cache
        this.featuredFlightsCache = result;
        this.featuredFlightsCacheTime = now;
        
        console.log(`✅ ${commercialFlights.length} vuelos destacados obtenidos`);
        return result;
      }

      throw new Error('Error obteniendo vuelos destacados');
    } catch (error) {
      console.error('❌ Error obteniendo vuelos destacados:', error.message);
      throw error;
    }
  }

  // Busca ofertas de vuelos
  async searchFlightOffers(origin, destination, departureDate, adults = 1, cabinClass = 'ECONOMY') {
    console.log(`🔍 Buscando vuelos: ${origin} → ${destination} (${departureDate})`);

    // Verificar cache
    const cacheKey = `${origin}-${destination}-${departureDate}-${adults}-${cabinClass}`;
    const cached = this._getCachedData(cacheKey);
    if (cached) {
      console.log('✅ Usando datos de cache');
      return cached;
    }

    try {
      const response = await apiClient.get('/offers', {
        params: {
          origin,
          destination,
          departureDate,
          adults,
          cabinClass
        }
      });

      if (response.data.success) {
        const offers = response.data.data;
        console.log(`✅ ${offers.data?.length || 0} ofertas encontradas`);
        
        // Guardar en cache
        this._setCachedData(cacheKey, offers);
        
        return offers;
      }

      throw new Error('No se encontraron ofertas');
    } catch (error) {
      console.error('❌ Error buscando ofertas:', error.message);
      throw error;
    }
  }

  // Formatea una oferta para mostrar
  formatOffer(offer) {
    if (!offer) return null;

    const itinerary = offer.itineraries?.[0];
    const segment = itinerary?.segments?.[0];
    
    if (!segment) return null;

    return {
      id: offer.id,
      price: {
        total: parseFloat(offer.price?.total || 0),
        currency: offer.price?.currency || 'EUR'
      },
      departure: {
        iata: segment.departure?.iataCode,
        time: segment.departure?.at
      },
      arrival: {
        iata: segment.arrival?.iataCode,
        time: segment.arrival?.at
      },
      airline: {
        code: segment.operating?.carrierCode,
        name: segment.operating?.carrierName || segment.operating?.carrierCode
      },
      flightNumber: `${segment.operating?.carrierCode}${segment.number}`,
      duration: itinerary.duration,
      stops: itinerary.segments?.length - 1 || 0
    };
  }

  // Cache methods
  _getCachedData(key) {
    try {
      const cached = this.cache.get(key);
      if (!cached) return null;

      const now = Date.now();
      const cacheAge = now - cached.timestamp;
      const maxAge = 12 * 60 * 60 * 1000; // 12 horas

      if (cacheAge < maxAge) {
        return cached.data;
      } else {
        this.cache.delete(key);
        return null;
      }
    } catch (error) {
      return null;
    }
  }

  _setCachedData(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  clearCache() {
    this.cache.clear();
    console.log('🗑️ Cache de ofertas limpiado');
  }
}

// Exportar instancia singleton
export const commercialFlightService = new CommercialFlightService();
