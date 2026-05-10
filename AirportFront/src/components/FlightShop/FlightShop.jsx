import { useState, useEffect, useMemo, useRef } from 'react';
import { Plane, Calendar, MapPin, Search, TrendingUp, ArrowLeftRight, RefreshCw, ArrowRight, Check, X } from 'lucide-react';

import PurchaseTicketForm from '../PurchaseTicketForm/PurchaseTicketForm';
import FlightCard from './FlightCard';
import CalendarPicker from './CalendarPicker';
import { commercialFlightService } from '../../services/commercialFlightService';
import styles from './FlightShop.module.css';

const AIRPORTS = [
  { city: 'Madrid',       iata: 'MAD' },
  { city: 'Barcelona',    iata: 'BCN' },
  { city: 'Londres',      iata: 'LHR' },
  { city: 'París',        iata: 'CDG' },
  { city: 'Roma',         iata: 'FCO' },
  { city: 'Ámsterdam',    iata: 'AMS' },
  { city: 'Berlín',       iata: 'BER' },
  { city: 'Lisboa',       iata: 'LIS' },
  { city: 'Milán',        iata: 'MXP' },
  { city: 'Frankfurt',    iata: 'FRA' },
  { city: 'Zúrich',       iata: 'ZRH' },
  { city: 'Viena',        iata: 'VIE' },
  { city: 'Praga',        iata: 'PRG' },
  { city: 'Copenhague',   iata: 'CPH' },
  { city: 'Estocolmo',    iata: 'ARN' },
  { city: 'Dublín',       iata: 'DUB' },
  { city: 'Atenas',       iata: 'ATH' },
  { city: 'Varsovia',     iata: 'WAW' },
  { city: 'Múnich',       iata: 'MUC' },
  { city: 'Sevilla',      iata: 'SVQ' },
  { city: 'Valencia',     iata: 'VLC' },
  { city: 'Málaga',       iata: 'AGP' },
  { city: 'Bilbao',       iata: 'BIO' },
  { city: 'Palma',        iata: 'PMI' },
  { city: 'Tenerife',     iata: 'TFS' },
  { city: 'Gran Canaria', iata: 'LPA' },
  { city: 'Bruselas',     iata: 'BRU' },
  { city: 'Edimburgo',    iata: 'EDI' },
  { city: 'Nueva York',   iata: 'JFK' },
];

const filterAirports = (query) => {
  if (!query || query.length < 1) return [];
  const q = query.toLowerCase().replace(/\s*\([a-z]{3}\)$/i, '').trim();
  if (!q) return [];
  const starts = AIRPORTS.filter(a =>
    a.city.toLowerCase().startsWith(q) || a.iata.toLowerCase().startsWith(q)
  );
  if (starts.length >= 4) return starts.slice(0, 6);
  const rest = AIRPORTS.filter(a =>
    !starts.includes(a) &&
    (a.city.toLowerCase().includes(q) || a.iata.toLowerCase().includes(q))
  );
  return [...starts, ...rest].slice(0, 6);
};

const parseDuration = (formatted) => {
  if (!formatted) return 999;
  const hours = parseInt(formatted.match(/(\d+)h/)?.[1] || 0);
  const mins  = parseInt(formatted.match(/(\d+)m/)?.[1] || 0);
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

const buildFlightForPurchase = (flight, cabinClass) => ({
  flight:       { iata: flight.flightIATA, number: flight.flightNumber || flight.flightIATA },
  flightNumber: flight.flightNumber || flight.flightIATA,
  airline:      { name: flight.airline.name, iata: flight.airline.iata },
  departure: {
    airport:   flight.origin.airport,
    iata:      flight.origin.iata,
    city:      flight.origin.city,
    scheduled: flight.departure.dateTime || `${flight.departure.date}T${flight.departure.time}:00`
  },
  arrival: {
    airport:   flight.destination.airport,
    iata:      flight.destination.iata,
    city:      flight.destination.city,
    estimated: flight.arrival.dateTime || `${flight.arrival.date}T${flight.arrival.time}:00`,
    scheduled: flight.arrival.dateTime || `${flight.arrival.date}T${flight.arrival.time}:00`
  },
  _commercialOffer: {
    selectedClass:  cabinClass,
    price:          flight.prices[cabinClass],
    availableSeats: flight.availableSeats[cabinClass]
  }
});

const fmtDate = (dateStr) => {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
};

const getMinDate = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
};

