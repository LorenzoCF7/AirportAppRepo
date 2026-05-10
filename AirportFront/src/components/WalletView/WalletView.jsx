import { useState, useEffect } from 'react';
import { Ticket, Plane, Calendar, User, CreditCard, X, AlertCircle, RefreshCw } from 'lucide-react';
import { ticketService } from '../../services/ticketService';
import { formatDate } from '../../utils/formatters';
import { useScrollLock } from '../../hooks';
import styles from './WalletView.module.css';

const IATA_CITIES = {
  BCN: 'Barcelona', MAD: 'Madrid', LHR: 'Londres', CDG: 'París',
  AMS: 'Ámsterdam', FCO: 'Roma', FRA: 'Frankfurt', MUC: 'Múnich',
  LIS: 'Lisboa', VIE: 'Viena', ZRH: 'Zúrich', PRG: 'Praga',
  ARN: 'Estocolmo', CPH: 'Copenhague', DUB: 'Dublín', ATH: 'Atenas',
  WAW: 'Varsovia', BRU: 'Bruselas', HEL: 'Helsinki', OSL: 'Oslo',
  SVQ: 'Sevilla', VLC: 'Valencia', AGP: 'Málaga', BIO: 'Bilbao',
  TFS: 'Tenerife', LPA: 'Gran Canaria', PMI: 'Palma', BER: 'Berlín',
  MXP: 'Milán', GVA: 'Ginebra', EDI: 'Edimburgo', DUS: 'Düsseldorf',
  JFK: 'Nueva York', LAX: 'Los Ángeles', ORY: 'París Orly', MAN: 'Mánchester',
};

const getCityName = (iata, fallback) => IATA_CITIES[iata] || fallback || iata;

const getClassLabel = (cls) => {
  switch ((cls || '').toLowerCase()) {
    case 'economy':  return 'Turista';
    case 'business': return 'Business';
    case 'first':    return 'Primera';
    default:         return cls || '—';
  }
};

