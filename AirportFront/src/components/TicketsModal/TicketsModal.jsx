import { useEffect, useState } from 'react';
import { X, Plane, Wallet } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { ticketService } from '../../services/ticketService';
import { useScrollLock } from '../../hooks';
import styles from './TicketsModal.module.css';

// ── Helpers ──────────────────────────────────────────────────────────────────

const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  const d = new Date(dateStr);
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
};

const getBoardingTime = (depTime) => {
  if (!depTime) return '--:--';
  const [h, m] = depTime.split(':').map(Number);
  const totalMins = h * 60 + m - 45;
  const bh = Math.floor(((totalMins % 1440) + 1440) / 60) % 24;
  const bm = ((totalMins % 60) + 60) % 60;
  return `${String(bh).padStart(2, '0')}:${String(bm).padStart(2, '0')}`;
};

const calcDuration = (dep, arr) => {
  if (!dep || !arr) return '';
  const [dh, dm] = dep.split(':').map(Number);
  const [ah, am] = arr.split(':').map(Number);
  let diff = (ah * 60 + am) - (dh * 60 + dm);
  if (diff < 0) diff += 1440;
  return diff > 0 ? `${Math.floor(diff / 60)}h ${diff % 60}m` : '';
};

const CLASS_LABELS = { economy: 'TURISTA', business: 'BUSINESS', first: 'PRIMERA' };
const BAGGAGE_LABELS = { none: 'Solo cabina', hold23: '1 × 23 kg', hold23x2: '2 × 23 kg', hold32: '1 × 32 kg' };
const MEAL_LABELS = {
  none: null, vegetarian: 'Vegetariano', vegan: 'Vegano',
  glutenfree: 'Sin gluten', halal: 'Halal', lowsodium: 'Bajo sodio', diabetic: 'Diabético',
};

// ── Real QR code linking to validation page ───────────────────────────────────

const CLASS_LABEL = { economy: 'TURISTA', business: 'BUSINESS', first: 'PRIMERA' };

const buildQRValue = (ticket) => {
  const host = window.location.hostname;
  const isLocal = host === 'localhost' || host === '127.0.0.1';

  const params = new URLSearchParams({
    ref:       ticket.bookingReference || ticket.flightIATA || '',
    airline:   ticket.airlineName      || 'Aerolínea',
    from:      ticket.departureIATA    || '---',
    fromCity:  ticket.departureCity    || '',
    to:        ticket.arrivalIATA      || '---',
    toCity:    ticket.arrivalCity      || '',
    depTime:   ticket.departureTime    || '--:--',
    arrTime:   ticket.arrivalTime      || '--:--',
    flight:    ticket.flightIATA       || ticket.flightNumber || '',
    passenger: ticket.passengerName    || '',
    seat:      ticket.seatNumber       || '',
    date:      ticket.departureDate    || '',
    cls:       CLASS_LABEL[ticket.ticketClass] || 'TURISTA',
    price:     String(ticket.price     || ''),
    status:    ticket.ticketStatus     || 'confirmed',
  });

  if (!isLocal) {
    return `${window.location.origin}/validate.html?${params.toString()}`;
  }

  // Localhost: plain ASCII text (no emoji/special chars = smaller QR = easier to scan)
  const isCancelled = ticket.ticketStatus === 'cancelled';
  const cls = CLASS_LABEL[ticket.ticketClass] || 'TURISTA';
  const lines = [
    isCancelled ? 'BILLETE CANCELADO' : 'BILLETE VALIDO',
    `VUELO: ${ticket.flightIATA || ticket.flightNumber || ''}`,
    `${ticket.departureIATA || '---'} -> ${ticket.arrivalIATA || '---'}`,
    `FECHA: ${ticket.departureDate || ''}`,
    `${ticket.departureTime || '--:--'} -> ${ticket.arrivalTime || '--:--'}`,
    `PASAJERO: ${(ticket.passengerName || '').toUpperCase()}`,
    `ASIENTO: ${ticket.seatNumber || ''} | ${cls}`,
    `REF: ${ticket.bookingReference || ''}`,
    `PRECIO: ${ticket.price || ''} EUR`,
  ];
  return lines.join('\n');
};

