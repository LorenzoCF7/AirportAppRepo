import { useState, useCallback, useRef } from 'react';
import { Plane, Search, ArrowLeftRight, ChevronLeft, ChevronRight } from 'lucide-react';

import styles from './DashboardView.module.css';

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
  { city: 'Nueva York',   iata: 'JFK' },
  { city: 'Palma',        iata: 'PMI' },
  { city: 'Tenerife',     iata: 'TFS' },
  { city: 'Frankfurt',    iata: 'FRA' },
  { city: 'Zúrich',       iata: 'ZRH' },
  { city: 'Viena',        iata: 'VIE' },
  { city: 'Praga',        iata: 'PRG' },
  { city: 'Copenhague',   iata: 'CPH' },
  { city: 'Estocolmo',    iata: 'ARN' },
  { city: 'Dublín',       iata: 'DUB' },
  { city: 'Atenas',       iata: 'ATH' },
  { city: 'Varsovia',     iata: 'WAW' },
  { city: 'Bruselas',     iata: 'BRU' },
  { city: 'Helsinki',     iata: 'HEL' },
  { city: 'Oslo',         iata: 'OSL' },
  { city: 'Sevilla',      iata: 'SVQ' },
  { city: 'Valencia',     iata: 'VLC' },
  { city: 'Málaga',       iata: 'AGP' },
  { city: 'Bilbao',       iata: 'BIO' },
  { city: 'Gran Canaria', iata: 'LPA' },
  { city: 'Múnich',       iata: 'MUC' },
  { city: 'Edimburgo',    iata: 'EDI' },
];

