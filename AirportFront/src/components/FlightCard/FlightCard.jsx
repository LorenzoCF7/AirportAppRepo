import { memo } from 'react';
import { animated } from '@react-spring/web';
import { Plane, MapPin, ArrowRight } from 'lucide-react';

import { useFlightProgress, useFlightAnimation } from '../../hooks';
import { getStatusConfig, isFlightActive } from '../../utils/flightStatus.jsx';
import { formatTime, formatDate } from '../../utils/formatters';
import { FLIGHT_STATUS } from '../../constants';
import styles from './FlightCard.module.css';

// Componente de tarjeta de vuelo optimizado con animaciones spring
const FlightCard = memo(({ flight, onSelect, index = 0 }) => {
  // Hook para calcular progreso (0-100%)
  const progress = useFlightProgress(flight);
  
  // Hook para animación de entrada con stagger
  const springProps = useFlightAnimation({
    index,
    delay: index * 50,
    config: { tension: 280, friction: 24 }
  });

  // Obtener configuración de estado (icono, colores, label)
  const statusConfig = getStatusConfig(flight.flight_status);
  
  // Verificar si el vuelo está activo para mostrar avión en progreso
  const isActive = isFlightActive(flight.flight_status);

  return (
    <animated.div
      className={styles.card}
      style={{
        ...springProps,
        '--flight-gradient': statusConfig.gradient,
        '--flight-color': statusConfig.color,
        '--flight-shadow-color': statusConfig.shadowColor,
        '--status-bg': statusConfig.bg,
        '--status-color': statusConfig.color
      }}
      onClick={() => onSelect(flight)}
    >
      {/* Header con número de vuelo y estado */}
      <div className={styles.cardHeader}>
        <div className={styles.flightInfo}>
          <div className={styles.flightDetails}>
            <div className={styles.flightIconWrapper}>
              <Plane />
            </div>
            <div className={styles.flightNumber}>
              {flight.flightNumber || flight.flight?.iata || 'N/A'}
            </div>
          </div>
          <div className={styles.airlineName}>
            {flight.airline?.name || flight.airline || 'N/A'}
          </div>
        </div>
        
        <div className={`${styles.statusBadge} ${statusConfig.rotating ? styles.rotating : ''}`}>
          {statusConfig.icon}
          <span>{statusConfig.label}</span>
        </div>
      </div>

      {/* Sección de ruta: origen → destino */}
      <div className={styles.routeSection}>
        {/* Aeropuerto de origen */}
        <AirportInfo
          code={flight.origin || flight.departure?.iata}
          city={flight.departure?.city}
          time={flight.departure?.scheduledTime || flight.departure?.scheduled}
          delay={flight.departure?.delayed}
          colorScheme={{ bg: 'rgba(139, 92, 246, 0.1)', color: '#8B5CF6' }}
        />

        {/* Barra de progreso */}
        <div className={styles.progressContainer}>
          <div className={styles.progressBar} style={{ width: `${progress}%` }}>
            {isActive && (
              <div className={styles.progressPlane}>
                <Plane />
              </div>
            )}
          </div>
        </div>

        {/* Aeropuerto de destino */}
        <AirportInfo
          code={flight.destination || flight.arrival?.iata}
          city={flight.arrival?.city}
          time={flight.arrival?.estimatedTime || flight.arrival?.scheduled}
          colorScheme={{ bg: 'rgba(16, 185, 129, 0.1)', color: '#10B981' }}
        />
      </div>

      {/* Footer con enlace a detalles */}
      <div className={styles.cardFooter}>
        <div className={styles.detailsLink}>
          <span>Ver detalles completos</span>
          <ArrowRight />
        </div>
      </div>
    </animated.div>
  );
});

// Sub-componente para información de aeropuerto
const AirportInfo = memo(({ code, city, time, delay, colorScheme }) => (
  <div className={styles.airportInfo}>
    <div 
      className={styles.airportIconWrapper}
      style={{ '--airport-bg': colorScheme.bg, '--airport-color': colorScheme.color }}
    >
      <MapPin />
    </div>
    <div className={styles.airportDetails}>
      <div className={styles.airportHeader}>
        <div className={styles.airportCode}>{code || 'N/A'}</div>
        {city && <div className={styles.airportCity}>{city}</div>}
      </div>
      <div className={styles.flightTimeInfo}>
        <div className={styles.flightTime}>{formatTime(time)}</div>
        <div className={styles.flightDate}>{formatDate(time)}</div>
      </div>
      {delay && (
        <div className={styles.delayBadge}>+{delay} min retraso</div>
      )}
    </div>
  </div>
));

AirportInfo.displayName = 'AirportInfo';
FlightCard.displayName = 'FlightCard';

export default FlightCard;