const TicketQR = ({ ticket }) => (
  <QRCodeSVG
    value={buildQRValue(ticket)}
    size={120}
    bgColor="#ffffff"
    fgColor="#0f172a"
    level="L"
    style={{ display: 'block' }}
  />
);

// ── Boarding pass card ────────────────────────────────────────────────────────

const BoardingPass = ({ ticket }) => {
  const duration = calcDuration(ticket.departureTime, ticket.arrivalTime);
  const boardingTime = getBoardingTime(ticket.departureTime);
  const classLabel = CLASS_LABELS[ticket.ticketClass] || (ticket.ticketClass || 'TURISTA').toUpperCase();
  const isCancelled = ticket.ticketStatus === 'cancelled';

  const hasExtras = ticket.baggage || ticket.meal || ticket.priorityBoarding ||
    ticket.insurance || ticket.loungeAccess;

  return (
    <div className={`${styles.pass} ${isCancelled ? styles.passCancelled : ''}`}>

      {/* ── Top bar: airline + status ── */}
      <div className={styles.passTopBar}>
        <div className={styles.passAirline}>
          <Plane size={15} />
          <span>{ticket.airlineName || 'Aerolínea'}</span>
        </div>
        <span className={`${styles.passStatus} ${isCancelled ? styles.passStatusCancelled : styles.passStatusConfirmed}`}>
          {isCancelled ? '✗ CANCELADO' : '✓ CONFIRMADO'}
        </span>
      </div>

      {/* ── Route ── */}
      <div className={styles.passRoute}>
        <div className={styles.passAirport}>
          <span className={styles.passIata}>{ticket.departureIATA || '---'}</span>
          <span className={styles.passCity}>{ticket.departureCity || ''}</span>
          <span className={styles.passTimeLabel}>SALIDA</span>
          <span className={styles.passTime}>{ticket.departureTime || '--:--'}</span>
        </div>

        <div className={styles.passFlightViz}>
          <div className={styles.passFlightDot} />
          <div className={styles.passFlightLine} />
          <div className={styles.passFlightPlane}><Plane size={14} /></div>
          <div className={styles.passFlightLine} />
          <div className={styles.passFlightDot} />
          {duration && <span className={styles.passDuration}>{duration}</span>}
          <span className={styles.passFlightNum}>{ticket.flightIATA || ticket.flightNumber}</span>
        </div>

        <div className={`${styles.passAirport} ${styles.passAirportRight}`}>
          <span className={styles.passIata}>{ticket.arrivalIATA || '---'}</span>
          <span className={styles.passCity}>{ticket.arrivalCity || ''}</span>
          <span className={styles.passTimeLabel}>LLEGADA</span>
          <span className={styles.passTime}>{ticket.arrivalTime || '--:--'}</span>
        </div>
      </div>

      {/* ── Notch divider ── */}
      <div className={styles.passDivider}>
        <div className={styles.passNotch} />
        <div className={styles.passDash} />
        <div className={styles.passNotch} />
      </div>

      {/* ── Passenger details grid ── */}
      <div className={styles.passDetails}>
        <div className={styles.passDetailItem} style={{ gridColumn: '1 / 3' }}>
          <span className={styles.passDetailLabel}>Pasajero</span>
          <span className={`${styles.passDetailValue} ${styles.passDetailLarge}`}>
            {ticket.passengerName || 'N/A'}
          </span>
        </div>
        <div className={styles.passDetailItem}>
          <span className={styles.passDetailLabel}>Asiento</span>
          <span className={`${styles.passDetailValue} ${styles.passSeat}`}>
            {ticket.seatNumber || '--'}
          </span>
        </div>
        <div className={styles.passDetailItem}>
          <span className={styles.passDetailLabel}>Clase</span>
          <span className={styles.passDetailValue}>{classLabel}</span>
        </div>
        <div className={styles.passDetailItem}>
          <span className={styles.passDetailLabel}>Fecha</span>
          <span className={styles.passDetailValue}>{formatDate(ticket.departureDate)}</span>
        </div>
        <div className={styles.passDetailItem}>
          <span className={styles.passDetailLabel}>Embarque</span>
          <span className={styles.passDetailValue}>{boardingTime}</span>
        </div>
        <div className={styles.passDetailItem} style={{ gridColumn: '1 / -1' }}>
          <span className={styles.passDetailLabel}>Localizador</span>
          <span className={`${styles.passDetailValue} ${styles.passRef}`}>
            {ticket.bookingReference || 'N/A'}
          </span>
        </div>
      </div>

      {/* ── Extras badges ── */}
      {hasExtras && (
        <div className={styles.passExtras}>
          {ticket.baggage && ticket.baggage !== 'none' && (
            <span className={styles.passExtraBadge}>🧳 {BAGGAGE_LABELS[ticket.baggage] || ticket.baggage}</span>
          )}
          {ticket.meal && MEAL_LABELS[ticket.meal] && (
            <span className={styles.passExtraBadge}>🍽 {MEAL_LABELS[ticket.meal]}</span>
          )}
          {ticket.priorityBoarding && <span className={styles.passExtraBadge}>⚡ Embarque prioritario</span>}
          {ticket.insurance && <span className={styles.passExtraBadge}>🛡️ Seguro</span>}
          {ticket.loungeAccess && <span className={styles.passExtraBadge}>✨ Sala VIP</span>}
        </div>
      )}

      {/* ── Notch divider ── */}
      <div className={styles.passDivider}>
        <div className={styles.passNotch} />
        <div className={styles.passDash} />
        <div className={styles.passNotch} />
      </div>

      {/* ── Footer: price + QR ── */}
      <div className={styles.passFooter}>
        <div className={styles.passFooterLeft}>
          <span className={styles.passDetailLabel}>Precio total</span>
          <span className={styles.passPrice}>{Number(ticket.price || 0).toFixed(0)} {ticket.currency || 'EUR'}</span>
          <span className={styles.passDoc}>{ticket.passengerDocument || ''}</span>
        </div>
        <div className={styles.passQrWrap}>
          <TicketQR ticket={ticket} />
          <span className={styles.passQrLabel}>{ticket.bookingReference || ''}</span>
        </div>
      </div>
    </div>
  );
};

