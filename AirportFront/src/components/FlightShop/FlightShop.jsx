import { useState, useEffect, useMemo } from 'react';
import { Plane, Calendar, MapPin, Search, TrendingUp, ArrowLeftRight, RefreshCw } from 'lucide-react';

import PurchaseTicketForm from '../PurchaseTicketForm/PurchaseTicketForm';
import FlightCard from './FlightCard';
import { commercialFlightService } from '../../services/commercialFlightService';
import styles from './FlightShop.module.css';

const parseDuration = (formatted) => {
  if (!formatted) return 999;
  const hours = parseInt(formatted.match(/(\d+)h/)?.[1] || 0);
  const mins = parseInt(formatted.match(/(\d+)m/)?.[1] || 0);
  return hours * 60 + mins;
};

const isUpcoming = (flight) => {
  const dt = flight.departure?.dateTime;
  if (dt) return new Date(dt) > new Date();
  const date = flight.departure?.date;
  const time = flight.departure?.time || '00:00';
  if (!date) return true;
  return new Date(`${date}T${time}`) > new Date();
};

const FlightShop = ({ initialParams = null }) => {
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState('cheapest');
  const [searchParams, setSearchParams] = useState({
    origin: initialParams?.origin || '',
    destination: initialParams?.destination || '',
    departureDate: '',
    cabinClass: 'economy'
  });
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [showPurchaseForm, setShowPurchaseForm] = useState(false);

  useEffect(() => {
    if (initialParams?.origin || initialParams?.destination) {
      loadFilteredFlights(initialParams.origin || '', initialParams.destination || '');
    } else {
      loadFeaturedFlights(false);
    }
  }, []);

  const loadFilteredFlights = async (origin, destination) => {
    try {
      setLoading(true);
      const allResp = await commercialFlightService.getFeaturedFlights(false);
      const filtered = (allResp.data || []).filter(flight => {
        if (!isUpcoming(flight)) return false;
        if (origin && flight.origin.iata !== origin.toUpperCase()) return false;
        if (destination && flight.destination.iata !== destination.toUpperCase()) return false;
        return true;
      });
      setFlights(filtered);
    } catch (error) {
      console.error('Error cargando vuelos filtrados:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFeaturedFlights = async (forceRefresh = false) => {
    try {
      setLoading(true);
      const response = await commercialFlightService.getFeaturedFlights(forceRefresh);
      setFlights((response.data || []).filter(isUpcoming));
    } catch (error) {
      console.error('Error cargando vuelos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (!searchParams.origin && !searchParams.destination && !searchParams.departureDate) {
        await loadFeaturedFlights(false);
        return;
      }
      const allResp = await commercialFlightService.getFeaturedFlights(false);
      const filtered = (allResp.data || []).filter(flight => {
        if (!isUpcoming(flight)) return false;
        if (searchParams.origin && flight.origin.iata !== searchParams.origin.toUpperCase()) return false;
        if (searchParams.destination && flight.destination.iata !== searchParams.destination.toUpperCase()) return false;
        if (searchParams.departureDate && flight.departure.date !== searchParams.departureDate) return false;
        return true;
      });
      setFlights(filtered);
    } catch (error) {
      console.error('Error buscando vuelos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBuyFlight = (flight, selectedClass) => {
    const flightForPurchase = {
      flight: { iata: flight.flightIATA, number: flight.flightNumber || flight.flightIATA },
      flightNumber: flight.flightNumber || flight.flightIATA,
      airline: { name: flight.airline.name, iata: flight.airline.iata },
      departure: {
        airport: flight.origin.airport,
        iata: flight.origin.iata,
        city: flight.origin.city,
        scheduled: flight.departure.dateTime || `${flight.departure.date}T${flight.departure.time}:00`
      },
      arrival: {
        airport: flight.destination.airport,
        iata: flight.destination.iata,
        city: flight.destination.city,
        estimated: flight.arrival.dateTime || `${flight.arrival.date}T${flight.arrival.time}:00`,
        scheduled: flight.arrival.dateTime || `${flight.arrival.date}T${flight.arrival.time}:00`
      },
      _commercialOffer: {
        selectedClass,
        price: flight.prices[selectedClass],
        availableSeats: flight.availableSeats[selectedClass]
      }
    };
    setSelectedFlight(flightForPurchase);
    setShowPurchaseForm(true);
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const swapOriginDestination = () => {
    setSearchParams(prev => ({ ...prev, origin: prev.destination, destination: prev.origin }));
  };

  const { cabinClass } = searchParams;

  const sortedFlights = useMemo(() => {
    const arr = [...flights];
    if (sort === 'cheapest') return arr.sort((a, b) => a.prices[cabinClass] - b.prices[cabinClass]);
    if (sort === 'shortest') return arr.sort((a, b) => parseDuration(a.duration.formatted) - parseDuration(b.duration.formatted));
    return arr.sort((a, b) => {
      const scoreA = a.prices[cabinClass] + parseDuration(a.duration.formatted) * 1.5;
      const scoreB = b.prices[cabinClass] + parseDuration(b.duration.formatted) * 1.5;
      return scoreA - scoreB;
    });
  }, [flights, sort, cabinClass]);

  const cheapestId = useMemo(() => {
    if (!flights.length) return null;
    return [...flights].sort((a, b) => a.prices[cabinClass] - b.prices[cabinClass])[0]?.id;
  }, [flights, cabinClass]);

  const bestId = useMemo(() => {
    if (!flights.length) return null;
    return [...flights].sort((a, b) => {
      const sA = a.prices[cabinClass] + parseDuration(a.duration.formatted) * 1.5;
      const sB = b.prices[cabinClass] + parseDuration(b.duration.formatted) * 1.5;
      return sA - sB;
    })[0]?.id;
  }, [flights, cabinClass]);

  const shortestId = useMemo(() => {
    if (!flights.length) return null;
    return [...flights].sort((a, b) => parseDuration(a.duration.formatted) - parseDuration(b.duration.formatted))[0]?.id;
  }, [flights]);

  const cheapestPrice = useMemo(() => {
    if (!flights.length) return null;
    return Math.min(...flights.map(f => f.prices[cabinClass]));
  }, [flights, cabinClass]);

  const shortestDuration = useMemo(() => {
    if (!flights.length) return null;
    return flights.reduce((min, f) => {
      const d = parseDuration(f.duration.formatted);
      return d < parseDuration(min) ? f.duration.formatted : min;
    }, flights[0]?.duration.formatted || '');
  }, [flights]);

  if (loading && flights.length === 0) {
    return (
      <div className={styles.flightShop}>
        <div className={styles.loadingState}>
          <div className={styles.spinner} />
          <p>Cargando vuelos disponibles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.flightShop}>
      {/* Barra de búsqueda compacta estilo KAYAK */}
      <div className={styles.searchBar}>
        <form onSubmit={handleSearch} className={styles.searchBarForm}>
          <div className={styles.searchBarFields}>
            <div className={styles.searchField}>
              <MapPin size={15} className={styles.fieldIcon} />
              <input
                type="text"
                placeholder="Origen"
                value={searchParams.origin}
                onChange={e => setSearchParams(p => ({ ...p, origin: e.target.value.toUpperCase() }))}
                maxLength={3}
                className={styles.searchFieldInput}
              />
              {searchParams.origin && (
                <button type="button" className={styles.clearBtn} onClick={() => setSearchParams(p => ({ ...p, origin: '' }))}>×</button>
              )}
            </div>

            <button type="button" className={styles.swapBtn} onClick={swapOriginDestination} title="Intercambiar">
              <ArrowLeftRight size={16} />
            </button>

            <div className={styles.searchField}>
              <MapPin size={15} className={styles.fieldIcon} />
              <input
                type="text"
                placeholder="Destino"
                value={searchParams.destination}
                onChange={e => setSearchParams(p => ({ ...p, destination: e.target.value.toUpperCase() }))}
                maxLength={3}
                className={styles.searchFieldInput}
              />
              {searchParams.destination && (
                <button type="button" className={styles.clearBtn} onClick={() => setSearchParams(p => ({ ...p, destination: '' }))}>×</button>
              )}
            </div>

            <div className={styles.searchDivider} />

            <div className={styles.searchField}>
              <Calendar size={15} className={styles.fieldIcon} />
              <input
                type="date"
                value={searchParams.departureDate}
                onChange={e => setSearchParams(p => ({ ...p, departureDate: e.target.value }))}
                min={getMinDate()}
                className={styles.searchFieldInput}
              />
            </div>

            <div className={styles.searchDivider} />

            <div className={styles.searchField}>
              <TrendingUp size={15} className={styles.fieldIcon} />
              <select
                value={searchParams.cabinClass}
                onChange={e => setSearchParams(p => ({ ...p, cabinClass: e.target.value }))}
                className={styles.searchFieldSelect}
              >
                <option value="economy">Turista</option>
                <option value="business">Business</option>
                <option value="first">Primera</option>
              </select>
            </div>
          </div>

          <button type="submit" className={styles.searchSubmitBtn} disabled={loading}>
            <Search size={17} />
            {loading ? 'Buscando...' : 'Buscar'}
          </button>
        </form>

        <button
          type="button"
          className={styles.refreshBtn}
          onClick={() => loadFeaturedFlights(true)}
          disabled={loading}
          title="Actualizar vuelos"
        >
          <RefreshCw size={15} className={loading ? styles.spinning : ''} />
        </button>
      </div>

      {/* Filter banner */}
      {(searchParams.origin || searchParams.destination) && (
        <div className={styles.filterBanner}>
          <span className={styles.filterBannerText}>
            {searchParams.origin && searchParams.destination
              ? `${searchParams.origin} → ${searchParams.destination}`
              : searchParams.destination
                ? `Vuelos a ${searchParams.destination}`
                : `Vuelos desde ${searchParams.origin}`}
          </span>
          <button
            className={styles.filterBannerClear}
            onClick={() => {
              setSearchParams({ origin: '', destination: '', departureDate: '', cabinClass: 'economy' });
              loadFeaturedFlights(false);
            }}
          >
            × Ver todos
          </button>
        </div>
      )}

      {/* Área de resultados */}
      <div className={styles.resultsArea}>
        {/* Tabs de ordenación */}
        <div className={styles.sortTabs}>
          <button
            className={`${styles.sortTab} ${sort === 'cheapest' ? styles.sortTabActive : ''}`}
            onClick={() => setSort('cheapest')}
          >
            <span className={styles.sortTabLabel}>El más barato</span>
            {cheapestPrice != null && <span className={styles.sortTabMeta}>{cheapestPrice.toFixed(0)} €</span>}
          </button>
          <button
            className={`${styles.sortTab} ${sort === 'best' ? styles.sortTabActive : ''}`}
            onClick={() => setSort('best')}
          >
            <span className={styles.sortTabLabel}>El mejor</span>
          </button>
          <button
            className={`${styles.sortTab} ${sort === 'shortest' ? styles.sortTabActive : ''}`}
            onClick={() => setSort('shortest')}
          >
            <span className={styles.sortTabLabel}>Menor duración</span>
            {shortestDuration && <span className={styles.sortTabMeta}>{shortestDuration}</span>}
          </button>
          <div className={styles.resultCount}>
            {sortedFlights.length} vuelo{sortedFlights.length !== 1 ? 's' : ''} disponible{sortedFlights.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Lista de vuelos */}
        {sortedFlights.length === 0 ? (
          <div className={styles.emptyResults}>
            <Plane size={56} />
            <h3>No se encontraron vuelos</h3>
            <p>Intenta con otros criterios de búsqueda</p>
            <button
              className={styles.resetBtn}
              onClick={() => {
                setSearchParams({ origin: '', destination: '', departureDate: '', cabinClass: 'economy' });
                loadFeaturedFlights(false);
              }}
            >
              Ver todos los vuelos
            </button>
          </div>
        ) : (
          <div className={styles.flightList}>
            {sortedFlights.map(flight => (
              <FlightCard
                key={flight.id}
                flight={flight}
                cabinClass={cabinClass}
                onBuyClick={handleBuyFlight}
                isCheapest={flight.id === cheapestId}
                isBest={flight.id === bestId}
                isShortest={flight.id === shortestId}
              />
            ))}
          </div>
        )}
      </div>

      {showPurchaseForm && selectedFlight && (
        <PurchaseTicketForm
          flight={selectedFlight}
          onClose={() => { setShowPurchaseForm(false); setSelectedFlight(null); }}
          onSuccess={() => { setShowPurchaseForm(false); setSelectedFlight(null); }}
        />
      )}
    </div>
  );
};

export default FlightShop;
