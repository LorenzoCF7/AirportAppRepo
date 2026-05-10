import { useState, useEffect } from 'react';
import { Plane, Search, Heart, LogOut, MapPin, CreditCard, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ticketService } from '../../services/ticketService';
import styles from './ProfileView.module.css';

const statusConfig = {
  confirmed: { label: 'Confirmado', color: '#059669', bg: '#ecfdf5' },
  cancelled:  { label: 'Cancelado',  color: '#dc2626', bg: '#fef2f2' },
  pending:    { label: 'Pendiente',  color: '#d97706', bg: '#fffbeb' },
};

const TicketCard = ({ ticket }) => {
  const status = statusConfig[ticket.status] || statusConfig.confirmed;
  const depDate = new Date(ticket.departureDate);
  const formatted = depDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className={styles.ticketCard}>
      <div className={styles.ticketRoute}>
        <div className={styles.ticketCity}>
          <span className={styles.ticketIata}>{ticket.departureIATA}</span>
          <span className={styles.ticketCityName}>{ticket.departureCity}</span>
        </div>
        <div className={styles.ticketArrow}>
          <Plane size={16} className={styles.ticketPlane} />
          <div className={styles.ticketLine} />
        </div>
        <div className={styles.ticketCity}>
          <span className={styles.ticketIata}>{ticket.arrivalIATA}</span>
          <span className={styles.ticketCityName}>{ticket.arrivalCity}</span>
        </div>
      </div>

      <div className={styles.ticketMeta}>
        <span className={styles.ticketDetail}><Clock size={13} /> {formatted} · {ticket.departureTime}</span>
        <span className={styles.ticketDetail}><CreditCard size={13} /> Asiento {ticket.seatNumber} · {ticket.ticketClass}</span>
        <span className={styles.ticketRef}>Ref: {ticket.bookingReference}</span>
      </div>

      <div className={styles.ticketFooter}>
        <span className={styles.ticketStatus} style={{ color: status.color, background: status.bg }}>
          {ticket.status === 'confirmed' ? <CheckCircle size={12} /> : <XCircle size={12} />}
          {status.label}
        </span>
        <span className={styles.ticketPrice}>{ticket.price} {ticket.currency || '€'}</span>
      </div>
    </div>
  );
};

const EmptyState = ({ onNavigate }) => (
  <div className={styles.emptyCard}>
    <div className={styles.emptyLeft}>
      <h3 className={styles.emptyTitle}>¿0 km viajados? Eso hay que cambiarlo<span className={styles.dot}>.</span></h3>
      <p className={styles.emptyText}>
        Compra tu primer billete y empieza a acumular viajes. Todos tus vuelos aparecerán aquí.
      </p>
      <button className={styles.emptyBtn} onClick={() => onNavigate('shop')}>
        Buscar vuelos
      </button>
    </div>
    <div className={styles.emptyIllustration}>
      <div className={styles.emptyGlobe}>
        <Plane size={32} color="#FF690F" />
      </div>
    </div>
  </div>
);

const ProfileView = ({ onNavigate }) => {
  const { user, logout } = useAuth();
  const [tickets, setTickets]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');

  const username = user?.username || user?.email?.split('@')[0] || 'Viajero';
  const initials = username.slice(0, 2).toUpperCase();
  const today = new Date();

  useEffect(() => {
    ticketService.getUserTickets()
      .then(res => setTickets(res.data || res || []))
      .catch(() => setTickets([]))
      .finally(() => setLoading(false));
  }, []);

  const upcoming = tickets.filter(t => new Date(t.departureDate) >= today);
  const past     = tickets.filter(t => new Date(t.departureDate) <  today);
  const shown    = activeTab === 'upcoming' ? upcoming : past;

  const totalSpent = tickets.reduce((s, t) => s + (t.price || 0), 0);

  const handleLogout = () => {
    logout();
    onNavigate('dashboard');
  };

  return (
    <div className={styles.page}>
      <div className={styles.inner}>

        {/**/}
        <div className={styles.profileHeader}>
          <div className={styles.headerLeft}>
            <div className={styles.avatar}>{initials}</div>
            <div>
              <h1 className={styles.title}>
                Viajes de {username}<span className={styles.dot}>.</span>
              </h1>
              <p className={styles.email}>{user?.email}</p>
            </div>
          </div>
          <div className={styles.headerActions}>
            <button className={styles.actionBtn} onClick={() => onNavigate('search')}>
              <Search size={15} /> Buscar vuelo
            </button>
            <button className={styles.actionBtn} onClick={() => onNavigate('explore')}>
              <MapPin size={15} /> Explorar destinos
            </button>
            <button className={styles.logoutBtn} onClick={handleLogout}>
              <LogOut size={15} /> Cerrar Sesión
            </button>
          </div>
        </div>

        {/**/}
        {tickets.length > 0 && (
          <div className={styles.statsRow}>
            <div className={styles.stat}>
              <span className={styles.statNum}>{tickets.length}</span>
              <span className={styles.statLabel}>Billetes</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.stat}>
              <span className={styles.statNum}>{upcoming.length}</span>
              <span className={styles.statLabel}>Próximos vuelos</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.stat}>
              <span className={styles.statNum}>{totalSpent.toFixed(0)} €</span>
              <span className={styles.statLabel}>Total gastado</span>
            </div>
          </div>
        )}

        {/**/}
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'upcoming' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('upcoming')}
          >
            Próximos ({upcoming.length})
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'past' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('past')}
          >
            Anteriores ({past.length})
          </button>
        </div>

        {/**/}
        {loading ? (
          <div className={styles.loadingBox}>
            <div className={styles.spinner} />
            <p>Cargando tus viajes...</p>
          </div>
        ) : shown.length === 0 ? (
          <EmptyState onNavigate={onNavigate} />
        ) : (
          <div className={styles.ticketGrid}>
            {shown.map(t => <TicketCard key={t.id} ticket={t} />)}
          </div>
        )}

        {/**/}
        <div className={styles.bottomCta}>
          <Heart size={16} />
          <span>¿No sabes dónde ir?</span>
          <button className={styles.ctaBtn} onClick={() => onNavigate('explore')}>
            Explora destinos
          </button>
        </div>

      </div>
    </div>
  );
};

export default ProfileView;
