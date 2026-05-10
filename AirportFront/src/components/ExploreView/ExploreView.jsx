import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ArrowLeft, Heart, ChevronDown, X, Calendar } from 'lucide-react';
import { useScrollLock } from '../../hooks';
import { commercialFlightService } from '../../services/commercialFlightService';
import { getAirportCoordinates } from '../../constants/airports';
import styles from './ExploreView.module.css';

const ORIGIN_CITIES = {
  MAD: 'Madrid', BCN: 'Barcelona', LHR: 'Londres', CDG: 'París',
  FRA: 'Frankfurt', FCO: 'Roma', AMS: 'Ámsterdam', MUC: 'Múnich',
  LIS: 'Lisboa', VIE: 'Viena', CPH: 'Copenhague', DUB: 'Dublín',
  ATH: 'Atenas', WAW: 'Varsovia', BRU: 'Bruselas', HEL: 'Helsinki',
  PMI: 'Palma', SVQ: 'Sevilla', BIO: 'Bilbao', VLC: 'Valencia',
  OSL: 'Oslo', ARN: 'Estocolmo', BER: 'Berlín', GVA: 'Ginebra',
  DUS: 'Düsseldorf', ZRH: 'Zúrich', PRG: 'Praga', EDI: 'Edimburgo',
  MXP: 'Milán', ZAG: 'Zagreb',
};

const TILE_URL = `https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=${import.meta.env.VITE_MAPTILER_API_KEY}`;

// Imágenes de ciudades por código IATA (Unsplash)
const CITY_IMAGES = {
  BCN: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=600&h=400&q=80',
  MAD: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=600&h=400&q=80',
  LHR: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=600&h=400&q=80',
  CDG: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=600&h=400&q=80',
  AMS: 'https://images.unsplash.com/photo-1534351590666-13e3e96b5702?auto=format&fit=crop&w=600&h=400&q=80',
  FCO: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=600&h=400&q=80',
  MUC: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&h=400&q=80',
  LIS: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?auto=format&fit=crop&w=600&h=400&q=80',
  VIE: 'https://images.unsplash.com/photo-1516550893885-985c836b95d1?auto=format&fit=crop&w=600&h=400&q=80',
  ZRH: 'https://images.unsplash.com/photo-1551009175-15bdf9dcb580?auto=format&fit=crop&w=600&h=400&q=80',
  FRA: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=600&h=400&q=80',
  PRG: 'https://images.unsplash.com/photo-1541849546-216549ae216d?auto=format&fit=crop&w=600&h=400&q=80',
  ARN: 'https://images.unsplash.com/photo-1509356843151-3e7d96241e11?auto=format&fit=crop&w=600&h=400&q=80',
  EDI: 'https://images.unsplash.com/photo-1549194388-3cded1df83b6?auto=format&fit=crop&w=600&h=400&q=80',
  BER: 'https://images.unsplash.com/photo-1560969184-10fe8719e047?auto=format&fit=crop&w=600&h=400&q=80',
  GVA: 'https://images.unsplash.com/photo-1531973576160-7125cd663d86?auto=format&fit=crop&w=600&h=400&q=80',
  OSL: 'https://images.unsplash.com/photo-1601991004353-61dde3f7e6e3?auto=format&fit=crop&w=600&h=400&q=80',
  DUS: 'https://images.unsplash.com/photo-1558618047-f4e3f9fe1b33?auto=format&fit=crop&w=600&h=400&q=80',
  PMI: 'https://images.unsplash.com/photo-1577717903315-1691ae25ab3f?auto=format&fit=crop&w=600&h=400&q=80',
  VLC: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=600&h=400&q=80',
  ALC: 'https://images.unsplash.com/photo-1559682468-a6a29b338dc9?auto=format&fit=crop&w=600&h=400&q=80',
  MXP: 'https://images.unsplash.com/photo-1513581166391-887a96ddeafd?auto=format&fit=crop&w=600&h=400&q=80',
  CPH: 'https://images.unsplash.com/photo-1513622470522-26c3c8a854bc?auto=format&fit=crop&w=600&h=400&q=80',
  DUB: 'https://images.unsplash.com/photo-1549918864-48ac978761a4?auto=format&fit=crop&w=600&h=400&q=80',
  ATH: 'https://images.unsplash.com/photo-1555993539-1732b0258235?auto=format&fit=crop&w=600&h=400&q=80',
  WAW: 'https://images.unsplash.com/photo-1519197924294-4ba991a11128?auto=format&fit=crop&w=600&h=400&q=80',
  BRU: 'https://images.unsplash.com/photo-1491557345352-5929e343eb89?auto=format&fit=crop&w=600&h=400&q=80',
  HEL: 'https://images.unsplash.com/photo-1538332576228-eb5b4c4de6f5?auto=format&fit=crop&w=600&h=400&q=80',
  RAK: 'https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?auto=format&fit=crop&w=600&h=400&q=80',
  DEFAULT: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=600&h=400&q=80',
};

