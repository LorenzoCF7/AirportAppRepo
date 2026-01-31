import { useState, useEffect } from 'react';
import { Ticket, Plane, Calendar, MapPin, User, CreditCard, X, AlertCircle } from 'lucide-react';
import { ticketService } from '../../services/ticketService';
import { formatDate, formatTime } from '../../utils/formatters';
import { useScrollLock } from '../../hooks';
import TicketsModal from '../TicketsModal/TicketsModal';
import styles from './WalletView.module.css';

const WalletView = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isTicketsModalOpen, setIsTicketsModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [filter, setFilter] = useState('all'); // all, confirmed, cancelled
  const [ticketToCancel, setTicketToCancel] = useState(null); // Para confirmación

  // Bloquear scroll cuando el modal está abierto
  useScrollLock(!!selectedTicket);

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      setLoading(true);
      setError(null);
      await ticketService.initialize();
      const userTickets = await ticketService.getUserTickets();
      setTickets(userTickets);
    } catch (err) {
      console.error('Error cargando billetes:', err);
      setError('No se pudieron cargar los billetes. Por favor, inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelTicket = async (ticketId) => {
    // Mostrar modal de confirmación
    setTicketToCancel(ticketId);
  };

  const confirmCancelTicket = async () => {
    if (!ticketToCancel) return;

    try {
      await ticketService.cancelTicket(ticketToCancel);
      await loadTickets(); // Recargar lista
      setSelectedTicket(null);
      setTicketToCancel(null);
      
      // Notificación centralizada
      window.dispatchEvent(new CustomEvent('flight-notification', {
        detail: {
          title: '🗑️ Billete Cancelado',
          message: 'El billete ha sido cancelado correctamente',
          type: 'success'
        }
      }));
    } catch (err) {
      console.error('Error cancelando billete:', err);
      
      // Notificación de error centralizada
      window.dispatchEvent(new CustomEvent('flight-notification', {
        detail: {
          title: '❌ Error',
          message: 'No se pudo cancelar el billete. Inténtalo de nuevo.',
          type: 'error'
        }
      }));
    }
  };

  const getTicketStatusClass = (status) => {
    switch (status) {
      case 'confirmed':
        return 'statusConfirmed';
      case 'cancelled':
        return 'statusCancelled';
      case 'pending':
        return 'statusPending';
      default:
        return '';
    }
  };

  const getTicketClassLabel = (ticketClass) => {
    switch (ticketClass) {
      case 'economy':
        return 'Turista';
      case 'business':
        return 'Business';
      case 'first':
        return 'Primera Clase';
      default:
        return ticketClass;
    }
  };

  const handleMouseMove = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    card.style.setProperty('--mouse-x', `${x}%`);
    card.style.setProperty('--mouse-y', `${y}%`);
  };

  const filteredTickets = tickets.filter(ticket => {
    if (filter === 'all') return true;
    return ticket.ticketStatus === filter;
  });

  const ticketStats = {
    total: tickets.length,
    confirmed: tickets.filter(t => t.ticketStatus === 'confirmed').length,
    cancelled: tickets.filter(t => t.ticketStatus === 'cancelled').length
  };

  if (loading) {
    return (
      <div className={styles.walletView}>
        <div className={styles.walletHeader}>
          <h1>
            <Ticket size={32} />
            Mi Billetera de Vuelos
          </h1>
        </div>
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>
          <p>Cargando billetes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.walletView}>
        <div className={styles.walletHeader}>
          <h1>
            <Ticket size={32} />
            Mi Billetera de Vuelos
          </h1>
        </div>
        <div className={styles.errorState}>
          <AlertCircle size={48} />
          <p>{error}</p>
          <button onClick={loadTickets} className={styles.retryButton}>
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.walletView}>
      <div className={styles.walletHeader}>
        <div className={styles.headerContent}>
          <h1>
            <Ticket size={32} />
            Mi Billetera de Vuelos
          </h1>
          <div className={styles.walletStats}>
            <div className={styles.stat}>
              <span className={styles.statLabel}>Total</span>
              <span className={styles.statValue}>{ticketStats.total}</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statLabel}>Confirmados</span>
              <span className={`${styles.statValue} ${styles.confirmed}`}>{ticketStats.confirmed}</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statLabel}>Cancelados</span>
              <span className={`${styles.statValue} ${styles.cancelled}`}>{ticketStats.cancelled}</span>
            </div>
          </div>
        </div>
        
        <div className={styles.filterButtons}>
          <button 
            className={filter === 'all' ? styles.active : ''}
            onClick={() => setFilter('all')}
          >
            Todos
          </button>
          <button 
            className={filter === 'confirmed' ? styles.active : ''}
            onClick={() => setFilter('confirmed')}
          >
            Confirmados
          </button>
          <button 
            className={filter === 'cancelled' ? styles.active : ''}
            onClick={() => setFilter('cancelled')}
          >
            Cancelados
          </button>
        </div>
      </div>

      {filteredTickets.length === 0 ? (
        <div className={styles.emptyState}>
          <Ticket size={64} />
          <h2>No tienes billetes {filter !== 'all' ? filter + 's' : ''}</h2>
          <p>Los billetes que compres aparecerán aquí</p>
        </div>
      ) : (
        <div className={styles.ticketsGrid}>
          {filteredTickets.map(ticket => (
            <div 
              key={ticket.id} 
              className={`${styles.ticketCard} ${styles[getTicketStatusClass(ticket.ticketStatus)]}`}
              onClick={() => setSelectedTicket(ticket)}
              onMouseMove={handleMouseMove}
            >
              <div className={styles.ticketHeaderCard}>
                <div className={styles.airlineInfo}>
                  <span className={styles.airlineName}>{ticket.airlineName}</span>
                  <span className={styles.flightNumber}>{ticket.flightIATA}</span>
                </div>
                <span className={`${styles.ticketStatus} ${styles[ticket.ticketStatus]}`}>
                  {ticket.ticketStatus === 'confirmed' ? 'Confirmado' : 'Cancelado'}
                </span>
              </div>

              <div className={styles.flightRoute}>
                <div className={styles.airport}>
                  <span className={styles.iata}>{ticket.departureIATA}</span>
                  <span className={styles.city}>{ticket.departureCity}</span>
                </div>
                <div className={styles.routeLine}>
                  <Plane size={20} />
                </div>
                <div className={styles.airport}>
                  <span className={styles.iata}>{ticket.arrivalIATA}</span>
                  <span className={styles.city}>{ticket.arrivalCity}</span>
                </div>
              </div>

              <div className={styles.ticketDetails}>
                <div className={styles.detail}>
                  <Calendar size={16} />
                  <span>{formatDate(ticket.departureDate)} - {ticket.departureTime}</span>
                </div>
                <div className={styles.detail}>
                  <User size={16} />
                  <span>{ticket.passengerName}</span>
                </div>
                <div className={styles.detail}>
                  <CreditCard size={16} />
                  <span>{ticket.price} {ticket.currency} - {getTicketClassLabel(ticket.ticketClass)}</span>
                </div>
              </div>

              <div className={styles.bookingReference}>
                Ref: <strong>{ticket.bookingReference}</strong>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de detalles del billete */}
      {selectedTicket && (
        <div className={styles.ticketModalOverlay} onClick={() => setSelectedTicket(null)}>
          <div className={styles.ticketModal} onClick={(e) => e.stopPropagation()}>
            <button 
              className={styles.closeModal}
              onClick={() => setSelectedTicket(null)}
            >
              <X size={24} />
            </button>

            <div className={styles.modalHeader}>
              <h2>Detalles del Billete</h2>
              <span className={`${styles.ticketStatus} ${styles[selectedTicket.ticketStatus]}`}>
                {selectedTicket.ticketStatus === 'confirmed' ? 'Confirmado' : 'Cancelado'}
              </span>
            </div>

            <div className={styles.modalContent}>
              <div className={styles.infoSection}>
                <h3><Plane size={20} /> Información del Vuelo</h3>
                <div className={styles.infoGrid}>
                  <div className={styles.infoItem}>
                    <label>Aerolínea</label>
                    <span>{selectedTicket.airlineName} ({selectedTicket.airlineIATA})</span>
                  </div>
                  <div className={styles.infoItem}>
                    <label>Número de Vuelo</label>
                    <span>{selectedTicket.flightIATA}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <label>Clase</label>
                    <span>{getTicketClassLabel(selectedTicket.ticketClass)}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <label>Asiento</label>
                    <span>{selectedTicket.seatNumber}</span>
                  </div>
                </div>
              </div>

              <div className={styles.infoSection}>
                <h3><MapPin size={20} /> Salida</h3>
                <div className={styles.infoGrid}>
                  <div className={styles.infoItem}>
                    <label>Aeropuerto</label>
                    <span>{selectedTicket.departureAirport} ({selectedTicket.departureIATA})</span>
                  </div>
                  <div className={styles.infoItem}>
                    <label>Ciudad</label>
                    <span>{selectedTicket.departureCity}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <label>Fecha</label>
                    <span>{formatDate(selectedTicket.departureDate)}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <label>Hora</label>
                    <span>{selectedTicket.departureTime}</span>
                  </div>
                </div>
              </div>

              <div className={styles.infoSection}>
                <h3><MapPin size={20} /> Llegada</h3>
                <div className={styles.infoGrid}>
                  <div className={styles.infoItem}>
                    <label>Aeropuerto</label>
                    <span>{selectedTicket.arrivalAirport} ({selectedTicket.arrivalIATA})</span>
                  </div>
                  <div className={styles.infoItem}>
                    <label>Ciudad</label>
                    <span>{selectedTicket.arrivalCity}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <label>Fecha</label>
                    <span>{formatDate(selectedTicket.arrivalDate)}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <label>Hora</label>
                    <span>{selectedTicket.arrivalTime}</span>
                  </div>
                </div>
              </div>

              <div className={styles.infoSection}>
                <h3><User size={20} /> Información del Pasajero</h3>
                <div className={styles.infoGrid}>
                  <div className={styles.infoItem}>
                    <label>Nombre</label>
                    <span>{selectedTicket.passengerName}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <label>Documento</label>
                    <span>{selectedTicket.passengerDocument}</span>
                  </div>
                </div>
              </div>

              <div className={styles.infoSection}>
                <h3><CreditCard size={20} /> Información de Pago</h3>
                <div className={styles.infoGrid}>
                  <div className={styles.infoItem}>
                    <label>Precio</label>
                    <span className={styles.price}>{selectedTicket.price} {selectedTicket.currency}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <label>Referencia de Reserva</label>
                    <span className={styles.bookingRef}>{selectedTicket.bookingReference}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <label>Fecha de Compra</label>
                    <span>{formatDate(selectedTicket.purchaseDate.split('T')[0])} {formatTime(selectedTicket.purchaseDate)}</span>
                  </div>
                </div>
              </div>
            </div>

            {selectedTicket.ticketStatus === 'confirmed' && (
              <div className={styles.modalActions}>
                <button 
                  className={styles.cancelTicketButton}
                  onClick={() => handleCancelTicket(selectedTicket.id)}
                >
                  Cancelar Billete
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal de confirmación de cancelación */}
      {ticketToCancel && (
        <div className={styles.modalOverlay} onClick={() => setTicketToCancel(null)}>
          <div className={styles.confirmationModal} onClick={(e) => e.stopPropagation()}>
            <AlertCircle size={48} className={styles.warningIcon} />
            <h3>¿Cancelar Billete?</h3>
            <p>Esta acción no se puede deshacer. ¿Estás seguro de que quieres cancelar este billete?</p>
            <div className={styles.confirmationActions}>
              <button 
                className={styles.btnCancelAction}
                onClick={() => setTicketToCancel(null)}
              >
                No, mantener
              </button>
              <button 
                className={styles.btnConfirmAction}
                onClick={confirmCancelTicket}
              >
                Sí, cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de billetes con tarjetas interactivas */}
      <TicketsModal 
        isOpen={isTicketsModalOpen} 
        onClose={() => setIsTicketsModalOpen(false)}
        onViewWallet={() => {
          setIsTicketsModalOpen(false);
          // La vista de billetera ya está visible
        }}
        onTicketClick={(ticket) => {
          setIsTicketsModalOpen(false);
          setTimeout(() => {
            setSelectedTicket(ticket);
          }, 100);
        }}
      />
    </div>
  );
};

export default WalletView;
