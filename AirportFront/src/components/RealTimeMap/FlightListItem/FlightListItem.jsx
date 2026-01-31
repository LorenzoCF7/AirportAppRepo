import { memo } from 'react';
import { Plane } from 'lucide-react';
import { formatAltitude, formatSpeed, formatTime } from '../../../utils/formatters';
import styles from '../RealTimeMap.module.css';

// Ítem individual en la lista de vuelos
const FlightListItem = memo(({ flight, isFollowing, onClick }) => {
  // Validar coordenadas antes de renderizar
  if (!flight?.live?.latitude || !flight?.live?.longitude) {
    return null;
  }
  
  const flightLat = Number(flight.live.latitude);
  const flightLng = Number(flight.live.longitude);
  
  if (isNaN(flightLat) || isNaN(flightLng)) {
    return null;
  }

  const handleClick = () => {
    onClick(flight, flightLat, flightLng);
  };

  return (
    <div
      className={`${styles.flightListItem} ${isFollowing ? `${styles.selected} ${styles.following}` : ''}`}
      onClick={handleClick}
    >
      <div className={styles.flightListHeader}>
        <Plane size={16} className={styles.rotating} />
        <strong>{flight.flightNumber || flight.flight?.iata || 'N/A'}</strong>
        <div className={`${styles.liveBadge} ${styles.pulse}`}>
          {isFollowing ? '⊕ SIGUIENDO' : '🔴 GPS'}
        </div>
      </div>
      
      <div className={styles.flightListRoute}>
        <div className={styles.flightRouteInfo}>
          <span className={styles.routeOrigin}>
            {flight.origin || flight.departure?.iata || 'N/A'}
          </span>
          <span className={styles.routeArrow}>→</span>
          <span className={styles.routeDestination}>
            {flight.destination || flight.arrival?.iata || 'N/A'}
          </span>
        </div>
        
        {flight.departure?.scheduledTime && (
          <div className={styles.flightScheduleInfo}>
            🛫 {formatTime(flight.departure.scheduledTime)}
            {flight.arrival?.estimatedTime && (
              <> • 🛬 {formatTime(flight.arrival.estimatedTime)}</>
            )}
          </div>
        )}
      </div>
      
      <div className={styles.flightListData}>
        <span>{formatAltitude(flight.live?.altitude)}</span>
        <span>{formatSpeed(flight.live?.speed_horizontal || flight.live?.speed)}</span>
        <span title={`Lat: ${flightLat.toFixed(4)}, Lng: ${flightLng.toFixed(4)}`}>
          📍 {flightLat.toFixed(2)}°, {flightLng.toFixed(2)}°
        </span>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Comparación personalizada para optimización
  return (
    prevProps.isFollowing === nextProps.isFollowing &&
    prevProps.flight.live?.latitude === nextProps.flight.live?.latitude &&
    prevProps.flight.live?.longitude === nextProps.flight.live?.longitude &&
    prevProps.flight.live?.altitude === nextProps.flight.live?.altitude
  );
});

FlightListItem.displayName = 'FlightListItem';

export default FlightListItem;