const WalletView = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [filter, setFilter] = useState('all');
  const [ticketToCancel, setTicketToCancel] = useState(null);

  useScrollLock(!!selectedTicket);

  useEffect(() => { loadTickets(); }, []);

  const loadTickets = async () => {
    try {
      setLoading(true);
      setError(null);
      await ticketService.initialize();
      setTickets(await ticketService.getUserTickets());
    } catch {
      setError('No se pudieron cargar los billetes.');
    } finally {
      setLoading(false);
    }
  };

  const confirmCancel = async () => {
    if (!ticketToCancel) return;
    try {
      await ticketService.cancelTicket(ticketToCancel);
      await loadTickets();
      setSelectedTicket(null);
      setTicketToCancel(null);
      window.dispatchEvent(new CustomEvent('flight-notification', {
        detail: { title: 'Billete cancelado', message: 'El billete ha sido cancelado.', type: 'success' }
      }));
    } catch {
      window.dispatchEvent(new CustomEvent('flight-notification', {
        detail: { title: 'Error', message: 'No se pudo cancelar el billete.', type: 'error' }
      }));
    }
  };

  const stats = {
    total:     tickets.length,
    confirmed: tickets.filter(t => t.ticketStatus === 'confirmed').length,
    cancelled: tickets.filter(t => t.ticketStatus === 'cancelled').length,
  };

  const filtered = tickets.filter(t => filter === 'all' || t.ticketStatus === filter);

  if (loading) return (
    <div className={styles.page}>
      <div className={styles.centered}><div className={styles.spinner} /><p>Cargando billetes...</p></div>
    </div>
  );

  if (error) return (
    <div className={styles.page}>
      <div className={styles.centered}>
        <AlertCircle size={40} className={styles.errorIcon} />
        <p>{error}</p>
        <button className={styles.retryBtn} onClick={loadTickets}><RefreshCw size={15} /> Reintentar</button>
      </div>
    </div>
  );

  return (
    <div className={styles.page}>

      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}><Ticket size={24} /> Mis Billetes</h1>
          <p className={styles.subtitle}>{stats.total} billete{stats.total !== 1 ? 's' : ''} en tu cartera</p>
        </div>
        <div className={styles.statsRow}>
          <div className={`${styles.statPill} ${styles.statTotal}`}>
            <span className={styles.statNum}>{stats.total}</span>
            <span className={styles.statLabel}>Total</span>
          </div>
          <div className={`${styles.statPill} ${styles.statConfirmed}`}>
            <span className={styles.statNum}>{stats.confirmed}</span>
            <span className={styles.statLabel}>Confirmados</span>
          </div>
          <div className={`${styles.statPill} ${styles.statCancelled}`}>
            <span className={styles.statNum}>{stats.cancelled}</span>
            <span className={styles.statLabel}>Cancelados</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        {['all', 'confirmed', 'cancelled'].map(f => (
          <button
            key={f}
            className={`${styles.filterBtn} ${filter === f ? styles.filterActive : ''}`}
            onClick={() => setFilter(f)}
          >
            {f === 'all' ? 'Todos' : f === 'confirmed' ? 'Confirmados' : 'Cancelados'}
          </button>
        ))}
      </div>

      {/* Empty state */}
      {filtered.length === 0 ? (
        <div className={styles.centered}>
          <Ticket size={52} className={styles.emptyIcon} />
          <h2 className={styles.emptyTitle}>No hay billetes</h2>
          <p className={styles.emptyDesc}>
            {filter === 'all' ? 'Compra tu primer vuelo para verlo aquí.' : `No tienes billetes ${filter === 'confirmed' ? 'confirmados' : 'cancelados'}.`}
          </p>
        </div>
      ) : (
        <div className={styles.grid}>
          {filtered.map(ticket => (
            <BoardingPass
              key={ticket.id}
              ticket={ticket}
              onClick={() => setSelectedTicket(ticket)}
            />
          ))}
        </div>
      )}

      {/* Detail modal */}
      {selectedTicket && (
        <div className={styles.overlay} onClick={() => setSelectedTicket(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <button className={styles.closeBtn} onClick={() => setSelectedTicket(null)}><X size={20} /></button>

            <div className={styles.modalTop}>
              <div>
                <div className={styles.modalAirline}>{selectedTicket.airlineName}</div>
                <div className={styles.modalFlight}>{selectedTicket.flightIATA}</div>
              </div>
              <span className={`${styles.badge} ${styles[selectedTicket.ticketStatus]}`}>
                {selectedTicket.ticketStatus === 'confirmed' ? 'Confirmado' : 'Cancelado'}
              </span>
            </div>

            {/* Route banner */}
            <div className={styles.modalRoute}>
              <div className={styles.modalAirport}>
                <div className={styles.modalIata}>{selectedTicket.departureIATA}</div>
                <div className={styles.modalCity}>{getCityName(selectedTicket.departureIATA, selectedTicket.departureCity)}</div>
                <div className={styles.modalTime}>{selectedTicket.departureTime}</div>
              </div>
              <div className={styles.modalRouteViz}>
                <div className={styles.modalDot} />
                <div className={styles.modalLine} />
                <Plane size={18} className={styles.modalPlane} />
                <div className={styles.modalLine} />
                <div className={styles.modalDot} />
              </div>
              <div className={`${styles.modalAirport} ${styles.modalAirportRight}`}>
                <div className={styles.modalIata}>{selectedTicket.arrivalIATA}</div>
                <div className={styles.modalCity}>{getCityName(selectedTicket.arrivalIATA, selectedTicket.arrivalCity)}</div>
                <div className={styles.modalTime}>{selectedTicket.arrivalTime}</div>
              </div>
            </div>

            {/* Info grid */}
            <div className={styles.modalGrid}>
              <InfoRow icon={<Calendar size={15} />} label="Fecha salida" value={`${formatDate(selectedTicket.departureDate)} · ${selectedTicket.departureTime}`} />
              <InfoRow icon={<Calendar size={15} />} label="Fecha llegada" value={`${formatDate(selectedTicket.arrivalDate)} · ${selectedTicket.arrivalTime}`} />
              <InfoRow icon={<Plane size={15} />}    label="Aeropuerto salida"  value={`${selectedTicket.departureAirport} (${selectedTicket.departureIATA})`} />
              <InfoRow icon={<Plane size={15} />}    label="Aeropuerto llegada" value={`${selectedTicket.arrivalAirport} (${selectedTicket.arrivalIATA})`} />
              <InfoRow icon={<User size={15} />}     label="Pasajero"    value={selectedTicket.passengerName} />
              <InfoRow icon={<User size={15} />}     label="Documento"   value={selectedTicket.passengerDocument || '—'} />
              <InfoRow icon={<Ticket size={15} />}   label="Asiento"     value={selectedTicket.seatNumber || '—'} />
              <InfoRow icon={<Ticket size={15} />}   label="Clase"       value={getClassLabel(selectedTicket.ticketClass)} />
              <InfoRow icon={<CreditCard size={15} />} label="Precio"    value={`${selectedTicket.price} ${selectedTicket.currency}`} highlight />
              <InfoRow icon={<CreditCard size={15} />} label="Referencia" value={selectedTicket.bookingReference} mono />
            </div>

            {selectedTicket.ticketStatus === 'confirmed' && (
              <div className={styles.modalFooter}>
                <button className={styles.cancelBtn} onClick={() => setTicketToCancel(selectedTicket.id)}>
                  Cancelar billete
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Cancel confirmation */}
      {ticketToCancel && (
        <div className={styles.overlay} style={{ zIndex: 10001 }} onClick={() => setTicketToCancel(null)}>
          <div className={styles.confirmModal} onClick={e => e.stopPropagation()}>
            <AlertCircle size={40} className={styles.warnIcon} />
            <h3>¿Cancelar este billete?</h3>
            <p>Esta acción no se puede deshacer.</p>
            <div className={styles.confirmBtns}>
              <button className={styles.keepBtn} onClick={() => setTicketToCancel(null)}>Mantener</button>
              <button className={styles.confirmCancelBtn} onClick={confirmCancel}>Sí, cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const BoardingPass = ({ ticket, onClick }) => (
  <div
    className={`${styles.pass} ${ticket.ticketStatus === 'cancelled' ? styles.passCancelled : styles.passConfirmed}`}
    onClick={onClick}
  >
    {/* Airline + status */}
    <div className={styles.passTop}>
      <div>
        <div className={styles.passAirline}>{ticket.airlineName}</div>
        <div className={styles.passFlightNum}>{ticket.flightIATA}</div>
      </div>
      <span className={`${styles.badge} ${styles[ticket.ticketStatus]}`}>
        {ticket.ticketStatus === 'confirmed' ? 'CONFIRMADO' : 'CANCELADO'}
      </span>
    </div>

    {/* Route */}
    <div className={styles.passRoute}>
      <div className={styles.passAirport}>
        <div className={styles.passIata}>{ticket.departureIATA}</div>
        <div className={styles.passCity}>{getCityName(ticket.departureIATA, ticket.departureCity)}</div>
      </div>
      <div className={styles.passViz}>
        <div className={styles.passLineFull} />
        <Plane size={16} className={styles.passPlane} />
      </div>
      <div className={`${styles.passAirport} ${styles.passAirportRight}`}>
        <div className={styles.passIata}>{ticket.arrivalIATA}</div>
        <div className={styles.passCity}>{getCityName(ticket.arrivalIATA, ticket.arrivalCity)}</div>
      </div>
    </div>

    {/* Details row */}
    <div className={styles.passDetails}>
      <div className={styles.passDetail}>
        <span className={styles.passDetailLabel}>FECHA</span>
        <span className={styles.passDetailValue}>{formatDate(ticket.departureDate)}</span>
      </div>
      <div className={styles.passDetail}>
        <span className={styles.passDetailLabel}>HORA</span>
        <span className={styles.passDetailValue}>{ticket.departureTime}</span>
      </div>
      <div className={styles.passDetail}>
        <span className={styles.passDetailLabel}>CLASE</span>
        <span className={styles.passDetailValue}>{getClassLabel(ticket.ticketClass)}</span>
      </div>
      <div className={styles.passDetail}>
        <span className={styles.passDetailLabel}>ASIENTO</span>
        <span className={styles.passDetailValue}>{ticket.seatNumber || '—'}</span>
      </div>
    </div>

    {/* Tear-off + reference */}
    <div className={styles.passTear} />
    <div className={styles.passRef}>
      <span className={styles.passRefLabel}>RESERVA</span>
      <span className={styles.passRefCode}>{ticket.bookingReference}</span>
    </div>
  </div>
);

const InfoRow = ({ icon, label, value, highlight, mono }) => (
  <div className={styles.infoRow}>
    <div className={styles.infoIcon}>{icon}</div>
    <div className={styles.infoContent}>
      <span className={styles.infoLabel}>{label}</span>
      <span className={`${styles.infoValue} ${highlight ? styles.infoHighlight : ''} ${mono ? styles.infoMono : ''}`}>
        {value}
      </span>
    </div>
  </div>
);

export default WalletView;