// País por código IATA
const COUNTRY_MAP = {
  BCN: 'España', MAD: 'España', VLC: 'España', ALC: 'España', PMI: 'España', AGP: 'España', SVQ: 'España', TFN: 'España',
  LHR: 'Reino Unido', LGW: 'Reino Unido', EDI: 'Reino Unido', MAN: 'Reino Unido',
  CDG: 'Francia', ORY: 'Francia',
  AMS: 'Países Bajos',
  FCO: 'Italia', MXP: 'Italia',
  MUC: 'Alemania', FRA: 'Alemania', BER: 'Alemania', DUS: 'Alemania', HAM: 'Alemania',
  LIS: 'Portugal', OPO: 'Portugal',
  VIE: 'Austria',
  ZRH: 'Suiza', GVA: 'Suiza',
  PRG: 'República Checa',
  ARN: 'Suecia',
  OSL: 'Noruega',
  BRU: 'Bélgica',
  CPH: 'Dinamarca',
  HEL: 'Finlandia',
  WAW: 'Polonia',
  ATH: 'Grecia',
  DUB: 'Irlanda',
  RAK: 'Marruecos',
  IST: 'Turquía',
};

// Formatea un rango de fechas a partir de la fecha de salida
const formatDateRange = (dateStr) => {
  if (!dateStr) return '';
  const start = new Date(dateStr);
  const end = new Date(dateStr);
  end.setDate(end.getDate() + 4);
  const months = ['ene.', 'feb.', 'mar.', 'abr.', 'may.', 'jun.', 'jul.', 'ago.', 'sep.', 'oct.', 'nov.', 'dic.'];
  return `${start.getDate()} ${months[start.getMonth()]} – ${end.getDate()} ${months[end.getMonth()]}`;
};

// Transforma los vuelos de la API en destinos para el mapa
const flightsToDestinations = (flights) => {
  const destMap = new Map();

  flights.forEach((flight) => {
    const { iata, city } = flight.destination;
    const coords = getAirportCoordinates(iata);
    if (!coords) return;

    const existing = destMap.get(iata);
    const price = Math.round(flight.prices.economy);

    if (!existing || price < existing.price) {
      // Acumular aerolíneas para este destino
      const airlines = existing?.airlines
        ? [...new Set([...existing.airlines, flight.airline.iata])]
        : [flight.airline.iata];

      destMap.set(iata, {
        id: iata,
        city,
        country: COUNTRY_MAP[iata] || '',
        code: iata,
        lat: coords.lat,
        lng: coords.lng,
        price,
        dates: formatDateRange(flight.departure.date),
        direct: true,
        airlines,
        image: CITY_IMAGES[iata] || CITY_IMAGES.DEFAULT,
        // Guardar todos los precios para el detalle
        prices: flight.prices,
        departure: flight.departure,
        duration: flight.duration,
        airline: flight.airline,
      });
    } else {
      // Solo agregar aerolínea si el destino ya existe con precio menor
      const updatedAirlines = [...new Set([...existing.airlines, flight.airline.iata])];
      destMap.set(iata, { ...existing, airlines: updatedAirlines });
    }
  });

  return Array.from(destMap.values());
};

