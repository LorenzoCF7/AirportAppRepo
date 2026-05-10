import { useState } from 'react';
import {
  Menu, X, Plane, Search, Map, ShoppingCart, Wallet,
  Heart, User, LogOut, Plus, Bookmark, Globe, Sparkles,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import LoginRegisterModal from '../LoginRegisterModal/LoginRegisterModal';
import styles from './Header.module.css';

const mainNav = [
  { id: 'dashboard', label: 'Vuelos',           Icon: Plane },
  { id: 'map',       label: 'Rastrear vuelo',       Icon: Map },
  { id: 'shop',      label: 'Comprar Billetes',  Icon: ShoppingCart },
  { id: 'wallet',    label: 'Mi Cartera',        Icon: Wallet },
  { id: null,        label: 'Planifica con IA',  Icon: Sparkles, action: 'ai' },
];

const discoverNav = [
  { id: 'explore', label: 'Explorar destinos', Icon: Globe },
];

const Header = ({ activeView, onViewChange, onLogout, onOpenTicketsModal, onOpenAi }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loginOpen, setLoginOpen]   = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const closeDrawer = () => setDrawerOpen(false);

  const handleNavClick = (id, action) => {
    if (action === 'ai') { onOpenAi?.(); }
    else if (id) onViewChange(id);
    closeDrawer();
  };

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    closeDrawer();
    if (onLogout) onLogout();
  };

  const handleTickets = () => {
    onOpenTicketsModal();
    closeDrawer();
  };

  return (
    <>
      {/**/}
      <header className={styles.header}>
        <div className={styles.container}>

          <div className={styles.left}>
            <button className={styles.menuBtn} onClick={() => setDrawerOpen(true)} aria-label="Menú">
              <Menu size={22} />
            </button>
            <div className={styles.logo} onClick={() => onViewChange('dashboard')}>
              <span className={styles.logoSquare}>
                <Plane size={14} color="white" />
              </span>
              <span className={styles.logoText}>AirportApp</span>
            </div>
          </div>

          <div className={styles.right}>
            <button className={styles.iaBtn} onClick={onOpenAi}>
              <Plus size={13} strokeWidth={2.5} />
              <span>IA</span>
            </button>
            <button className={styles.iconBtn} onClick={handleTickets} title="Mis Billetes">
              <Heart size={17} />
            </button>
            {isAuthenticated ? (
              <button
                className={`${styles.iconBtn} ${activeView === 'profile' ? styles.iconBtnActive : ''}`}
                onClick={() => onViewChange('profile')}
                title={user?.username || user?.email}
              >
                <User size={17} />
              </button>
            ) : (
              <button className={styles.iconBtn} onClick={() => setLoginOpen(true)} title="Iniciar Sesión">
                <User size={17} />
              </button>
            )}
          </div>
        </div>
      </header>

      {/**/}
      {drawerOpen && <div className={styles.backdrop} onClick={closeDrawer} />}

      {/**/}
      <div className={`${styles.drawer} ${drawerOpen ? styles.drawerOpen : ''}`}>

        <div className={styles.drawerTop}>
          <div className={styles.drawerLogo}>
            <span className={styles.drawerLogoSquare}>
              <Plane size={13} color="white" />
            </span>
            <span className={styles.drawerLogoText}>AirportApp</span>
          </div>
          <button className={styles.closeBtn} onClick={closeDrawer} aria-label="Cerrar menú">
            <X size={20} />
          </button>
        </div>

        <nav className={styles.drawerNav}>

          <div className={styles.drawerGroup}>
            {mainNav.map(({ id, label, Icon, action }) => (
              <button
                key={label}
                className={`${styles.drawerItem} ${activeView === id ? styles.drawerItemActive : ''} ${action === 'ai' ? styles.drawerItemAi : ''}`}
                onClick={() => handleNavClick(id, action)}
              >
                <span className={styles.drawerIcon}><Icon size={19} /></span>
                <span className={styles.drawerLabel}>{label}</span>
              </button>
            ))}
          </div>

          <div className={styles.drawerDivider} />

          <div className={styles.drawerGroup}>
            {discoverNav.map(({ id, label, Icon }) => (
              <button key={label} className={`${styles.drawerItem} ${activeView === id ? styles.drawerItemActive : ''}`} onClick={() => handleNavClick(id)}>
                <span className={styles.drawerIcon}><Icon size={19} /></span>
                <span className={styles.drawerLabel}>{label}</span>
              </button>
            ))}
          </div>

          <div className={styles.drawerDivider} />

          <div className={styles.drawerGroup}>
            <button className={styles.drawerItem} onClick={handleTickets}>
              <span className={styles.drawerIcon}><Bookmark size={19} /></span>
              <span className={styles.drawerLabel}>Mis Billetes</span>
            </button>
          </div>

          <div className={styles.drawerDivider} />

          <div className={styles.drawerGroup}>
            <button className={`${styles.drawerItem} ${styles.drawerItemMuted}`} onClick={closeDrawer}>
              <span className={styles.drawerIcon}>🇪🇸</span>
              <span className={styles.drawerLabel}>Español</span>
            </button>
            <button className={`${styles.drawerItem} ${styles.drawerItemMuted}`} onClick={closeDrawer}>
              <span className={styles.drawerIcon}><MessageSquare size={19} /></span>
              <span className={styles.drawerLabel}>Escríbenos</span>
            </button>

            {isAuthenticated ? (
              <>
                <div className={styles.drawerUserEmail}>{user?.email}</div>
                <button className={`${styles.drawerItem} ${styles.drawerItemLogout}`} onClick={handleLogout}>
                  <span className={styles.drawerIcon}><LogOut size={19} /></span>
                  <span className={styles.drawerLabel}>Cerrar Sesión</span>
                </button>
              </>
            ) : (
              <button className={`${styles.drawerItem} ${styles.drawerItemMuted}`} onClick={() => { setLoginOpen(true); closeDrawer(); }}>
                <span className={styles.drawerIcon}><User size={19} /></span>
                <span className={styles.drawerLabel}>Iniciar Sesión</span>
              </button>
            )}
          </div>

        </nav>
      </div>

      <LoginRegisterModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} />
    </>
  );
};

export default Header;
