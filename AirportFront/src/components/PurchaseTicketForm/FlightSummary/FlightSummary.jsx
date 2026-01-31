import { memo } from 'react';
import { Plane, Calendar } from 'lucide-react';
import { formatDate } from '../../../utils/formatters';
import styles from '../PurchaseTicketForm.module.css';

// Resumen compacto del vuelo seleccionado
const FlightSummary = memo(({ flight }) => {
  if (!flight) return null;

  const departureTime = flight.departure?.scheduled?.split('T')[1]?.substring(0, 5);
  const arrivalTime = flight.arrival?.estimated?.split('T')[1]?.substring(0, 5) 
    || flight.arrival?.scheduled?.split('T')[1]?.substring(0, 5);
  const departureDate = flight.departure?.scheduled?.split('T')[0];

  return (
    <div className={styles.flightInfoSection}>
      <h3><Plane size={20} /> Información del Vuelo</h3>
      
      <div className={styles.flightSummary}>
        {/* Header con aerolínea y número de vuelo */}
        <div className={styles.airlineHeader}>
          <span className={styles.airline}>
            {flight.airline?.name || 'Aerolínea'}
          </span>
          <span className={styles.flightNum}>
            {flight.flight?.iata || flight.flightNumber}
          </span>
        </div>

        {/* Ruta: origen → destino */}
        <div className={styles.routeDisplay}>
          <div className={styles.location}>
            <span className={styles.iata}>{flight.departure?.iata}</span>
            <span className={styles.city}>{flight.departure?.city}</span>
            <span className={styles.time}>{departureTime}</span>
          </div>
          
          <div className={styles.arrow}>
            <Plane size={24} />
          </div>
          
          <div className={styles.location}>
            <span className={styles.iata}>{flight.arrival?.iata}</span>
            <span className={styles.city}>{flight.arrival?.city}</span>
            <span className={styles.time}>{arrivalTime}</span>
          </div>
        </div>

        {/* Fecha de salida */}
        <div className={styles.dateInfo}>
          <Calendar size={16} />
          <span>{formatDate(departureDate)}</span>
        </div>
      </div>
    </div>
  );
});

FlightSummary.displayName = 'FlightSummary';

export default FlightSummary;
