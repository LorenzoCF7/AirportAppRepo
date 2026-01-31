import { createPortal } from 'react-dom';
import { X, Plane, Clock, MapPin, Navigation, Gauge, TrendingUp, Calendar, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import styles from './FlightDetails.module.css';

const FlightDetails = ({ flight, onClose, isFlipped = false }) => {
  if (!flight) return null;

  const formatDateTime = (dateString) => {
    if (!dateString) return 'No disponible';
    try {
      return format(new Date(dateString), "dd 'de' MMMM 'a las' HH:mm", { locale: es });
    } catch {
      return 'No disponible';
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return '--:--';
    try {
      return format(new Date(dateString), 'HH:mm', { locale: es });
    } catch {
      return '--:--';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No disponible';
    try {
      // Si es solo fecha (YYYY-MM-DD), parsearla correctamente
      if (dateString.length === 10 && dateString.includes('-')) {
        const [year, month, day] = dateString.split('-');
        return format(new Date(year, month - 1, day), "dd 'de' MMMM 'de' yyyy", { locale: es });
      }
      // Si es fecha completa con hora
      return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy", { locale: es });
    } catch {
      return 'No disponible';
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      scheduled: '#3B82F6',
      active: '#10B981',
      landed: '#F59E0B',
      cancelled: '#ef4444',
      diverted: '#f59e0b'
    };
    return colors[status] || '#3b82f6';
  };

  const getStatusGradient = (status) => {
    const gradients = {
      scheduled: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
      active: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
      landed: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
      cancelled: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
      diverted: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
    };
    return gradients[status] || gradients.scheduled;
  };

  const getStatusText = (status) => {
    const texts = {
      scheduled: 'Programado',
      active: 'En Vuelo',
      landed: 'Aterrizado',
      cancelled: 'Cancelado',
      diverted: 'Desviado'
    };
    return texts[status] || status;
  };

  const modalContent = (
    <div className={`${styles.modalOverlay} ${isFlipped ? styles.flippedMode : ''}`} onClick={isFlipped ? undefined : onClose}>
      <div 
        className={styles.modalContent} 
        onClick={(e) => e.stopPropagation()}
        style={{
          '--status-color': getStatusColor(flight.flight_status),
          '--status-gradient': getStatusGradient(flight.flight_status)
        }}
      >
        <div className={styles.modalHeader}>
          <div className={styles.modalTitle}>
            <Plane size={24} />
            <div>
              <h2>Vuelo {flight.flightNumber || flight.flight?.iata || flight.id || 'N/A'}</h2>
              <p>{flight.airline?.name || flight.airline || 'Aerolínea desconocida'}</p>
            </div>
          </div>
          <button onClick={onClose} className={styles.closeButton}>
            <X size={24} />
          </button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.statusBanner} style={{ backgroundColor: getStatusColor(flight.flight_status) }}>
            <span className={styles.statusText}>{getStatusText(flight.flight_status)}</span>
          </div>

          <div className={styles.detailSection}>
            <h3 className={styles.sectionTitle}>
              <Calendar size={18} />
              Información del Vuelo
            </h3>
            <div className={styles.detailGrid}>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Número de Vuelo</span>
                <span className={styles.detailValue}>{flight.flightNumber || flight.flight?.iata || flight.id || 'N/A'}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Fecha</span>
                <span className={styles.detailValue}>
                  {flight.flight_date ? formatDate(flight.flight_date) : 
                   flight.departure?.scheduled ? formatDate(flight.departure.scheduled) : 
                   'No disponible'}
                </span>
              </div>
              {(flight.aircraft?.iata || flight.aircraft?.registration) && (
                <>
                  {flight.aircraft?.iata && (
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Aeronave</span>
                      <span className={styles.detailValue}>{flight.aircraft.iata}</span>
                    </div>
                  )}
                  {flight.aircraft?.registration && (
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Matrícula</span>
                      <span className={styles.detailValue}>{flight.aircraft.registration}</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          <div className={styles.airportsSection}>
            <div className={styles.airportDetail}>
              <div className={styles.airportHeader}>
                <MapPin size={20} className={styles.airportIconLarge} />
                <h3>Salida</h3>
              </div>
              {flight.departure?.airport && (
                <div className={styles.airportName}>{flight.departure.airport}</div>
              )}
              <div className={styles.airportCodeLarge}>{flight.departure?.iata || 'N/A'}</div>
              <div className={styles.timeInfo}>
                <div className={styles.timeItem}>
                  <span className={styles.timeLabel}>Programado</span>
                  <span className={styles.timeValue}>{formatTime(flight.departure?.scheduled)}</span>
                </div>
                {flight.departure?.estimated && (
                  <div className={styles.timeItem}>
                    <span className={styles.timeLabel}>Estimado</span>
                    <span className={styles.timeValue}>{formatTime(flight.departure?.estimated)}</span>
                  </div>
                )}
                {flight.departure?.actual && (
                  <div className={styles.timeItem}>
                    <span className={styles.timeLabel}>Real</span>
                    <span className={`${styles.timeValue} ${styles.actual}`}>{formatTime(flight.departure?.actual)}</span>
                  </div>
                )}
              </div>
              {flight.departure?.terminal && (
                <div className={styles.gateInfo}>
                  <span>Terminal {flight.departure.terminal}</span>
                  {flight.departure?.gate && <span>Puerta {flight.departure.gate}</span>}
                </div>
              )}
            </div>

            <div className={styles.flightPath}>
              <div className={styles.pathLine}>
                <Plane size={24} className={styles.pathPlane} />
              </div>
            </div>

            <div className={styles.airportDetail}>
              <div className={styles.airportHeader}>
                <MapPin size={20} className={styles.airportIconLarge} />
                <h3>Llegada</h3>
              </div>
              {flight.arrival?.airport && (
                <div className={styles.airportName}>{flight.arrival.airport}</div>
              )}
              <div className={styles.airportCodeLarge}>{flight.arrival?.iata || 'N/A'}</div>
              <div className={styles.timeInfo}>
                <div className={styles.timeItem}>
                  <span className={styles.timeLabel}>Programado</span>
                  <span className={styles.timeValue}>{formatTime(flight.arrival?.scheduled)}</span>
                </div>
                {flight.arrival?.estimated && (
                  <div className={styles.timeItem}>
                    <span className={styles.timeLabel}>Estimado</span>
                    <span className={styles.timeValue}>{formatTime(flight.arrival?.estimated)}</span>
                  </div>
                )}
                {flight.arrival?.actual && (
                  <div className={styles.timeItem}>
                    <span className={styles.timeLabel}>Real</span>
                    <span className={`${styles.timeValue} ${styles.actual}`}>{formatTime(flight.arrival?.actual)}</span>
                  </div>
                )}
              </div>
              {flight.arrival?.terminal && (
                <div className={styles.gateInfo}>
                  <span>Terminal {flight.arrival.terminal}</span>
                  {flight.arrival?.gate && <span>Puerta {flight.arrival.gate}</span>}
                </div>
              )}
            </div>
          </div>

          {flight.live && flight.flight_status !== 'landed' && (
            <div className={`${styles.detailSection} ${styles.liveSection}`}>
              <h3 className={styles.sectionTitle}>
                <Navigation size={18} />
                Datos en Tiempo Real
              </h3>
              <div className={styles.liveDataGrid}>
                <div className={styles.liveDataItem}>
                  <Gauge className={styles.liveIcon} />
                  <div>
                    <span className={styles.liveLabel}>Altitud</span>
                    <span className={styles.liveValue}>{Math.round(flight.live.altitude).toLocaleString()} ft</span>
                  </div>
                </div>
                <div className={styles.liveDataItem}>
                  <TrendingUp className={styles.liveIcon} />
                  <div>
                    <span className={styles.liveLabel}>Velocidad</span>
                    <span className={styles.liveValue}>{flight.live.speed_horizontal?.toFixed(2)} km/h</span>
                  </div>
                </div>
                <div className={styles.liveDataItem}>
                  <Navigation className={styles.liveIcon} />
                  <div>
                    <span className={styles.liveLabel}>Dirección</span>
                    <span className={styles.liveValue}>{flight.live.direction?.toFixed(2)}°</span>
                  </div>
                </div>
                <div className={styles.liveDataItem}>
                  <Clock className={styles.liveIcon} />
                  <div>
                    <span className={styles.liveLabel}>Última actualización</span>
                    <span className={styles.liveValue}>{formatTime(flight.live.updated)}</span>
                  </div>
                </div>
              </div>
              <div className={styles.liveCoordinates}>
                <span>Coordenadas: {flight.live.latitude?.toFixed(2)}°, {flight.live.longitude?.toFixed(2)}°</span>
              </div>
            </div>
          )}

          {flight.flight_status === 'landed' && (
            <div className={`${styles.detailSection} ${styles.landedSection}`}>
              <h3 className={styles.sectionTitle}>
                <CheckCircle size={18} />
                Vuelo Finalizado
              </h3>
              <p className={styles.landedMessage}>
                Este vuelo ha aterrizado en {flight.arrival?.airport || flight.destination}
                {flight.arrival?.actual && ` a las ${formatTime(flight.arrival.actual)}`}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Si está en modo flipped (dentro de FlipCard), renderizar directamente
  if (isFlipped) {
    return modalContent;
  }

  // Si no está flipped, usar portal para renderizar fuera del custom element
  return createPortal(modalContent, document.body);
};

export default FlightDetails;