const heroPhotos = [
  { city: 'Marrakech', image: 'https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?auto=format&fit=crop&w=600&h=320&q=80' },
  { city: 'Santorini', image: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=600&h=320&q=80' },
  { city: 'Lisboa',    image: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?auto=format&fit=crop&w=600&h=320&q=80' },
  { city: 'Ámsterdam', image: 'https://images.unsplash.com/photo-1534351590666-13e3e96b5702?auto=format&fit=crop&w=600&h=320&q=80' },
  { city: 'Tokio',     image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=600&h=320&q=80' },
  { city: 'París',     image: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=600&h=320&q=80' },
];

const dealCards = [
  { city: 'Barcelona', iata: 'BCN', time: '1 h 30 min, directo',   price: 45,  dateFrom: '5/6',  dateTo: '12/6',  image: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=500&h=280&q=80' },
  { city: 'Londres',   iata: 'LHR', time: '2 h 10 min, directo',   price: 78,  dateFrom: '20/6', dateTo: '27/6',  image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=500&h=280&q=80' },
  { city: 'París',     iata: 'CDG', time: '1 h 55 min, directo',   price: 63,  dateFrom: '7/6',  dateTo: '14/6',  image: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=500&h=280&q=80' },
  { city: 'Roma',      iata: 'FCO', time: '2 h 20 min, directo',   price: 89,  dateFrom: '13/6', dateTo: '20/6',  image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=500&h=280&q=80' },
  { city: 'Lisboa',    iata: 'LIS', time: '2 h 05 min, directo',   price: 54,  dateFrom: '10/6', dateTo: '17/6',  image: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?auto=format&fit=crop&w=500&h=280&q=80' },
  { city: 'Berlín',    iata: 'BER', time: '2 h 35 min, directo',   price: 71,  dateFrom: '15/6', dateTo: '22/6',  image: 'https://images.unsplash.com/photo-1560969184-10fe8719e047?auto=format&fit=crop&w=500&h=280&q=80' },
  { city: 'Ámsterdam', iata: 'AMS', time: '2 h 25 min, directo',   price: 82,  dateFrom: '18/6', dateTo: '25/6',  image: 'https://images.unsplash.com/photo-1534351590666-13e3e96b5702?auto=format&fit=crop&w=500&h=280&q=80' },
  { city: 'Viena',     iata: 'VIE', time: '2 h 45 min, directo',   price: 95,  dateFrom: '22/6', dateTo: '29/6',  image: 'https://images.unsplash.com/photo-1516550135131-9de3cb85cd33?auto=format&fit=crop&w=500&h=280&q=80' },
  { city: 'Praga',     iata: 'PRG', time: '2 h 50 min, directo',   price: 67,  dateFrom: '1/7',  dateTo: '8/7',   image: 'https://images.unsplash.com/photo-1541849546-216549ae216d?auto=format&fit=crop&w=500&h=280&q=80' },
  { city: 'Tokio',     iata: 'TYO', time: '13 h 10 min, 1 escala', price: 420, dateFrom: '3/7',  dateTo: '17/7',  image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=500&h=280&q=80' },
];

const destinationList = [
  { city: 'Madrid',     iata: 'MAD' },
  { city: 'Londres',    iata: 'LHR' },
  { city: 'Barcelona',  iata: 'BCN' },
  { city: 'Roma',       iata: 'FCO' },
  { city: 'París',      iata: 'CDG' },
  { city: 'Nueva York', iata: 'JFK' },
  { city: 'Palma',      iata: 'PMI' },
  { city: 'Ámsterdam',  iata: 'AMS' },
  { city: 'Tenerife',   iata: 'TFS' },
  { city: 'Berlín',     iata: 'BER' },
  { city: 'Lisboa',     iata: 'LIS' },
  { city: 'Milán',      iata: 'MXP' },
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

const extractIata = (text) => {
  const match = text.match(/\(([A-Z]{3})\)/i);
  if (match) return match[1].toUpperCase();
  if (/^[A-Z]{3}$/i.test(text.trim())) return text.trim().toUpperCase();
  const found = AIRPORTS.find(a => a.city.toLowerCase() === text.toLowerCase().trim());
  return found ? found.iata : text.trim().toUpperCase();
};

const DashboardView = ({ onNavigate }) => {
  const [tripType, setTripType] = useState('roundtrip');
  const [heroSearch, setHeroSearch] = useState({
    origin: '', destination: '', departureDate: '', returnDate: '',
  });
  const [showOriginDrop, setShowOriginDrop] = useState(false);
  const [showDestDrop, setShowDestDrop] = useState(false);

  const carouselRef = useRef(null);

  const originSuggestions = filterAirports(heroSearch.origin);
  const destSuggestions   = filterAirports(heroSearch.destination);

  const scrollCarousel = useCallback((dir) => {
    if (!carouselRef.current) return;
    const card = carouselRef.current.querySelector('[data-card]');
    const step = card ? card.offsetWidth + 16 : 260;
    carouselRef.current.scrollBy({ left: dir * step * 2, behavior: 'smooth' });
  }, []);

  const handleSwap = useCallback(() => {
    setHeroSearch(prev => ({ ...prev, origin: prev.destination, destination: prev.origin }));
  }, []);

  const handleSearch = useCallback(() => {
    if (!onNavigate) return;
    const originIata = heroSearch.origin ? extractIata(heroSearch.origin) : '';
    const destIata   = heroSearch.destination ? extractIata(heroSearch.destination) : '';
    const params = (originIata || destIata) ? { origin: originIata, destination: destIata } : null;
    onNavigate('shop', params);
  }, [onNavigate, heroSearch]);

  const selectOrigin = (airport) => {
    setHeroSearch(p => ({ ...p, origin: `${airport.city} (${airport.iata})` }));
    setShowOriginDrop(false);
  };

  const selectDest = (airport) => {
    setHeroSearch(p => ({ ...p, destination: `${airport.city} (${airport.iata})` }));
    setShowDestDrop(false);
  };

  return (
    <div className={styles.page}>

      {/**/}
      <section className={styles.hero}>
        <div className={styles.heroInner}>

          {/**/}
          <div className={styles.heroLeft}>
            <h1 className={styles.heroTitle}>
              Compara ofertas de vuelos<br />en cientos de webs<span className={styles.titleDot}>.</span>
            </h1>
            <div className={styles.tripOptions}>
              <button
                className={styles.tripOptionBtn}
                onClick={() => setTripType(t => t === 'roundtrip' ? 'oneway' : 'roundtrip')}
              >
                {tripType === 'roundtrip' ? 'Ida y vuelta' : 'Solo ida'} ▾
              </button>
              <button className={styles.tripOptionBtn}>0 piezas ▾</button>
            </div>

            {/**/}
            <div className={styles.searchBar}>

              {/* Origin */}
              <div className={styles.sbField}>
                <input
                  className={styles.sbInput}
                  placeholder="Origen"
                  value={heroSearch.origin}
                  onChange={e => {
                    setHeroSearch(p => ({ ...p, origin: e.target.value }));
                    setShowOriginDrop(true);
                  }}
                  onFocus={() => setShowOriginDrop(true)}
                  onBlur={() => setTimeout(() => setShowOriginDrop(false), 150)}
                />
                {heroSearch.origin && (
                  <button className={styles.sbClear} onClick={() => setHeroSearch(p => ({ ...p, origin: '' }))}>×</button>
                )}
                {showOriginDrop && originSuggestions.length > 0 && (
                  <ul className={styles.suggestions}>
                    {originSuggestions.map(a => (
                      <li key={a.iata} className={styles.suggestionItem} onMouseDown={() => selectOrigin(a)}>
                        <span className={styles.suggestionCity}>{a.city}</span>
                        <span className={styles.suggestionIata}>{a.iata}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <button className={styles.sbSwap} onClick={handleSwap}>
                <ArrowLeftRight size={15} />
              </button>

              {/* Destination */}
              <div className={styles.sbField}>
                <input
                  className={styles.sbInput}
                  placeholder="Destino"
                  value={heroSearch.destination}
                  onChange={e => {
                    setHeroSearch(p => ({ ...p, destination: e.target.value }));
                    setShowDestDrop(true);
                  }}
                  onFocus={() => setShowDestDrop(true)}
                  onBlur={() => setTimeout(() => setShowDestDrop(false), 150)}
                />
                {heroSearch.destination && (
                  <button className={styles.sbClear} onClick={() => setHeroSearch(p => ({ ...p, destination: '' }))}>×</button>
                )}
                {showDestDrop && destSuggestions.length > 0 && (
                  <ul className={styles.suggestions}>
                    {destSuggestions.map(a => (
                      <li key={a.iata} className={styles.suggestionItem} onMouseDown={() => selectDest(a)}>
                        <span className={styles.suggestionCity}>{a.city}</span>
                        <span className={styles.suggestionIata}>{a.iata}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className={styles.sbDivider} />

              <div className={styles.sbDates}>
                <input
                  type="date"
                  className={styles.sbDateInput}
                  value={heroSearch.departureDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={e => setHeroSearch(p => ({ ...p, departureDate: e.target.value }))}
                />
                {tripType === 'roundtrip' && (
                  <>
                    <span className={styles.sbDateSep}>—</span>
                    <input
                      type="date"
                      className={styles.sbDateInput}
                      value={heroSearch.returnDate}
                      min={heroSearch.departureDate || new Date().toISOString().split('T')[0]}
                      onChange={e => setHeroSearch(p => ({ ...p, returnDate: e.target.value }))}
                    />
                  </>
                )}
              </div>

              <div className={styles.sbDivider} />

              <div className={styles.sbPassengers}>
                1 adulto, Turista
              </div>

              <button className={styles.sbSubmit} onClick={handleSearch}>
                <Search size={20} />
              </button>
            </div>
          </div>

          {/**/}
          <div className={styles.heroRight}>
            <div className={styles.photoGrid}>
              {heroPhotos.map(photo => (
                <div
                  key={photo.city}
                  className={styles.photoCard}
                  style={{ backgroundImage: `url(${photo.image})` }}
                >
                  <div className={styles.photoOverlay} />
                  <span className={styles.photoLabel}>{photo.city}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/**/}
      <section className={styles.features}>
        <div className={styles.featuresInner}>
          <div className={styles.featureCard}>
            <div className={styles.airlineDots}>
              {[0,1,2,3].map(i => <span key={i} className={styles.airlineDot} style={{ background: ['#FF690F','#fda085','#5b86e5','#36d1dc'][i] }} />)}
            </div>
            <h3 className={styles.featureTitle}>Compara y ahorra</h3>
            <p className={styles.featureDesc}>Más ofertas. Más páginas. Una búsqueda.</p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.avatarRow}>
              {['#FF690F','#5b86e5','#36d1dc'].map((c, i) => (
                <span key={i} className={styles.avatar} style={{ background: c }}>
                  {String.fromCharCode(65 + i)}
                </span>
              ))}
            </div>
            <h3 className={styles.featureTitle}>41.000.000+</h3>
            <p className={styles.featureDesc}>búsquedas esta semana</p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.stars}>★★★★★</div>
            <h3 className={styles.featureTitle}>Los viajeros nos adoran</h3>
            <p className={styles.featureDesc}>Más de 1 millón de valoraciones en nuestra app</p>
          </div>
        </div>
      </section>

      {/**/}
      <section className={styles.deals}>
        <div className={styles.dealsInner}>
          <div className={styles.dealsTitleRow}>
            <h2 className={styles.dealsTitle}>Ofertas de vuelo disponibles</h2>
            <div className={styles.carouselControls}>
              <button className={styles.carouselBtn} onClick={() => scrollCarousel(-1)} aria-label="Anterior">
                <ChevronLeft size={18} />
              </button>
              <button className={styles.carouselBtn} onClick={() => scrollCarousel(1)} aria-label="Siguiente">
                <ChevronRight size={18} />
              </button>
              <button className={styles.exploreLink} onClick={handleSearch}>Explorar &rsaquo;</button>
            </div>
          </div>
          <div className={styles.carouselTrack} ref={carouselRef}>
            {dealCards.map(deal => (
              <button
                key={deal.city}
                className={styles.dealCard}
                data-card
                onClick={() => onNavigate && onNavigate('shop', { destination: deal.iata })}
              >
                <div
                  className={styles.dealPhoto}
                  style={{ backgroundImage: `url(${deal.image})` }}
                >
                  <div className={styles.dealPhotoOverlay} />
                </div>
                <div className={styles.dealBody}>
                  <h3 className={styles.dealCity}>{deal.city}</h3>
                  <p className={styles.dealMeta}>{deal.time}</p>
                  <p className={styles.dealDates}>{deal.dateFrom} → {deal.dateTo}</p>
                  <p className={styles.dealPrice}>desde <strong>{deal.price} €</strong></p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/**/}
      <section className={styles.destList}>
        <div className={styles.destListInner}>
          <h2 className={styles.destListTitle}>Busca vuelos baratos por destino</h2>
          <p className={styles.destListSub}>Busca y compara vuelos baratos</p>
          <div className={styles.destGrid}>
            {destinationList.map(dest => (
              <button
                key={dest.city}
                className={styles.destItem}
                onClick={() => onNavigate && onNavigate('shop', { destination: dest.iata })}
              >
                <span>Vuelos a {dest.city}</span>
                <span className={styles.destChev}>▾</span>
              </button>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};

export default DashboardView;