// ── Iconos del mapa ─────────────────────────────────────────────────────────

const starIcon = L.divIcon({
  html: `<div style="width:28px;height:28px;display:flex;align-items:center;justify-content:center;font-size:18px;filter:drop-shadow(0 1px 3px rgba(0,0,0,0.5))">★</div>`,
  className: '',
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

const createPriceIcon = (price, active) => L.divIcon({
  html: `<div style="
    background:${active ? '#111827' : 'white'};
    color:${active ? 'white' : '#111827'};
    border:1.5px solid ${active ? '#111827' : '#d1d5db'};
    border-radius:4px;
    padding:4px 9px;
    font-size:13px;
    font-weight:700;
    white-space:nowrap;
    cursor:pointer;
    box-shadow:0 1px 5px rgba(0,0,0,0.2);
    font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
  ">${price} €</div>`,
  className: '',
  iconSize: null,
  iconAnchor: [30, 16],
});

// ── Efectos del mapa ─────────────────────────────────────────────────────────

const MapEffects = ({ selected, origin }) => {
  const map = useMap();
  const polyRef = useRef(null);
  const popupRef = useRef(null);

  useEffect(() => {
    if (polyRef.current)  { map.removeLayer(polyRef.current);  polyRef.current  = null; }
    if (popupRef.current) { map.closePopup(popupRef.current);  popupRef.current = null; }

    if (selected && origin) {
      polyRef.current = L.polyline(
        [[origin.lat, origin.lng], [selected.lat, selected.lng]],
        { color: '#111827', weight: 1.5, dashArray: '8,7', opacity: 0.75 }
      ).addTo(map);

      const bounds = L.latLngBounds([origin.lat, origin.lng], [selected.lat, selected.lng]);
      map.fitBounds(bounds, { padding: [90, 120], maxZoom: 7 });

      window.__exploreNav = () => { window.__exploreCb?.(); };
      popupRef.current = L.popup({ closeButton: false, offset: [0, -10], className: 'explore-popup' })
        .setLatLng([selected.lat, selected.lng])
        .setContent(`
          <div style="font-size:14px;font-weight:700;color:#111827;margin-bottom:4px">${selected.price} € ${selected.city}</div>
          <span onclick="window.__exploreNav()" style="color:#FF690F;font-weight:600;font-size:13px;cursor:pointer">Ver vuelos &rsaquo;</span>
        `)
        .openOn(map);
    } else {
      map.flyTo([44, 5], 4, { duration: 1 });
    }
  }, [selected, origin, map]);

  return null;
};

// ── Tarjeta de destino ───────────────────────────────────────────────────────

const DestCard = ({ dest, active, onClick }) => (
  <button className={`${styles.destCard} ${active ? styles.destCardActive : ''}`} onClick={onClick}>
    <div className={styles.destThumb} style={{ backgroundImage: `url(${dest.image})` }} />
    <div className={styles.destInfo}>
      <div className={styles.destName}>{dest.city}</div>
      <div className={styles.destMeta}>{dest.dates}</div>
      <div className={dest.direct ? styles.destDirect : styles.destStop}>
        {dest.direct ? 'Directo' : 'Con escala'}
      </div>
    </div>
    <div className={styles.destRight}>
      <button className={styles.heartBtn} onClick={e => e.stopPropagation()}><Heart size={15} /></button>
      <div className={styles.destPrice}>{dest.price} €</div>
    </div>
  </button>
);

// ── Vista de detalle ─────────────────────────────────────────────────────────

const DestDetail = ({ dest, onBack, onNavigate, originCode }) => {
  useEffect(() => {
    window.__exploreCb = () => onNavigate('shop', { origin: originCode, destination: dest.code });
    return () => { window.__exploreCb = null; };
  }, [onNavigate, originCode, dest.code]);

  return (
    <div className={styles.detail}>
      <button className={styles.backBtn} onClick={onBack}>
        <ArrowLeft size={18} />
      </button>
      <div className={styles.detailPhoto} style={{ backgroundImage: `url(${dest.image})` }} />
      <div className={styles.detailBody}>
        <div className={styles.detailHeader}>
          <h2 className={styles.detailCity}>{dest.city}<span className={styles.detailDot}>.</span></h2>
          <button className={styles.heartBtn}><Heart size={18} /></button>
        </div>
        <p className={styles.detailCountry}>{dest.country}</p>

        <div className={styles.priceBox}>
          <div className={styles.priceLabel}>El más barato</div>
          <div className={styles.priceRow}>
            <span className={styles.priceAmount}>{dest.price} €</span>
          </div>
          <div className={styles.priceMeta}>
            {dest.dates} · {dest.direct ? 'Directo' : '1 escala'} · ida y vuelta
          </div>
          {dest.duration?.formatted && (
            <div className={styles.priceMeta}>Duración: {dest.duration.formatted}</div>
          )}
        </div>

        <button className={styles.searchBtn} onClick={() => onNavigate('shop', { origin: originCode, destination: dest.code })}>
          Ver vuelos
        </button>

        <div className={styles.airlineRow}>
          <span className={styles.airlineLabel}>{dest.direct ? 'Vuelos directos' : 'Con escala'}</span>
          <div className={styles.airlinePills}>
            {dest.airlines.map(a => (
              <span key={a} className={styles.airlinePill}>{a}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Componente principal ─────────────────────────────────────────────────────

const ExploreView = ({ onNavigate }) => {
  const [selected, setSelected]             = useState(null);
  const [allFlights, setAllFlights]         = useState([]);
  const [availableOrigins, setAvailableOrigins] = useState([]);
  const [selectedOriginCode, setSelectedOriginCode] = useState(null);
  const [loading, setLoading]               = useState(true);

  // Filters
  const [destFilter, setDestFilter]   = useState('');
  const [dateFrom, setDateFrom]       = useState('');
  const [dateTo, setDateTo]           = useState('');
  const [stopsFilter, setStopsFilter] = useState('all');   // 'all' | 'direct'
  const [priceSort, setPriceSort]     = useState('asc');   // 'asc' | 'desc'
  const [durationSort, setDurationSort] = useState(false); // false | true

  // Dropdown state for filter chips and date field
  const [openChip, setOpenChip]     = useState(null); // 'stops'|'price'|'duration'|'date'|null
  const filterRef                   = useRef(null);

  useScrollLock(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        const response = await commercialFlightService.getFeaturedFlights(false);
        const flights = response.data || [];
        setAllFlights(flights);

        const seen = new Set();
        const origins = [];
        flights.forEach(f => {
          const iata = f.origin.iata;
          if (!seen.has(iata) && getAirportCoordinates(iata)) {
            seen.add(iata);
            origins.push({ code: iata, city: ORIGIN_CITIES[iata] || iata });
          }
        });
        setAvailableOrigins(origins);
        if (origins.length > 0) setSelectedOriginCode(origins[0].code);
      } catch (err) {
        console.error('Error cargando destinos:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) setOpenChip(null);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const originInfo = useMemo(() => {
    if (!selectedOriginCode) return null;
    const coords = getAirportCoordinates(selectedOriginCode);
    return coords ? { code: selectedOriginCode, city: ORIGIN_CITIES[selectedOriginCode] || selectedOriginCode, ...coords } : null;
  }, [selectedOriginCode]);

  // Apply date filter to flights before computing destinations
  const baseFlights = useMemo(() => {
    if (!allFlights.length || !selectedOriginCode) return [];
    return allFlights
      .filter(f => f.origin.iata === selectedOriginCode)
      .filter(f => !dateFrom || f.departure.date >= dateFrom)
      .filter(f => !dateTo   || f.departure.date <= dateTo);
  }, [allFlights, selectedOriginCode, dateFrom, dateTo]);

  const destinations = useMemo(() => flightsToDestinations(baseFlights), [baseFlights]);

  const parseDurMins = useCallback((d) => {
    if (!d?.formatted) return 999;
    const h = parseInt(d.formatted.match(/(\d+)h/)?.[1] || 0);
    const m = parseInt(d.formatted.match(/(\d+)m/)?.[1] || 0);
    return h * 60 + m;
  }, []);

  const visibleDests = useMemo(() => {
    let list = destinations;

    // Destination text filter
    if (destFilter.trim()) {
      const q = destFilter.toLowerCase();
      list = list.filter(d => d.city.toLowerCase().includes(q) || d.code.toLowerCase().includes(q));
    }

    // Stops filter
    if (stopsFilter === 'direct') list = list.filter(d => d.direct);

    // Sort
    if (durationSort) {
      list = [...list].sort((a, b) => parseDurMins(a.duration) - parseDurMins(b.duration));
    } else {
      list = [...list].sort((a, b) => priceSort === 'asc' ? a.price - b.price : b.price - a.price);
    }

    return list;
  }, [destinations, destFilter, stopsFilter, priceSort, durationSort, parseDurMins]);

  const handleSelect = (dest) => setSelected(dest);
  const handleBack   = () => setSelected(null);

  const toggleChip = (name) => setOpenChip(prev => prev === name ? null : name);

  const dateLabel = dateFrom || dateTo
    ? `${dateFrom || '—'}  →  ${dateTo || '—'}`
    : 'Cualquier momento y duración';

  const clearDates = (e) => { e.stopPropagation(); setDateFrom(''); setDateTo(''); };

  return (
    <div className={styles.page}>
      {/* Panel lateral */}
      <div className={styles.panel}>
        {selected ? (
          <DestDetail dest={selected} onBack={handleBack} onNavigate={onNavigate} originCode={selectedOriginCode} />
        ) : (
          <>
            <div className={styles.searchBox} ref={filterRef}>
              <div className={styles.searchRow}>
                {/* Origin */}
                <div className={styles.searchField}>
                  <select
                    className={styles.originSelect}
                    value={selectedOriginCode || ''}
                    onChange={e => { setSelectedOriginCode(e.target.value); setSelected(null); setDestFilter(''); }}
                    disabled={availableOrigins.length === 0}
                  >
                    {availableOrigins.map(o => (
                      <option key={o.code} value={o.code}>{o.city} ({o.code})</option>
                    ))}
                  </select>
                </div>

                {/* Destination filter */}
                <div className={styles.searchField} style={{ position: 'relative' }}>
                  <input
                    className={styles.destInput}
                    placeholder="Destino"
                    value={destFilter}
                    onChange={e => setDestFilter(e.target.value)}
                  />
                  {destFilter && (
                    <button className={styles.clearBtn} onClick={() => setDestFilter('')}>
                      <X size={13} />
                    </button>
                  )}
                </div>
              </div>

              {/* Date range field */}
              <div
                className={`${styles.searchField} ${styles.searchFieldFull} ${openChip === 'date' ? styles.searchFieldOpen : ''}`}
                onClick={() => toggleChip('date')}
                style={{ cursor: 'pointer', userSelect: 'none' }}
              >
                <Calendar size={14} style={{ color: '#9ca3af', flexShrink: 0 }} />
                <span className={dateFrom || dateTo ? styles.searchCode : styles.searchPlaceholder} style={{ flex: 1, marginLeft: 6 }}>
                  {dateLabel}
                </span>
                {(dateFrom || dateTo) && (
                  <button className={styles.clearBtn} onClick={clearDates}><X size={13} /></button>
                )}
                <ChevronDown size={13} style={{ color: '#9ca3af', flexShrink: 0 }} />
              </div>

              {/* Date dropdown */}
              {openChip === 'date' && (
                <div className={styles.chipDropdown}>
                  <div className={styles.chipDropdownRow}>
                    <label className={styles.dateLabel}>Salida</label>
                    <input
                      type="date"
                      className={styles.dateInput}
                      value={dateFrom}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={e => setDateFrom(e.target.value)}
                    />
                  </div>
                  <div className={styles.chipDropdownRow}>
                    <label className={styles.dateLabel}>Vuelta</label>
                    <input
                      type="date"
                      className={styles.dateInput}
                      value={dateTo}
                      min={dateFrom || new Date().toISOString().split('T')[0]}
                      onChange={e => setDateTo(e.target.value)}
                    />
                  </div>
                  <button className={styles.applyBtn} onClick={() => setOpenChip(null)}>Aplicar</button>
                </div>
              )}
            </div>

            {/* Filter chips */}
            <div className={styles.filters} ref={null}>
              {/* Escalas chip */}
              <div style={{ position: 'relative' }}>
                <button
                  className={`${styles.filterChip} ${stopsFilter !== 'all' ? styles.filterChipActive : ''}`}
                  onClick={() => toggleChip('stops')}
                >
                  Escalas{stopsFilter === 'direct' ? ': Directo' : ''} <ChevronDown size={13} />
                </button>
                {openChip === 'stops' && (
                  <div className={styles.chipDropdown}>
                    {[['all', 'Todos los vuelos'], ['direct', 'Solo directos']].map(([val, label]) => (
                      <button
                        key={val}
                        className={`${styles.chipOption} ${stopsFilter === val ? styles.chipOptionActive : ''}`}
                        onClick={() => { setStopsFilter(val); setOpenChip(null); }}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Precio chip */}
              <div style={{ position: 'relative' }}>
                <button
                  className={`${styles.filterChip} ${durationSort ? '' : styles.filterChipActive}`}
                  onClick={() => toggleChip('price')}
                >
                  Precio <ChevronDown size={13} />
                </button>
                {openChip === 'price' && (
                  <div className={styles.chipDropdown}>
                    {[['asc', 'Más barato primero'], ['desc', 'Más caro primero']].map(([val, label]) => (
                      <button
                        key={val}
                        className={`${styles.chipOption} ${!durationSort && priceSort === val ? styles.chipOptionActive : ''}`}
                        onClick={() => { setPriceSort(val); setDurationSort(false); setOpenChip(null); }}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Duración chip */}
              <div style={{ position: 'relative' }}>
                <button
                  className={`${styles.filterChip} ${durationSort ? styles.filterChipActive : ''}`}
                  onClick={() => { setDurationSort(prev => !prev); setOpenChip(null); }}
                >
                  Duración del vuelo {durationSort ? '✓' : <ChevronDown size={13} />}
                </button>
              </div>
            </div>

            <div className={styles.list}>
              {loading ? (
                <div className={styles.loadingState}>
                  <div className={styles.loadingIcon} style={{ width: 28, height: 28, border: '3px solid #e5e7eb', borderTopColor: '#111827', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                  <p>Cargando destinos...</p>
                </div>
              ) : visibleDests.length === 0 ? (
                <div className={styles.loadingState}>
                  <p>No hay destinos disponibles</p>
                </div>
              ) : (
                visibleDests.map(dest => (
                  <DestCard
                    key={dest.id}
                    dest={dest}
                    active={selected?.id === dest.id}
                    onClick={() => handleSelect(dest)}
                  />
                ))
              )}
            </div>
          </>
        )}
      </div>

      {/* Mapa */}
      <div className={styles.mapWrap}>
        <MapContainer
          center={[44, 5]}
          zoom={4}
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
        >
          <TileLayer url={TILE_URL} tileSize={512} zoomOffset={-1} attribution="" />
          <MapEffects selected={selected} origin={originInfo} />

          {originInfo && <Marker position={[originInfo.lat, originInfo.lng]} icon={starIcon} />}

          {destinations.map(dest => (
            <Marker
              key={dest.id}
              position={[dest.lat, dest.lng]}
              icon={createPriceIcon(dest.price, selected?.id === dest.id)}
              eventHandlers={{ click: () => handleSelect(dest) }}
            />
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

export default ExploreView;
