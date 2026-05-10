import { memo } from 'react';
import { Plane, Search } from 'lucide-react';
import FlightListItem from '../FlightListItem';
import styles from '../RealTimeMap.module.css';

const FlightsPanel = memo(({
  flights,
  followingFlight,
  onFlightClick,
  searchQuery,
  onSearchChange,
  onSearch,
  loading,
  hasSearched,
  notFound,
}) => {
  const isFlightFollowing = (flight) => {
    if (!followingFlight) return false;
    return (followingFlight.id || followingFlight.flightNumber) === (flight.id || flight.flightNumber);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className={styles.noActiveFlights}>
          <Plane size={32} className={styles.spinningPlane} />
          <p className={styles.noActiveFlightsText}>Buscando vuelo...</p>
        </div>
      );
    }

    if (notFound) {
      return (
        <div className={styles.noActiveFlights}>
          <Search size={32} style={{ color: '#ef4444', opacity: 0.7 }} />
          <p className={styles.noActiveFlightsText}>Vuelo no encontrado</p>
          <small className={styles.noActiveFlightsHint}>
            No se encontró &quot;{searchQuery}&quot;. Prueba con otro número de vuelo o código IATA.
          </small>
        </div>
      );
    }

    if (!hasSearched) {
      return (
        <div className={styles.noActiveFlights}>
          <Search size={32} style={{ color: '#667eea', opacity: 0.6 }} />
          <p className={styles.noActiveFlightsText}>Busca un vuelo</p>
          <small className={styles.noActiveFlightsHint}>
            Introduce un número de vuelo para verlo en el mapa en tiempo real.
            <br /><br />
            Ejemplos: <strong>LH1088</strong>, <strong>IB1001</strong>, <strong>VY1110</strong>
          </small>
        </div>
      );
    }

    if (flights.length === 0) {
      return (
        <div className={styles.noActiveFlights}>
          <Plane size={32} />
          <p className={styles.noActiveFlightsText}>Sin posición GPS</p>
          <small className={styles.noActiveFlightsHint}>
            El vuelo no tiene coordenadas GPS disponibles en este momento.
          </small>
        </div>
      );
    }

    return flights.map((flight, index) => (
      <FlightListItem
        key={flight.id || flight.flightNumber || `flight-${index}`}
        flight={flight}
        isFollowing={isFlightFollowing(flight)}
        onClick={onFlightClick}
      />
    ));
  };

  return (
    <div className={styles.flightsPanel}>
      <div className={styles.panelHeader}>
        <Plane size={20} />
        <h3>Buscar Vuelo</h3>
      </div>

      <form onSubmit={handleSubmit} className={styles.searchForm}>
        <input
          type="text"
          value={searchQuery}
          onChange={e => onSearchChange(e.target.value)}
          placeholder="Número de vuelo (ej: LH1088)"
          className={styles.searchInput}
          disabled={loading}
          autoComplete="off"
          spellCheck="false"
        />
        <button
          type="submit"
          className={styles.searchButton}
          disabled={loading || !searchQuery.trim()}
          aria-label="Buscar vuelo"
        >
          {loading
            ? <span className={styles.searchSpinner} />
            : <Search size={16} />
          }
        </button>
      </form>

      <div className={styles.flightsList}>
        {renderContent()}
      </div>
    </div>
  );
});

FlightsPanel.displayName = 'FlightsPanel';

export default FlightsPanel;
