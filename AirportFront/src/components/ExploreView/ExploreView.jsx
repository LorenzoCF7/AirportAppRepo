import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ArrowLeft, Heart, ChevronDown } from 'lucide-react';
import { useScrollLock } from '../../hooks';
import styles from './ExploreView.module.css';

const ORIGIN = { city: 'Sevilla', code: 'SVQ', lat: 37.42, lng: -5.89 };

const TILE_URL = 'https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=zcp3yZQzGciUIW6r7r6y';

const destinations = [
  { id: 1,  city: 'Alicante',   country: 'España',        code: 'ALC', lat: 38.28, lng: -0.56,  price: 28,  dates: '11 jun. – 13 jun.', direct: true,  airlines: ['VY','FR'],  image: 'https://images.unsplash.com/photo-1559682468-a6a29b338dc9?auto=format&fit=crop&w=600&h=400&q=80' },
  { id: 2,  city: 'Valencia',   country: 'España',        code: 'VLC', lat: 39.49, lng: -0.48,  price: 28,  dates: '4 jun. – 7 jun.',   direct: true,  airlines: ['VY','IB'],  image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=600&h=400&q=80' },
  { id: 3,  city: 'Palma',      country: 'España',        code: 'PMI', lat: 39.55, lng:  2.74,  price: 28,  dates: '10 jun. – 15 jun.', direct: true,  airlines: ['VY','FR'],  image: 'https://images.unsplash.com/photo-1577717903315-1691ae25ab3f?auto=format&fit=crop&w=600&h=400&q=80' },
  { id: 4,  city: 'Madrid',     country: 'España',        code: 'MAD', lat: 40.47, lng: -3.56,  price: 38,  dates: '9 jun. – 11 jun.',  direct: true,  airlines: ['IB','VY'],  image: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=600&h=400&q=80' },
  { id: 5,  city: 'Barcelona',  country: 'España',        code: 'BCN', lat: 41.30, lng:  2.08,  price: 46,  dates: '5 jun. – 10 jun.',  direct: true,  airlines: ['VY','IB'],  image: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=600&h=400&q=80' },
  { id: 6,  city: 'Málaga',     country: 'España',        code: 'AGP', lat: 36.67, lng: -4.50,  price: 38,  dates: '6 jun. – 9 jun.',   direct: true,  airlines: ['FR','VY'],  image: 'https://images.unsplash.com/photo-1567459169544-fe7c81ed71e2?auto=format&fit=crop&w=600&h=400&q=80' },
  { id: 7,  city: 'Tenerife',   country: 'España',        code: 'TFN', lat: 28.04, lng:-16.57,  price: 57,  dates: '15 jun. – 22 jun.', direct: true,  airlines: ['VY','IB'],  image: 'https://images.unsplash.com/photo-1588432272830-b8c3e6a6f7b0?auto=format&fit=crop&w=600&h=400&q=80' },
  { id: 8,  city: 'Lisboa',     country: 'Portugal',      code: 'LIS', lat: 38.77, lng: -9.13,  price: 36,  dates: '12 jun. – 16 jun.', direct: true,  airlines: ['FR','TP'],  image: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?auto=format&fit=crop&w=600&h=400&q=80' },
  { id: 9,  city: 'Oporto',     country: 'Portugal',      code: 'OPO', lat: 41.24, lng: -8.68,  price: 56,  dates: '18 jun. – 23 jun.', direct: true,  airlines: ['FR'],       image: 'https://images.unsplash.com/photo-1565177671117-a9dcb1fb7e57?auto=format&fit=crop&w=600&h=400&q=80' },
  { id: 10, city: 'Londres',    country: 'Reino Unido',   code: 'LHR', lat: 51.47, lng: -0.46,  price: 78,  dates: '20 jun. – 27 jun.', direct: true,  airlines: ['IB','BA'],  image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=600&h=400&q=80' },
  { id: 11, city: 'París',      country: 'Francia',       code: 'CDG', lat: 48.99, lng:  2.55,  price: 94,  dates: '7 jun. – 14 jun.',  direct: true,  airlines: ['VY','AF'],  image: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=600&h=400&q=80' },
  { id: 12, city: 'Roma',       country: 'Italia',        code: 'FCO', lat: 41.80, lng: 12.25,  price: 88,  dates: '13 jun. – 20 jun.', direct: true,  airlines: ['IB','AZ'],  image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=600&h=400&q=80' },
  { id: 13, city: 'Milán',      country: 'Italia',        code: 'MXP', lat: 45.63, lng:  8.72,  price: 52,  dates: '9 jun. – 14 jun.',  direct: true,  airlines: ['VY','FR'],  image: 'https://images.unsplash.com/photo-1513581166391-887a96ddeafd?auto=format&fit=crop&w=600&h=400&q=80' },
  { id: 14, city: 'Ámsterdam',  country: 'Países Bajos',  code: 'AMS', lat: 52.31, lng:  4.77,  price: 109, dates: '18 jun. – 25 jun.', direct: true,  airlines: ['VY','KL'],  image: 'https://images.unsplash.com/photo-1534351590666-13e3e96b5702?auto=format&fit=crop&w=600&h=400&q=80' },
  { id: 15, city: 'Marrakech',  country: 'Marruecos',     code: 'RAK', lat: 31.61, lng: -8.03,  price: 76,  dates: '22 jun. – 29 jun.', direct: false, airlines: ['FR','AT'],  image: 'https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?auto=format&fit=crop&w=600&h=400&q=80' },
];

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
    transition:all 0.15s;
  ">${price} €</div>`,
  className: '',
  iconSize: null,
  iconAnchor: [30, 16],
});

/**/
const MapEffects = ({ selected }) => {
  const map = useMap();
  const polyRef = useRef(null);
  const popupRef = useRef(null);

  useEffect(() => {
    if (polyRef.current)  { map.removeLayer(polyRef.current);  polyRef.current  = null; }
    if (popupRef.current) { map.closePopup(popupRef.current);  popupRef.current = null; }

    if (selected) {
      polyRef.current = L.polyline(
        [[ORIGIN.lat, ORIGIN.lng], [selected.lat, selected.lng]],
        { color: '#111827', weight: 1.5, dashArray: '8,7', opacity: 0.75 }
      ).addTo(map);

      const bounds = L.latLngBounds(
        [ORIGIN.lat, ORIGIN.lng],
        [selected.lat, selected.lng]
      );
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
  }, [selected, map]);

  return null;
};

/**/
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

/**/
const DestDetail = ({ dest, onBack, onNavigate }) => {
  useEffect(() => {
    window.__exploreCb = () => onNavigate('shop');
    return () => { window.__exploreCb = null; };
  }, [onNavigate]);

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
          <div className={styles.priceMeta}>{dest.dates} · {dest.direct ? 'Directo' : '1 escala'} · ida y vuelta</div>
        </div>

        <button className={styles.searchBtn} onClick={() => onNavigate('shop')}>
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

/**/
const ExploreView = ({ onNavigate }) => {
  const [selected, setSelected] = useState(null);

  useScrollLock(true);

  const handleSelect = (dest) => setSelected(dest);
  const handleBack   = () => setSelected(null);

  const sorted = [...destinations].sort((a, b) => a.price - b.price);

  return (
    <div className={styles.page}>

      {/**/}
      <div className={styles.panel}>
        {selected ? (
          <DestDetail dest={selected} onBack={handleBack} onNavigate={onNavigate} />
        ) : (
          <>
            {/**/}
            <div className={styles.searchBox}>
              <div className={styles.searchRow}>
                <div className={styles.searchField}>
                  <span className={styles.searchCode}>{ORIGIN.city} ({ORIGIN.code})</span>
                </div>
                <div className={styles.searchField}>
                  <span className={styles.searchPlaceholder}>Destino</span>
                </div>
              </div>
              <div className={`${styles.searchField} ${styles.searchFieldFull}`}>
                <span className={styles.searchPlaceholder}>Cualquier momento y duración</span>
              </div>
            </div>

            {/**/}
            <div className={styles.filters}>
              {['Escalas', 'Precio', 'Duración del vuelo'].map(f => (
                <button key={f} className={styles.filterChip}>
                  {f} <ChevronDown size={13} />
                </button>
              ))}
            </div>

            {/**/}
            <div className={styles.list}>
              {sorted.map(dest => (
                <DestCard
                  key={dest.id}
                  dest={dest}
                  active={selected?.id === dest.id}
                  onClick={() => handleSelect(dest)}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/**/}
      <div className={styles.mapWrap}>
        <MapContainer
          center={[44, 5]}
          zoom={4}
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
        >
          <TileLayer url={TILE_URL} tileSize={512} zoomOffset={-1} attribution="" />
          <MapEffects selected={selected} />

          {/**/}
          <Marker position={[ORIGIN.lat, ORIGIN.lng]} icon={starIcon} />

          {/**/}
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
