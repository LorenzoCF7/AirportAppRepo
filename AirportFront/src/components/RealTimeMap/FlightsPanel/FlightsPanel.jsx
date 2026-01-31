import { memo } from 'react';
import { Plane } from 'lucide-react';
import FlightListItem from '../FlightListItem';
import styles from '../RealTimeMap.module.css';

// Estado vacío cuando no hay vuelos activos
const EmptyState = () => (
  <div className={styles.noActiveFlights}>
    <Plane size={32} />
    <p className={styles.noActiveFlightsText}>Sin vuelos con coordenadas GPS</p>
    <small className={styles.noActiveFlightsHint}>
      Revisa la consola del navegador para ver los datos que devuelve la API.
      <br/>
      Si los vuelos no tienen el campo "live" con lat/lon, puede ser limitación del plan gratuito.
    </small>
  </div>
);

// Panel lateral con lista de vuelos en vivo
const FlightsPanel = memo(({ flights, followingFlight, onFlightClick }) => {
  // Verifica si un vuelo está siendo seguido
  const isFlightFollowing = (flight) => {
    if (!followingFlight) return false;
    const followId = followingFlight.id || followingFlight.flightNumber;
    const flightId = flight.id || flight.flightNumber;
    return followId === flightId;
  };

  return (
    <div className={styles.flightsPanel}>
      <div className={styles.panelHeader}>
        <Plane size={20} />
        <h3>Vuelos en Vivo ({flights.length})</h3>
      </div>
      
      <div className={styles.flightsList}>
        {flights.length === 0 ? (
          <EmptyState />
        ) : (
          flights.map((flight, index) => (
            <FlightListItem
              key={flight.id || flight.flightNumber || `flight-${index}`}
              flight={flight}
              isFollowing={isFlightFollowing(flight)}
              onClick={onFlightClick}
            />
          ))
        )}
      </div>
    </div>
  );
});

FlightsPanel.displayName = 'FlightsPanel';

export default FlightsPanel;
