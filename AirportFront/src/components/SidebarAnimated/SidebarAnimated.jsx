import React from 'react';
import { LayoutDashboard, Search, Map as MapIcon, ShoppingCart } from 'lucide-react';
import Folder from '../Folder/Folder';
import styles from './SidebarAnimated.module.css';

const SidebarAnimated = ({ activeView, onViewChange, onOpenTicketsModal }) => {
  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'search', icon: Search, label: 'Búsqueda' },
    { id: 'map', icon: MapIcon, label: 'Mapa en Vivo' },
    { id: 'shop', icon: ShoppingCart, label: 'Comprar Billetes', separator: true },
  ];

  const handleTicketsClick = () => {
    if (onOpenTicketsModal) {
      onOpenTicketsModal();
    }
  };

  // Gradiente de capas (prelayers) - estilo StaggeredMenu
  const colors = ['rgba(102, 126, 234, 0.15)', 'rgba(118, 75, 162, 0.15)'];

  return (
    <div className={styles.sidebarAnimatedWrapper} data-sidebar="true">
      {/* Prelayers con gradiente */}
      <div className={styles.sidebarPrelayers} aria-hidden="true">
        {colors.map((c, i) => (
          <div key={i} className={styles.sidebarPrelayer} style={{ background: c }} />
        ))}
      </div>

      {/* Contenedor de iconos - siempre centrado verticalmente */}
      <div className={styles.sidebarStickyContainer}>
        {/* Panel principal del sidebar */}
        <aside className={styles.sidebarAnimated}>
          {/* Header con logo */}
          <div className={styles.sidebarHeader}>
            <div className={styles.sidebarLogoWrapper}>
              <svg className={styles.sidebarLogo} viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
              </svg>
              <h2>Flight Tracker</h2>
            </div>
          </div>

          {/* Nav items */}
          <nav className={styles.sidebarNav}>
            {menuItems.map((item) => (
              <div key={item.id}>
                {item.separator && <div className={styles.navSeparator}></div>}
                <button
                  className={`${styles.sidebarNavItem} ${activeView === item.id ? styles.active : ''}`}
                  onClick={() => onViewChange(item.id)}
                >
                  <item.icon size={24} />
                  <span className={styles.sidebarNavItemLabel}>{item.label}</span>
                </button>
              </div>
            ))}
            
            {/* Folder para Mis Billetes */}
            <div className={styles.sidebarFolderContainer}>
              <Folder 
                color="#667eea" 
                size={0.6} 
                items={[]} 
                className={styles.sidebarFolder}
                onClick={handleTicketsClick}
              />
              <div className={styles.folderLabel}>Mis Billetes</div>
            </div>
          </nav>
        </aside>
      </div>
    </div>
  );
};

export default SidebarAnimated;