const FlightShop = ({ initialParams = null }) => {
  const [tripType, setTripType] = useState('oneWay');
  const [allFlights, setAllFlights]     = useState([]);
  const [flights, setFlights]           = useState([]);
  const [returnFlights, setReturnFlights] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [sort, setSort]         = useState('cheapest');
  const [searchDone, setSearchDone] = useState(false);

  const [searchParams, setSearchParams] = useState({
    origin:        initialParams?.origin      || '',
    destination:   initialParams?.destination || '',
    departureDate: '',
    returnDate:    '',
    cabinClass:    'economy'
  });

  const [showDepCal,    setShowDepCal]    = useState(false);
  const [showRetCal,    setShowRetCal]    = useState(false);
  const [showOriginSug, setShowOriginSug] = useState(false);
  const [showDestSug,   setShowDestSug]   = useState(false);
  const calRef = useRef(null);

  const [selectedOutbound, setSelectedOutbound] = useState(null);
  const [selectedReturn,   setSelectedReturn]   = useState(null);
  const [selectedFlight,   setSelectedFlight]   = useState(null);
  const [showPurchaseForm, setShowPurchaseForm]  = useState(false);
  const [purchaseStep,     setPurchaseStep]      = useState(null);

  // Force refresh on mount so mock data is always fresh
  useEffect(() => {
    const init = async () => {
      const all = await loadAll(true);
      if (initialParams?.origin || initialParams?.destination) {
        applyFilter(all, initialParams.origin || '', initialParams.destination || '', '');
      }
    };
    init();
  }, []);

  // Close calendars on outside click
  useEffect(() => {
    const handler = (e) => {
      if (calRef.current && !calRef.current.contains(e.target)) {
        setShowDepCal(false);
        setShowRetCal(false);
        setShowOriginSug(false);
        setShowDestSug(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const loadAll = async (forceRefresh = false) => {
    try {
      setLoading(true);
      const response = await commercialFlightService.getFeaturedFlights(forceRefresh);
      const data = (response.data || []).filter(isUpcoming);
      setAllFlights(data);
      setFlights(data);
      setReturnFlights([]);
      setSearchDone(false);
      return data;
    } catch (err) {
      console.error('Error cargando vuelos:', err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const applyFilter = (all, origin, destination, departureDate) => {
    const filtered = all.filter(flight => {
      if (origin      && flight.origin.iata      !== origin.toUpperCase())       return false;
      if (destination && flight.destination.iata !== destination.toUpperCase())  return false;
      if (departureDate && flight.departure.date !== departureDate)              return false;
      return true;
    });
    setFlights(filtered);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { origin, destination, departureDate, returnDate } = searchParams;

      if (!origin && !destination && !departureDate) {
        setFlights(allFlights);
        setReturnFlights([]);
        setSearchDone(false);
        return;
      }

      const filtered = allFlights.filter(flight => {
        if (origin      && flight.origin.iata      !== origin.toUpperCase())       return false;
        if (destination && flight.destination.iata !== destination.toUpperCase())  return false;
        if (departureDate && flight.departure.date !== departureDate)              return false;
        return true;
      });
      setFlights(filtered);

      if (tripType === 'roundTrip') {
        const returns = allFlights.filter(flight => {
          if (origin      && flight.origin.iata      !== destination.toUpperCase()) return false;
          if (destination && flight.destination.iata !== origin.toUpperCase())      return false;
          if (returnDate && flight.departure.date !== returnDate)                   return false;
          return true;
        });
        setReturnFlights(returns);
      }

      setSearchDone(true);
      setSelectedOutbound(null);
      setSelectedReturn(null);
    } finally {
      setLoading(false);
    }
  };

  // Available dates derived from allFlights for the selected route
  const outboundAvailableDates = useMemo(() => {
    const { origin, destination } = searchParams;
    if (!origin || !destination) return [];
    const ori = origin.toUpperCase();
    const dst = destination.toUpperCase();
    return [...new Set(
      allFlights
        .filter(f => f.origin.iata === ori && f.destination.iata === dst)
        .map(f => f.departure.date)
        .filter(Boolean)
    )];
  }, [allFlights, searchParams.origin, searchParams.destination]);

  const returnAvailableDates = useMemo(() => {
    const { origin, destination } = searchParams;
    if (!origin || !destination) return [];
    const ori = destination.toUpperCase();
    const dst = origin.toUpperCase();
    return [...new Set(
      allFlights
        .filter(f => f.origin.iata === ori && f.destination.iata === dst)
        .map(f => f.departure.date)
        .filter(Boolean)
    )];
  }, [allFlights, searchParams.origin, searchParams.destination]);

  const handleBuyFlight = (flight, selectedClass) => {
    setSelectedFlight(buildFlightForPurchase(flight, selectedClass));
    setPurchaseStep(null);
    setShowPurchaseForm(true);
  };

  const handleBuyRoundTrip = () => {
    if (!selectedOutbound || !selectedReturn) return;
    setSelectedFlight(buildFlightForPurchase(selectedOutbound, cabinClass));
    setPurchaseStep('outbound');
    setShowPurchaseForm(true);
  };

  const handlePurchaseSuccess = () => {
    if (purchaseStep === 'outbound') {
      setSelectedFlight(buildFlightForPurchase(selectedReturn, cabinClass));
      setPurchaseStep('return');
    } else {
      setShowPurchaseForm(false);
      setSelectedFlight(null);
      setPurchaseStep(null);
      setSelectedOutbound(null);
      setSelectedReturn(null);
    }
  };

  const handlePurchaseClose = () => {
    setShowPurchaseForm(false);
    setSelectedFlight(null);
    setPurchaseStep(null);
  };

  const swapOriginDestination = () => {
    setSearchParams(prev => ({ ...prev, origin: prev.destination, destination: prev.origin }));
  };

  const { cabinClass } = searchParams;

  const sortFn = (arr) => {
    const copy = [...arr];
    if (sort === 'cheapest') return copy.sort((a, b) => a.prices[cabinClass] - b.prices[cabinClass]);
    if (sort === 'shortest') return copy.sort((a, b) => parseDuration(a.duration.formatted) - parseDuration(b.duration.formatted));
    return copy.sort((a, b) => {
      const sA = a.prices[cabinClass] + parseDuration(a.duration.formatted) * 1.5;
      const sB = b.prices[cabinClass] + parseDuration(b.duration.formatted) * 1.5;
      return sA - sB;
    });
  };

  const sortedFlights       = useMemo(() => sortFn(flights),       [flights, sort, cabinClass]);
  const sortedReturnFlights = useMemo(() => sortFn(returnFlights), [returnFlights, sort, cabinClass]);

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

  const roundTripTotal = selectedOutbound && selectedReturn
    ? selectedOutbound.prices[cabinClass] + selectedReturn.prices[cabinClass]
    : null;

  const isRoundTripResults = tripType === 'roundTrip' && searchDone;

  if (loading && allFlights.length === 0) {
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
      {/* Search bar */}
      <div className={styles.searchBar} ref={calRef}>
        <div className={styles.tripToggle}>
          <button
            type="button"
            className={`${styles.tripBtn} ${tripType === 'oneWay' ? styles.tripBtnActive : ''}`}
            onClick={() => {
              setTripType('oneWay');
              setSearchDone(false);
              setReturnFlights([]);
              setSelectedOutbound(null);
              setSelectedReturn(null);
            }}
          >
            Solo ida
          </button>
          <button
            type="button"
            className={`${styles.tripBtn} ${tripType === 'roundTrip' ? styles.tripBtnActive : ''}`}
            onClick={() => setTripType('roundTrip')}
          >
            Ida y vuelta
          </button>
        </div>

        <form onSubmit={handleSearch} className={styles.searchBarForm}>
          <div className={styles.searchBarFields}>

            {/* Origin */}
            <div className={styles.searchField}>
              <MapPin size={15} className={styles.fieldIcon} />
              <input
                type="text"
                placeholder="Origen"
                value={searchParams.origin}
                onChange={e => {
                  setSearchParams(p => ({ ...p, origin: e.target.value.toUpperCase() }));
                  setShowOriginSug(true);
                  setShowDestSug(false);
                }}
                onFocus={() => { setShowOriginSug(true); setShowDestSug(false); }}
                autoComplete="off"
                className={styles.searchFieldInput}
              />
              {searchParams.origin && (
                <button type="button" className={styles.clearBtn} onClick={() => {
                  setSearchParams(p => ({ ...p, origin: '' }));
                  setShowOriginSug(false);
                }}>×</button>
              )}
              {showOriginSug && filterAirports(searchParams.origin).length > 0 && (
                <div className={styles.suggestionsDropdown}>
                  {filterAirports(searchParams.origin).map(a => (
                    <button
                      key={a.iata}
                      type="button"
                      className={styles.suggestionItem}
                      onMouseDown={e => {
                        e.preventDefault();
                        setSearchParams(p => ({ ...p, origin: a.iata }));
                        setShowOriginSug(false);
                      }}
                    >
                      <span className={styles.suggestionCity}>{a.city}</span>
                      <span className={styles.suggestionIata}>{a.iata}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button type="button" className={styles.swapBtn} onClick={swapOriginDestination} title="Intercambiar">
              <ArrowLeftRight size={16} />
            </button>

            {/* Destination */}
            <div className={styles.searchField}>
              <MapPin size={15} className={styles.fieldIcon} />
              <input
                type="text"
                placeholder="Destino"
                value={searchParams.destination}
                onChange={e => {
                  setSearchParams(p => ({ ...p, destination: e.target.value.toUpperCase() }));
                  setShowDestSug(true);
                  setShowOriginSug(false);
                }}
                onFocus={() => { setShowDestSug(true); setShowOriginSug(false); }}
                autoComplete="off"
                className={styles.searchFieldInput}
              />
              {searchParams.destination && (
                <button type="button" className={styles.clearBtn} onClick={() => {
                  setSearchParams(p => ({ ...p, destination: '' }));
                  setShowDestSug(false);
                }}>×</button>
              )}
              {showDestSug && filterAirports(searchParams.destination).length > 0 && (
                <div className={styles.suggestionsDropdown}>
                  {filterAirports(searchParams.destination).map(a => (
                    <button
                      key={a.iata}
                      type="button"
                      className={styles.suggestionItem}
                      onMouseDown={e => {
                        e.preventDefault();
                        setSearchParams(p => ({ ...p, destination: a.iata }));
                        setShowDestSug(false);
                      }}
                    >
                      <span className={styles.suggestionCity}>{a.city}</span>
                      <span className={styles.suggestionIata}>{a.iata}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className={styles.searchDivider} />

            {/* Departure date — calendar picker */}
            <div className={`${styles.searchField} ${styles.searchFieldCal}`}>
              <Calendar size={15} className={styles.fieldIcon} />
              <span className={styles.dateLabel}>Ida</span>
              <button
                type="button"
                className={`${styles.calTrigger} ${searchParams.departureDate ? styles.calTriggerFilled : ''}`}
                onClick={() => { setShowDepCal(v => !v); setShowRetCal(false); }}
              >
                {searchParams.departureDate ? fmtDate(searchParams.departureDate) : <span className={styles.calPlaceholder}>Cualquier día</span>}
              </button>
              {searchParams.departureDate && (
                <button type="button" className={styles.clearBtn} onClick={(e) => { e.stopPropagation(); setSearchParams(p => ({ ...p, departureDate: '' })); }}>
                  <X size={12} />
                </button>
              )}
              {showDepCal && (
                <div className={styles.calDropdown}>
                  <CalendarPicker
                    value={searchParams.departureDate}
                    onChange={date => { setSearchParams(p => ({ ...p, departureDate: date })); setShowDepCal(false); }}
                    availableDates={outboundAvailableDates}
                    minDate={getMinDate()}
                    onClose={() => setShowDepCal(false)}
                  />
                </div>
              )}
            </div>

            {/* Return date (round-trip only) */}
            {tripType === 'roundTrip' && (
              <>
                <div className={styles.searchDivider} />
                <div className={`${styles.searchField} ${styles.searchFieldCal}`}>
                  <Calendar size={15} className={styles.fieldIcon} />
                  <span className={styles.dateLabel}>Vuelta</span>
                  <button
                    type="button"
                    className={`${styles.calTrigger} ${searchParams.returnDate ? styles.calTriggerFilled : ''}`}
                    onClick={() => { setShowRetCal(v => !v); setShowDepCal(false); }}
                  >
                    {searchParams.returnDate ? fmtDate(searchParams.returnDate) : <span className={styles.calPlaceholder}>Cualquier día</span>}
                  </button>
                  {searchParams.returnDate && (
                    <button type="button" className={styles.clearBtn} onClick={(e) => { e.stopPropagation(); setSearchParams(p => ({ ...p, returnDate: '' })); }}>
                      <X size={12} />
                    </button>
                  )}
                  {showRetCal && (
                    <div className={styles.calDropdown}>
                      <CalendarPicker
                        value={searchParams.returnDate}
                        onChange={date => { setSearchParams(p => ({ ...p, returnDate: date })); setShowRetCal(false); }}
                        availableDates={returnAvailableDates}
                        minDate={searchParams.departureDate || getMinDate()}
                        onClose={() => setShowRetCal(false)}
                      />
                    </div>
                  )}
                </div>
              </>
            )}

            <div className={styles.searchDivider} />

            {/* Cabin class */}
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
          onClick={() => loadAll(true)}
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
            {tripType === 'roundTrip' && ' · Ida y vuelta'}
          </span>
          <button
            className={styles.filterBannerClear}
            onClick={() => {
              setSearchParams({ origin: '', destination: '', departureDate: '', returnDate: '', cabinClass: 'economy' });
              setSearchDone(false);
              setReturnFlights([]);
              setSelectedOutbound(null);
              setSelectedReturn(null);
              setFlights(allFlights);
            }}
          >
            × Ver todos
          </button>
        </div>
      )}

      {/* Round-trip results */}
      {isRoundTripResults ? (
        <div className={styles.roundTripResults}>
          {/* Outbound */}
          <div className={styles.legSection}>
            <div className={styles.legHeader}>
              <ArrowRight size={15} className={styles.legIcon} />
              <span className={styles.legTitle}>Vuelo de ida</span>
              <span className={styles.legRoute}>{searchParams.origin} → {searchParams.destination}</span>
              {searchParams.departureDate && <span className={styles.legDate}>{fmtDate(searchParams.departureDate)}</span>}
              <span className={styles.legCount}>{sortedFlights.length} vuelo{sortedFlights.length !== 1 ? 's' : ''}</span>
            </div>

            <div className={styles.sortTabs}>
              <button className={`${styles.sortTab} ${sort === 'cheapest' ? styles.sortTabActive : ''}`} onClick={() => setSort('cheapest')}>
                <span className={styles.sortTabLabel}>El más barato</span>
                {cheapestPrice != null && <span className={styles.sortTabMeta}>{cheapestPrice.toFixed(0)} €</span>}
              </button>
              <button className={`${styles.sortTab} ${sort === 'best' ? styles.sortTabActive : ''}`} onClick={() => setSort('best')}>
                <span className={styles.sortTabLabel}>El mejor</span>
              </button>
              <button className={`${styles.sortTab} ${sort === 'shortest' ? styles.sortTabActive : ''}`} onClick={() => setSort('shortest')}>
                <span className={styles.sortTabLabel}>Menor duración</span>
                {shortestDuration && <span className={styles.sortTabMeta}>{shortestDuration}</span>}
              </button>
            </div>

            {sortedFlights.length === 0 ? (
              <div className={styles.emptyLeg}>
                <Plane size={28} />
                <p>No hay vuelos de ida disponibles para esta ruta</p>
              </div>
            ) : (
              <div className={styles.flightList}>
                {sortedFlights.map(flight => (
                  <FlightCard
                    key={flight.id}
                    flight={flight}
                    cabinClass={cabinClass}
                    onBuyClick={(f) => setSelectedOutbound(f)}
                    isSelected={selectedOutbound?.id === flight.id}
                    isCheapest={flight.id === cheapestId}
                    isBest={flight.id === bestId}
                    isShortest={flight.id === shortestId}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Return */}
          <div className={styles.legSection}>
            <div className={styles.legHeader}>
              <ArrowRight size={15} className={`${styles.legIcon} ${styles.legIconReturn}`} />
              <span className={styles.legTitle}>Vuelo de vuelta</span>
              <span className={styles.legRoute}>{searchParams.destination} → {searchParams.origin}</span>
              {searchParams.returnDate && <span className={styles.legDate}>{fmtDate(searchParams.returnDate)}</span>}
              <span className={styles.legCount}>{sortedReturnFlights.length} vuelo{sortedReturnFlights.length !== 1 ? 's' : ''}</span>
            </div>

            {sortedReturnFlights.length === 0 ? (
              <div className={styles.emptyLeg}>
                <Plane size={28} />
                <p>No hay vuelos de vuelta para esta ruta en el inventario</p>
                <small>Prueba sin fecha de regreso o con otras ciudades</small>
              </div>
            ) : (
              <div className={styles.flightList}>
                {sortedReturnFlights.map(flight => (
                  <FlightCard
                    key={flight.id}
                    flight={flight}
                    cabinClass={cabinClass}
                    onBuyClick={(f) => setSelectedReturn(f)}
                    isSelected={selectedReturn?.id === flight.id}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Booking bar */}
          {(selectedOutbound || selectedReturn) && (
            <div className={styles.bookingBar}>
              <div className={styles.bookingLegs}>
                <div className={`${styles.bookingLeg} ${selectedOutbound ? styles.bookingLegDone : styles.bookingLegPending}`}>
                  {selectedOutbound ? (
                    <>
                      <span className={styles.bookingLegLabel}><Check size={11} /> Ida</span>
                      <span className={styles.bookingLegRoute}>{selectedOutbound.origin.iata} → {selectedOutbound.destination.iata}</span>
                      <span className={styles.bookingLegTime}>{selectedOutbound.departure.time}</span>
                      <span className={styles.bookingLegPrice}>{selectedOutbound.prices[cabinClass].toFixed(0)} €</span>
                    </>
                  ) : (
                    <span className={styles.bookingLegEmpty}>Selecciona vuelo de ida</span>
                  )}
                </div>
                <div className={styles.bookingLegDivider} />
                <div className={`${styles.bookingLeg} ${selectedReturn ? styles.bookingLegDone : styles.bookingLegPending}`}>
                  {selectedReturn ? (
                    <>
                      <span className={styles.bookingLegLabel}><Check size={11} /> Vuelta</span>
                      <span className={styles.bookingLegRoute}>{selectedReturn.origin.iata} → {selectedReturn.destination.iata}</span>
                      <span className={styles.bookingLegTime}>{selectedReturn.departure.time}</span>
                      <span className={styles.bookingLegPrice}>{selectedReturn.prices[cabinClass].toFixed(0)} €</span>
                    </>
                  ) : (
                    <span className={styles.bookingLegEmpty}>Selecciona vuelo de vuelta</span>
                  )}
                </div>
              </div>
              {roundTripTotal && (
                <div className={styles.bookingTotal}>
                  <span className={styles.bookingTotalLabel}>Total</span>
                  <span className={styles.bookingTotalPrice}>{roundTripTotal.toFixed(0)} €</span>
                </div>
              )}
              <button
                className={styles.bookingBtn}
                onClick={handleBuyRoundTrip}
                disabled={!selectedOutbound || !selectedReturn}
              >
                {selectedOutbound && selectedReturn ? 'Comprar ida y vuelta' : 'Selecciona ambos vuelos'}
              </button>
            </div>
          )}
        </div>
      ) : (
        /* One-way results */
        <div className={styles.resultsArea}>
          <div className={styles.sortTabs}>
            <button className={`${styles.sortTab} ${sort === 'cheapest' ? styles.sortTabActive : ''}`} onClick={() => setSort('cheapest')}>
              <span className={styles.sortTabLabel}>El más barato</span>
              {cheapestPrice != null && <span className={styles.sortTabMeta}>{cheapestPrice.toFixed(0)} €</span>}
            </button>
            <button className={`${styles.sortTab} ${sort === 'best' ? styles.sortTabActive : ''}`} onClick={() => setSort('best')}>
              <span className={styles.sortTabLabel}>El mejor</span>
            </button>
            <button className={`${styles.sortTab} ${sort === 'shortest' ? styles.sortTabActive : ''}`} onClick={() => setSort('shortest')}>
              <span className={styles.sortTabLabel}>Menor duración</span>
              {shortestDuration && <span className={styles.sortTabMeta}>{shortestDuration}</span>}
            </button>
            <div className={styles.resultCount}>
              {sortedFlights.length} vuelo{sortedFlights.length !== 1 ? 's' : ''} disponible{sortedFlights.length !== 1 ? 's' : ''}
            </div>
          </div>

          {sortedFlights.length === 0 ? (
            <div className={styles.emptyResults}>
              <Plane size={56} />
              <h3>No se encontraron vuelos</h3>
              <p>Intenta con otros criterios de búsqueda</p>
              <button
                className={styles.resetBtn}
                onClick={() => {
                  setSearchParams({ origin: '', destination: '', departureDate: '', returnDate: '', cabinClass: 'economy' });
                  setFlights(allFlights);
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
      )}

      {showPurchaseForm && selectedFlight && (
        <PurchaseTicketForm
          flight={selectedFlight}
          onClose={handlePurchaseClose}
          onSuccess={handlePurchaseSuccess}
          roundTripStep={purchaseStep}
        />
      )}
    </div>
  );
};

export default FlightShop;
