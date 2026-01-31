import { useState, useEffect, useRef, useCallback, lazy, Suspense } from 'react'

import SidebarAnimated from './components/SidebarAnimated/SidebarAnimated'
import LoadingSpinner from './components/LoadingSpinner/LoadingSpinner'
import NotificationToast from './components/NotificationToast/NotificationToast'
import TicketsModal from './components/TicketsModal/TicketsModal'
import { flightService } from './services/flightService'
import { flightSimulator } from './services/flightSimulator'
import { APP_VIEW, STORAGE_KEYS, SCROLL_OFFSET, SIMULATOR_INTERVAL } from './constants'
import './App.css'

// Lazy loading de vistas para code splitting
const DashboardView = lazy(() => import('./components/DashboardView/DashboardView'))
const SearchView = lazy(() => import('./components/SearchView/SearchView'))
const RealTimeMap = lazy(() => import('./components/RealTimeMap/RealTimeMap'))
const FlightShop = lazy(() => import('./components/FlightShop/FlightShop'))
const WalletView = lazy(() => import('./components/WalletView/WalletView'))

function App() {
  const mainContentRef = useRef(null);
  const appContainerRef = useRef(null);
  const isFirstRender = useRef(true);
  const [isTicketsModalOpen, setIsTicketsModalOpen] = useState(false);
  
  const [activeView, setActiveView] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_VIEW) || APP_VIEW.DASHBOARD;
  });

  // Scroll al contenedor cuando cambia la vista
  const scrollToContainer = useCallback(() => {
    if (appContainerRef.current) {
      const rect = appContainerRef.current.getBoundingClientRect();
      const scrollTop = window.pageYOffset || window.scrollY;
      const offsetTop = rect.top + scrollTop;
      
      window.scrollTo({
        top: offsetTop - SCROLL_OFFSET,
        behavior: 'smooth'
      });
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_VIEW, activeView);
    
    if (!isFirstRender.current) {
      scrollToContainer();
    }
    
    if (isFirstRender.current) {
      isFirstRender.current = false;
    }
  }, [activeView, scrollToContainer]);

  useEffect(() => {
    if (!sessionStorage.getItem(STORAGE_KEYS.MIGRATION_KEY)) {
      flightService.clearStorage();
      sessionStorage.setItem(STORAGE_KEYS.MIGRATION_KEY, 'done');
    }

    const initSimulator = async () => {
      try {
        const response = await flightService.getAllFlights();
        const flights = response.data || [];
        
        if (flights.length > 0) {
          flightSimulator.initializeFlights(flights);
          flightSimulator.start(() => {}, SIMULATOR_INTERVAL);
        }
      } catch (error) {
        console.error('❌ Error iniciando simulador:', error);
      }
    };

    initSimulator();

    return () => {
      flightSimulator.stop();
    };
  }, []);

  const renderView = () => {
    let ViewComponent;
    
    switch (activeView) {
      case APP_VIEW.SEARCH:
        ViewComponent = SearchView;
        break;
      case APP_VIEW.MAP:
        ViewComponent = RealTimeMap;
        break;
      case APP_VIEW.SHOP:
        ViewComponent = FlightShop;
        break;
      case APP_VIEW.WALLET:
        ViewComponent = WalletView;
        break;
      case APP_VIEW.DASHBOARD:
      default:
        ViewComponent = DashboardView;
    }

    return (
      <Suspense fallback={<LoadingSpinner message="Cargando vista..." />}>
        <ViewComponent />
      </Suspense>
    );
  }

  return (
    <div ref={appContainerRef} className={`app-container ${activeView === APP_VIEW.MAP ? 'map-view' : ''}`}>
      <main className="main-content" ref={mainContentRef}>
        <SidebarAnimated 
          activeView={activeView} 
          onViewChange={setActiveView}
          onOpenTicketsModal={() => setIsTicketsModalOpen(true)}
        />
        {renderView()}
      </main>
      <NotificationToast />
      
      {/* Modal de billetes fuera del sidebar */}
      <TicketsModal 
        isOpen={isTicketsModalOpen} 
        onClose={() => setIsTicketsModalOpen(false)}
        onViewWallet={() => {
          setIsTicketsModalOpen(false);
          setActiveView('wallet');
        }}
      />
    </div>
  )
}

export default App
