import { Plane, Clock, Calendar, ArrowRight } from 'lucide-react';
import { formatDate } from '../../utils/formatters';
import styles from './FlightCardShop.module.css';

const CLASS_LABELS = { economy: 'Turista', business: 'Business', first: 'Primera' };

const FlightCard = ({ flight, cabinClass = 'economy', onBuyClick, isCheapest, isBest, isShortest }) => {
  const price = flight.prices[cabinClass];
  const classLabel = CLASS_LABELS[cabinClass];
  const isAvailable = flight.availableSeats[cabinClass] > 0;

  return (
    <div className={styles.flightCard}>
      {/* Badges superiores */}
      {(isBest || isCheapest || isShortest) && (
        <div className={styles.badges}>
          {isBest && <span className={`${styles.badge} ${styles.badgeBest}`}>El mejor</span>}
          {isCheapest && <span className={`${styles.badge} ${styles.badgeCheap}`}>El más barato</span>}
          {isShortest && !isBest && !isCheapest && (
            <span className={`${styles.badge} ${styles.badgeShortest}`}>Menor duración</span>
          )}
        </div>
      )}

      <div className={styles.cardBody}>
        {/* Aerolínea */}
        <div className={styles.airlineCol}>
          <div className={styles.airlineIconWrap}>
            <Plane size={18} />
          </div>
          <div className={styles.airlineInfo}>
            <span className={styles.airlineName}>{flight.airline.name}</span>
            <span className={styles.flightCode}>{flight.flightIATA}</span>
          </div>
        </div>

        {/* Horarios y ruta */}
        <div className={styles.routeCol}>
          <div className={styles.times}>
            <span className={styles.time}>{flight.departure.time}</span>
            <ArrowRight size={14} className={styles.timeArrow} />
            <span className={styles.time}>{flight.arrival.time}</span>
          </div>
          <div className={styles.route}>
            <span className={styles.iata}>{flight.origin.iata}</span>
            <span className={styles.cityName}>{flight.origin.city}</span>
            <span className={styles.routeSep}>›</span>
            <span className={styles.iata}>{flight.destination.iata}</span>
            <span className={styles.cityName}>{flight.destination.city}</span>
          </div>
          <div className={styles.dateBadge}>
            <Calendar size={11} />
            <span>{formatDate(flight.departure.date)}</span>
          </div>
        </div>

        {/* Escalas */}
        <div className={styles.stopsCol}>
          <span className={styles.directBadge}>directo</span>
        </div>

        {/* Duración */}
        <div className={styles.durationCol}>
          <Clock size={13} className={styles.durationIcon} />
          <span className={styles.duration}>{flight.duration.formatted}</span>
        </div>

        {/* Precio y acción */}
        <div className={styles.priceCol}>
          {isAvailable ? (
            <>
              <div className={styles.priceAmount}>{price.toFixed(0)} €</div>
              <div className={styles.priceClass}>{classLabel}</div>
              <button
                className={styles.selectBtn}
                onClick={() => onBuyClick(flight, cabinClass)}
              >
                Seleccionar
              </button>
            </>
          ) : (
            <>
              <div className={`${styles.priceAmount} ${styles.priceUnavailable}`}>{price.toFixed(0)} €</div>
              <div className={styles.priceClass}>{classLabel}</div>
              <span className={styles.soldOut}>Agotado</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FlightCard;
