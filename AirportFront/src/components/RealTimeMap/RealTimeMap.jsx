import { useEffect, useRef, useState, useCallback } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Plane } from 'lucide-react';

import { flightSimulator } from '../../services/flightSimulator';
import { flightService } from '../../services/flightService';
import { useScrollLock } from '../../hooks';
import TargetCursor from '../TargetCursor/TargetCursor';

import FlightMarker from './FlightMarker';
import FlightsPanel from './FlightsPanel';
import { MapController, MapClickHandler, MAP_CONFIG, getMapTilerUrl } from './MapHelpers';

import styles from './RealTimeMap.module.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const UPDATE_INTERVAL = 2000;

const RealTimeMap = () => {
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [followingFlight, setFollowingFlight] = useState(null);

  const mapRef = useRef(null);
  const intervalRef = useRef(null);
  const followingFlightRef = useRef(null);

  useScrollLock(true);

  useEffect(() => {
    followingFlightRef.current = followingFlight;
  }, [followingFlight]);

  const centerMapOnFlight = useCallback((flight, zoom = 8) => {
    if (!mapRef.current || !flight?.live) return;
    const lat = Number(flight.live.latitude);
    const lng = Number(flight.live.longitude);
    if (isNaN(lat) || isNaN(lng)) return;
    mapRef.current.setView([lat, lng], zoom, { animate: true, duration: 0.8 });
  }, []);

  const moveCursorToFlight = useCallback((flight) => {
    const flightId = flight.id || flight.flightNumber;
    const planeMarker = document.querySelector(`[data-flight-id="${flightId}"]`);
    if (planeMarker) {
      const rect = planeMarker.getBoundingClientRect();
      window.dispatchEvent(new CustomEvent('move-cursor-to', {
        detail: { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
      }));
    }
  }, []);

  const startUpdateInterval = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      const updated = flightSimulator.getAllFlights().filter(f => f.live);
      setFlights(updated);

      const following = followingFlightRef.current;
      if (following && mapRef.current) {
        const current = updated.find(f =>
          (f.id || f.flightNumber) === (following.id || following.flightNumber)
        );
        if (current?.live) {
          const lat = current.live.latitude;
          const lng = current.live.longitude;
          if (!isNaN(lat) && !isNaN(lng)) {
            mapRef.current.setView([lat, lng], mapRef.current.getZoom(), { animate: true, duration: 0.5 });
            setTimeout(() => moveCursorToFlight(current), 100);
          }
        }
      }
    }, UPDATE_INTERVAL);
  }, [moveCursorToFlight]);

  const searchForFlight = useCallback(async (query) => {
    if (!query.trim()) return;

    try {
      setLoading(true);
      setNotFound(false);
      setHasSearched(true);
      setFlights([]);
      setFollowingFlight(null);

      flightSimulator.clear();
      if (intervalRef.current) clearInterval(intervalRef.current);

      const result = await flightService.searchFlight(query.trim());

      if (!result.data || result.data.length === 0) {
        setNotFound(true);
        return;
      }

      const normalized = result.data.map(f => flightService._normalizeFlightData(f));
      flightSimulator.initializeFlights(normalized);
      await new Promise(resolve => setTimeout(resolve, 200));

      const simulatedFlights = flightSimulator.getAllFlights().filter(
        f => f.live && f.live.latitude && f.live.longitude
      );

      const displayFlights = simulatedFlights.length > 0 ? simulatedFlights : normalized;
      setFlights(displayFlights);

      const firstFlight = displayFlights[0];
      if (firstFlight?.live?.latitude) {
        setTimeout(() => centerMapOnFlight(firstFlight), 300);
      }

      flightSimulator.start(null, UPDATE_INTERVAL);
      startUpdateInterval();
    } catch (err) {
      console.error('❌ Error buscando vuelo:', err);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [centerMapOnFlight, startUpdateInterval]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const handleFlightMarkerClick = useCallback((flight) => {
    setSelectedFlight(flight);
  }, []);

  const handleFlightListClick = useCallback((flight, lat, lng) => {
    setFollowingFlight(flight);
    setSelectedFlight(flight);
    if (mapRef.current && !isNaN(lat) && !isNaN(lng)) {
      mapRef.current.setView([lat, lng], 8, { animate: true, duration: 0.8 });
    }
  }, []);

  const handleMapClick = useCallback(() => {
    setFollowingFlight(null);
  }, []);

  return (
    <div className={styles.realtimeMapContainer}>
      <TargetCursor
        targetSelector=".cursor-target"
        radarEffect={true}
        enableSpin={true}
      />

      <div className={styles.mapWrapper}>
        <MapContainer
          center={MAP_CONFIG.center}
          zoom={MAP_CONFIG.zoom}
          minZoom={MAP_CONFIG.minZoom}
          maxZoom={MAP_CONFIG.maxZoom}
          maxBounds={MAP_CONFIG.maxBounds}
          maxBoundsViscosity={MAP_CONFIG.maxBoundsViscosity}
          zoomSnap={MAP_CONFIG.zoomSnap}
          zoomDelta={MAP_CONFIG.zoomDelta}
          style={{ height: '100%', width: '100%', background: '#000000' }}
          zoomControl={false}
          scrollWheelZoom={true}
          doubleClickZoom={true}
          touchZoom={true}
        >
          <MapClickHandler onMapClick={handleMapClick} />
          <TileLayer
            attribution=''
            url={getMapTilerUrl(import.meta.env.VITE_MAPTILER_API_KEY)}
            tileSize={512}
            zoomOffset={-1}
          />
          <MapController mapRef={mapRef} />
          {flights.map((flight, index) => (
            <FlightMarker
              key={flight.id || flight.flightNumber || `flight-${index}`}
              flight={flight}
              index={index}
              onClick={handleFlightMarkerClick}
            />
          ))}
        </MapContainer>

        <FlightsPanel
          flights={flights}
          followingFlight={followingFlight}
          onFlightClick={handleFlightListClick}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSearch={searchForFlight}
          loading={loading}
          hasSearched={hasSearched}
          notFound={notFound}
        />
      </div>
    </div>
  );
};

export default RealTimeMap;
