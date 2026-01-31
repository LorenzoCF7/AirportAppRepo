import { useState, useCallback } from 'react';
import { AlertCircle } from 'lucide-react';

import FlightSearch from '../FlightSearch/FlightSearch';
import FlipCard from '../FlipCard/FlipCard';
import { flightService } from '../../services/flightService';
import styles from './SearchView.module.css';

const SearchView = () => {
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  // React 19: useCallback para memoizar funciones
  const handleSuggestionsRequest = useCallback(async (type, value) => {
    if (value.trim().length < 2) return [];
    
    try {
      // Obtener todos los vuelos (mixtos) y filtrar localmente
      const response = await flightService.getAllFlights();
      const allFlights = response.data || [];
      
      const searchTerm = value.toUpperCase().trim();
      
      if (type === 'flight') {
        // Filtrar por número de vuelo
        const filtered = allFlights.filter(flight => {
          const flightNum = flight.flightNumber?.toUpperCase() || '';
          const flightIata = flight.flight?.iata?.toUpperCase() || '';
          return flightNum.includes(searchTerm) || flightIata.includes(searchTerm);
        });
        
        return filtered.slice(0, 8); // Máximo 8 sugerencias
      } else {
        // Filtrar por aeropuerto (usar los códigos IATA correctos)
        const filtered = allFlights.filter(flight => {
          const departureIata = (flight.departure?.iata || '').toUpperCase();
          const arrivalIata = (flight.arrival?.iata || '').toUpperCase();
          const departureCity = (flight.departure?.city || '').toUpperCase();
          const arrivalCity = (flight.arrival?.city || '').toUpperCase();
          const departureAirport = (flight.departure?.airport || '').toUpperCase();
          const arrivalAirport = (flight.arrival?.airport || '').toUpperCase();
          
          return departureIata.includes(searchTerm) || 
                 arrivalIata.includes(searchTerm) ||
                 departureCity.includes(searchTerm) ||
                 arrivalCity.includes(searchTerm) ||
                 departureAirport.includes(searchTerm) ||
                 arrivalAirport.includes(searchTerm);
        });
        
        return filtered.slice(0, 8);
      }
    } catch (err) {
      console.error('Error getting suggestions:', err);
      return [];
    }
  }, []);

  const handleSearch = useCallback(async (type, value) => {
    try {
      setLoading(true);
      setError(null);
      setHasSearched(true);
      
      let response;
      if (type === 'flight') {
        response = await flightService.searchFlight(value);
      } else {
        response = await flightService.getFlightsByAirport(value);
      }
      
      setFlights(response.data || []);
    } catch (err) {
      setError('No se encontraron vuelos. Verifica el código ingresado.');
      console.error('Error searching flights:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleClearSearch = useCallback(() => {
    setFlights([]);
    setHasSearched(false);
    setError(null);
  }, []);

  return (
    <div className={styles.searchView}>
      <div className={styles.viewHeader}>
        <div>
          <h1>Búsqueda de Vuelos</h1>
          <p>Encuentra información detallada de cualquier vuelo o aeropuerto</p>
        </div>
      </div>

      <FlightSearch 
        onSearch={handleSearch} 
        onClear={handleClearSearch}
        onSuggestionsRequest={handleSuggestionsRequest}
      />

      {/* React 19: Renderizado condicional optimizado */}
      {error && (
        <div className={styles.errorMessage}>
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {hasSearched && (
        <div className={styles.contentSection}>
          <div className={styles.sectionHeader}>
            <h2>Resultados de Búsqueda</h2>
            <span>{flights.length} vuelos encontrados</span>
          </div>

          {loading && (
            <div className={styles.loadingContainer}>
              <div className={styles.loadingSpinner}></div>
              <p>Buscando vuelos...</p>
            </div>
          )}
          
          {!loading && flights.length === 0 && (
            <div className={styles.noResults}>
              <p>No se encontraron vuelos con los criterios especificados</p>
            </div>
          )}
          
          {!loading && flights.length > 0 && (
            <div className={styles.flightsGrid}>
              {flights.map((flight, index) => (
                <FlipCard
                  key={`${flight.flight?.iata}-${index}`}
                  flight={flight}
                  index={index}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchView;
