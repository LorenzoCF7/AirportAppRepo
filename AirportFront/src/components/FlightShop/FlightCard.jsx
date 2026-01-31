import React from 'react';
import { Plane, Clock, Calendar } from 'lucide-react';
import { formatDate } from '../../utils/formatters';
import styles from './FlightCardShop.module.css';

const FlightCard = ({ flight, onBuyClick, className = "" }) => {
  const handleMouseMove = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.setProperty('--mouse-x', `${x}px`);
    card.style.setProperty('--mouse-y', `${y}px`);
  };

  const getGradientColors = (id) => {
    const gradients = [
      { top: '#667EEA', bottom: '#5850EC' },  // Morado primario
      { top: '#8B5CF6', bottom: '#7c3aed' },  // Violeta
      { top: '#3B82F6', bottom: '#2563EB' },  // Azul info
      { top: '#10B981', bottom: '#059669' },  // Verde éxito
      { top: '#F59E0B', bottom: '#D97706' },  // Naranja warning
      { top: '#6366F1', bottom: '#4f46e5' },  // Índigo
    ];
    // Convert id to number if it's a string, or use hash if not a number
    const numericId = typeof id === 'number' ? id : 
                     typeof id === 'string' && !isNaN(id) ? parseInt(id, 10) :
                     // Hash string IDs to get a consistent number
                     id ? id.toString().split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) : 0;
    
    return gradients[Math.abs(numericId) % gradients.length];
  };

  const colors = getGradientColors(flight.id);
  const minPrice = Math.min(flight.prices.economy, flight.prices.business, flight.prices.first);

  return (
    <div
      className={`${styles.flightCard} ${className}`}
      style={{
        '--card-gradient': `linear-gradient(to bottom, ${colors.top}, ${colors.bottom})`,
        '--card-border': colors.top,
        '--spotlight-color': 'rgba(255, 255, 255, 0.25)',
      }}
      onMouseMove={handleMouseMove}
    >
      {/* Pattern background */}
      <div className={styles.cardPattern}></div>

      {/* Header */}
      <div className={styles.flightCardHeader}>
        <div className={styles.airlineSection}>
          <h3 className={styles.airlineName}>{flight.airline.name}</h3>
          <p className={styles.flightCode}>{flight.flightIATA}</p>
        </div>
        <div className={styles.priceTag}>
          <div className={styles.priceIcon}>
            <Plane size={16} fill={colors.top} />
          </div>
          <p className={styles.priceText}>desde {minPrice.toFixed(2)}€</p>
        </div>
      </div>

      {/* Route visualization */}
      <div className={styles.routeVisual}>
        <div className={styles.airportInfo}>
          <div className={styles.iataLarge}>{flight.origin.iata}</div>
          <div className={styles.citySmall}>{flight.origin.city}</div>
          <div className={styles.timeInfo}>{flight.departure.time}</div>
        </div>

        <div className={styles.flightPath}>
          <div className={styles.pathLine}></div>
          <div className={styles.durationBadge}>
            <Clock size={12} />
            <span>{flight.duration.formatted}</span>
          </div>
        </div>

        <div className={styles.airportInfo}>
          <div className={styles.iataLarge}>{flight.destination.iata}</div>
          <div className={styles.citySmall}>{flight.destination.city}</div>
          <div className={styles.timeInfo}>{flight.arrival.time}</div>
        </div>
      </div>

      {/* Date */}
      <div className={styles.flightDateBadge}>
        <Calendar size={14} />
        <span>{formatDate(flight.departure.date)}</span>
      </div>

      {/* Class options */}
      <div className={styles.classOptions}>
        <button
          className={styles.classBtn}
          onClick={() => onBuyClick(flight, 'economy')}
          disabled={flight.availableSeats.economy === 0}
        >
          <span className={styles.classLabel}>Turista</span>
          <span className={styles.classPrice}>{flight.prices.economy.toFixed(2)}€</span>
        </button>
        <button
          className={styles.classBtn}
          onClick={() => onBuyClick(flight, 'business')}
          disabled={flight.availableSeats.business === 0}
        >
          <span className={styles.classLabel}>Business</span>
          <span className={styles.classPrice}>{flight.prices.business.toFixed(2)}€</span>
        </button>
        <button
          className={styles.classBtn}
          onClick={() => onBuyClick(flight, 'first')}
          disabled={flight.availableSeats.first === 0}
        >
          <span className={styles.classLabel}>Primera</span>
          <span className={styles.classPrice}>{flight.prices.first.toFixed(2)}€</span>
        </button>
      </div>
    </div>
  );
};

export default FlightCard;
