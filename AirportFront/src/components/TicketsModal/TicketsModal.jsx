import React, { useEffect, useState } from 'react';
import ScrollStack, { ScrollStackItem } from '../ScrollStack/ScrollStack';
import { X, Plane, Calendar, MapPin, Clock, Wallet } from 'lucide-react';
import { ticketService } from '../../services/ticketService';
import { useScrollLock } from '../../hooks';
import styles from './TicketsModal.module.css';

const TicketsModal = ({ isOpen, onClose, onTicketClick, onViewWallet }) => {
  const [tickets, setTickets] = useState([]);

  // Bloquear scroll cuando el modal está abierto
  useScrollLock(isOpen);

  useEffect(() => {
    if (isOpen) {
      loadTickets();
    }
  }, [isOpen]);

  const loadTickets = async () => {
    try {
      await ticketService.initialize();
      const userTickets = await ticketService.getUserTickets();
      setTickets(userTickets);
    } catch (error) {
      console.error('Error cargando billetes:', error);
      setTickets([]);
    }
  };

  const handleTicketClick = (e, ticket) => {
    e.stopPropagation();
    if (onTicketClick) {
      onTicketClick(ticket);
    }
  };

  if (!isOpen) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className={styles.ticketsModalOverlay} onClick={onClose}>
      <div className={styles.ticketsModalContent} onClick={(e) => e.stopPropagation()}>
        <button className={styles.ticketsModalClose} onClick={onClose}>
          <X size={24} />
        </button>

        <div className={styles.ticketsModalHeader}>
          <Plane size={40} className={styles.ticketsModalIcon} />
          <div className={styles.headerContent}>
            <h2>Mis Billetes</h2>
            <p>{tickets.length} {tickets.length === 1 ? 'billete' : 'billetes'} en tu billetera</p>
          </div>
          {onViewWallet && (
            <button 
              className={styles.viewWalletButton}
              onClick={() => {
                onClose();
                onViewWallet();
              }}
              title="Ver billetera completa"
            >
              <Wallet size={20} />
              <span>Ver Billetera</span>
            </button>
          )}
        </div>

        {tickets.length === 0 ? (
          <div className={styles.ticketsEmpty}>
            <div className={styles.ticketsEmptyIcon}>
              <Plane size={64} />
            </div>
            <h3>No tienes billetes aún</h3>
            <p>Compra tu primer vuelo en la tienda de billetes</p>
          </div>
        ) : (
          <ScrollStack
            itemDistance={80}
            itemScale={0.015}
            itemStackDistance={15}
            stackPosition="10%"
            scaleEndPosition="3%"
            baseScale={0.95}
            useWindowScroll={false}
          >
            {tickets.map((ticket, index) => (
              <ScrollStackItem key={ticket.id || index}>
                <div 
                  className={styles.ticketCard}
                  onClick={(e) => handleTicketClick(e, ticket)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className={styles.ticketCardHeader}>
                    <div className={styles.ticketAirline}>
                      <Plane size={24} />
                      <span>{ticket.airlineName || 'Aerolínea'}</span>
                    </div>
                    <div className={styles.ticketFlightNumber}>
                      {ticket.flightIATA || ticket.flightNumber || 'N/A'}
                    </div>
                  </div>

                  <div className={styles.ticketCardRoute}>
                    <div className={styles.ticketLocation}>
                      <MapPin size={20} />
                      <div>
                        <div className={styles.ticketAirportCode}>{ticket.departureIATA || 'N/A'}</div>
                        <div className={styles.ticketCity}>{ticket.departureCity || 'Origen'}</div>
                      </div>
                    </div>

                    <div className={styles.ticketFlightPath}>
                      <div className={styles.ticketFlightLine}></div>
                      <Plane size={20} className={styles.ticketPlaneIcon} />
                    </div>

                    <div className={styles.ticketLocation}>
                      <MapPin size={20} />
                      <div>
                        <div className={styles.ticketAirportCode}>{ticket.arrivalIATA || 'N/A'}</div>
                        <div className={styles.ticketCity}>{ticket.arrivalCity || 'Destino'}</div>
                      </div>
                    </div>
                  </div>

                  <div className={styles.ticketCardDetails}>
                    <div className={styles.ticketDetail}>
                      <Calendar size={18} />
                      <div>
                        <div className={styles.ticketDetailLabel}>Fecha</div>
                        <div className={styles.ticketDetailValue}>
                          {formatDate(ticket.departureDate)}
                        </div>
                      </div>
                    </div>

                    <div className={styles.ticketDetail}>
                      <Clock size={18} />
                      <div>
                        <div className={styles.ticketDetailLabel}>Hora de salida</div>
                        <div className={styles.ticketDetailValue}>
                          {ticket.departureTime || 'N/A'}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className={styles.ticketCardFooter}>
                    <div className={styles.ticketPrice}>
                      <span className={styles.ticketPriceLabel}>Precio</span>
                      <span className={styles.ticketPriceValue}>{ticket.price || '0'} {ticket.currency || 'EUR'}</span>
                    </div>
                    <div className={styles.ticketBarcode}>
                      <div className={styles.barcodeLines}>
                        {[...Array(12)].map((_, i) => (
                          <div key={i} className={styles.barcodeLine} style={{ height: `${Math.random() * 20 + 20}px` }}></div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollStackItem>
            ))}
          </ScrollStack>
        )}
      </div>
    </div>
  );
};

export default TicketsModal;
