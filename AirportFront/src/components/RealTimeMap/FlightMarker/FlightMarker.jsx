import { memo, useEffect, useRef } from 'react';
import { Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Plane, Navigation, Gauge, TrendingUp, MapPin as MapPinIcon } from 'lucide-react';
import { formatAltitude, formatSpeed } from '../../../utils/formatters';
import styles from '../RealTimeMap.module.css';

// Crea un icono SVG de avión con rotación y efectos visuales
export const createPlaneIcon = (rotation = 0, isActive = false, flightId = '') => {
  const svgIcon = `
    <svg width="48" height="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" data-flight-id="${flightId}">
      <defs>
        <linearGradient id="planeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      <!-- Estela del avión -->
      <ellipse cx="24" cy="24" rx="20" ry="8" fill="url(#planeGradient)" opacity="0.2" transform="rotate(${rotation} 24 24)"/>
      <ellipse cx="24" cy="24" rx="14" ry="6" fill="url(#planeGradient)" opacity="0.3" transform="rotate(${rotation} 24 24)"/>
      
      <!-- Avión principal -->
      <g transform="rotate(${rotation} 24 24)" filter="url(#glow)">
        <path d="M42 32v-4l-16-10V7c0-1.66-1.34-3-3-3s-3 1.34-3 3v11L4 28v4l16-5v11l-4 3v3l7-2 7 2v-3l-4-3V27l16 5z" 
              fill="url(#planeGradient)" stroke="white" stroke-width="0.5"/>
      </g>
      
      <!-- Punto brillante si está activo -->
      ${isActive ? '<circle cx="24" cy="24" r="3" fill="#10b981" filter="url(#glow)"/>' : ''}
    </svg>
  `;
  
  return L.divIcon({
    html: svgIcon,
    className: 'plane-icon cursor-target',
    iconSize: [48, 48],
    iconAnchor: [24, 24],
  });
};

// Calcula la ruta visual del vuelo (simplificada)
const getFlightPath = (flight) => {
  if (!flight.live || !flight.departure || !flight.arrival) return null;
  
  // Posiciones simuladas basadas en la posición actual
  const dummyDepartureCoords = [
    flight.live.latitude - 5,
    flight.live.longitude - 5
  ];
  const dummyArrivalCoords = [
    flight.live.latitude + 5,
    flight.live.longitude + 5
  ];
  
  return [
    dummyDepartureCoords,
    [flight.live.latitude, flight.live.longitude],
    dummyArrivalCoords
  ];
};

// Popup con información del vuelo
const FlightPopupContent = memo(({ flight }) => (
  <div className={styles.flightPopup}>
    <div className={styles.popupHeader}>
      <Plane size={20} />
      <strong>{flight.flightNumber || flight.flight?.iata || flight.id || 'N/A'}</strong>
    </div>
    <div className={styles.popupContent}>
      <div className={styles.popupRow}>
        <MapPinIcon size={16} />
        <span>
          {flight.origin || flight.departure?.iata || '?'} → {flight.destination || flight.arrival?.iata || '?'}
        </span>
      </div>
      <div className={styles.popupRow}>
        <Gauge size={16} />
        <span>Alt: {formatAltitude(flight.live?.altitude)}</span>
      </div>
      <div className={styles.popupRow}>
        <TrendingUp size={16} />
        <span>Vel: {formatSpeed(flight.live?.speed_horizontal || flight.live?.speed)}</span>
      </div>
      <div className={styles.popupRow}>
        <Navigation size={16} />
        <span>Dir: {flight.live?.direction}°</span>
      </div>
    </div>
    <div className={styles.popupFooter}>
      {flight.airline?.name || flight.airline}
    </div>
  </div>
));

FlightPopupContent.displayName = 'FlightPopupContent';

// Marcador de vuelo en el mapa con icono rotado, ruta y popup
const FlightMarker = ({ flight, onClick, index }) => {
  const markerRef = useRef(null);
  
  if (!flight.live) return null;
  
  const position = [flight.live.latitude, flight.live.longitude];
  const rotation = flight.live.direction || 0;
  const path = getFlightPath(flight);
  const uniqueKey = flight.id || flight.flightNumber || `flight-${index}`;
  const isActive = flight.flight_status === 'active';
  
  // Actualizar posición del marker cuando cambian las coordenadas
  useEffect(() => {
    if (markerRef.current && flight.live) {
      const marker = markerRef.current;
      const newPos = [flight.live.latitude, flight.live.longitude];
      marker.setLatLng(newPos);
      marker.setIcon(createPlaneIcon(rotation, isActive, uniqueKey));
    }
  }, [flight.live?.latitude, flight.live?.longitude, rotation, isActive, uniqueKey]);
  
  return (
    <>
      {/* Ruta del vuelo con línea punteada */}
      {path && (
        <Polyline
          positions={path}
          color="#764ba2"
          weight={3}
          opacity={0.5}
          dashArray="5, 10"
          className={styles.flightPath}
        />
      )}
      
      {/* Marcador del avión */}
      <Marker
        ref={markerRef}
        position={position}
        icon={createPlaneIcon(rotation, isActive, uniqueKey)}
        eventHandlers={{
          click: () => onClick(flight),
        }}
      >
        <Popup>
          <FlightPopupContent flight={flight} />
        </Popup>
      </Marker>
    </>
  );
};

FlightMarker.displayName = 'FlightMarker';

export default FlightMarker;