// ── Modal ─────────────────────────────────────────────────────────────────────

const TicketsModal = ({ isOpen, onClose, onTicketClick, onViewWallet }) => {
  const [tickets, setTickets] = useState([]);
  useScrollLock(isOpen);

  useEffect(() => {
    if (isOpen) loadTickets();
  }, [isOpen]);

  const loadTickets = async () => {
    try {
      await ticketService.initialize();
      setTickets(await ticketService.getUserTickets());
    } catch {
      setTickets([]);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.ticketsModalOverlay} onClick={onClose}>
      <div className={styles.ticketsModalContent} onClick={e => e.stopPropagation()}>

        <button className={styles.ticketsModalClose} onClick={onClose}>
          <X size={20} />
        </button>

        <div className={styles.ticketsModalHeader}>
          <Plane size={36} className={styles.ticketsModalIcon} />
          <div className={styles.headerContent}>
            <h2>Mis Billetes</h2>
            <p>{tickets.length} {tickets.length === 1 ? 'billete' : 'billetes'} en tu billetera</p>
          </div>
          {onViewWallet && (
            <button className={styles.viewWalletButton} onClick={() => { onClose(); onViewWallet(); }}>
              <Wallet size={18} />
              <span>Ver Billetera</span>
            </button>
          )}
        </div>

        {tickets.length === 0 ? (
          <div className={styles.ticketsEmpty}>
            <div className={styles.ticketsEmptyIcon}><Plane size={56} /></div>
            <h3>No tienes billetes aún</h3>
            <p>Compra tu primer vuelo en la tienda de billetes</p>
          </div>
        ) : (
          <div className={styles.ticketsList}>
            {tickets.map((ticket, i) => (
              <BoardingPass
                key={ticket.id || i}
                ticket={ticket}
                onClick={() => onTicketClick?.(ticket)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketsModal;
