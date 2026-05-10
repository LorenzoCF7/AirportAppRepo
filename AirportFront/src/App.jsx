import { useState, useEffect, useRef, useCallback, lazy, Suspense } from 'react'

import Header from './components/Header/Header'
import Footer from './components/Footer/Footer'
import LoadingSpinner from './components/LoadingSpinner/LoadingSpinner'
import NotificationToast from './components/NotificationToast/NotificationToast'
import TicketsModal from './components/TicketsModal/TicketsModal'
import LoginRegisterModal from './components/LoginRegisterModal/LoginRegisterModal'
import { useAuth } from './context/AuthContext'
import { flightService } from './services/flightService'
import { flightSimulator } from './services/flightSimulator'
import { APP_VIEW, STORAGE_KEYS, SCROLL_OFFSET, SIMULATOR_INTERVAL } from './constants'
import './App.css'

//
const DashboardView = lazy(() => import('./components/DashboardView/DashboardView'))
const SearchView = lazy(() => import('./components/SearchView/SearchView'))
const RealTimeMap = lazy(() => import('./components/RealTimeMap/RealTimeMap'))
const FlightShop = lazy(() => import('./components/FlightShop/FlightShop'))
const WalletView = lazy(() => import('./components/WalletView/WalletView'))
const ExploreView = lazy(() => import('./components/ExploreView/ExploreView'))
const ProfileView = lazy(() => import('./components/ProfileView/ProfileView'))

function App() {
  const mainContentRef = useRef(null);
  const appContainerRef = useRef(null);
  const isFirstRender = useRef(true);
  const { isAuthenticated } = useAuth();
  const [isTicketsModalOpen, setIsTicketsModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  
  const [activeView, setActiveView] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_VIEW) || APP_VIEW.DASHBOARD;
  });

  //
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

  //
  const handleViewChange = useCallback((newView) => {
    //
    if ((newView === APP_VIEW.SHOP || newView === APP_VIEW.WALLET) && !isAuthenticated) {
      setIsLoginModalOpen(true);
      return;
    }
    
    //
    setActiveView(newView);
  }, [isAuthenticated]);

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
    switch (activeView) {
      case APP_VIEW.SEARCH:
        return (
          <Suspense fallback={<LoadingSpinner message="Cargando vista..." />}>
            <SearchView />
          </Suspense>
        );
      case APP_VIEW.MAP:
        return (
          <Suspense fallback={<LoadingSpinner message="Cargando vista..." />}>
            <RealTimeMap />
          </Suspense>
        );
      case APP_VIEW.SHOP:
        return (
          <Suspense fallback={<LoadingSpinner message="Cargando vista..." />}>
            <FlightShop />
          </Suspense>
        );
      case APP_VIEW.WALLET:
        return (
          <Suspense fallback={<LoadingSpinner message="Cargando vista..." />}>
            <WalletView />
          </Suspense>
        );
      case APP_VIEW.EXPLORE:
        return (
          <Suspense fallback={<LoadingSpinner message="Cargando mapa..." />}>
            <ExploreView onNavigate={handleViewChange} />
          </Suspense>
        );
      case APP_VIEW.PROFILE:
        return (
          <Suspense fallback={<LoadingSpinner message="Cargando perfil..." />}>
            <ProfileView onNavigate={handleViewChange} />
          </Suspense>
        );
      case APP_VIEW.DASHBOARD:
      default:
        return (
          <Suspense fallback={<LoadingSpinner message="Cargando vista..." />}>
            <DashboardView onNavigate={handleViewChange} />
          </Suspense>
        );
    }
  }

  return (
    <div ref={appContainerRef} className={`app-container ${(activeView === APP_VIEW.MAP || activeView === APP_VIEW.EXPLORE) ? 'map-view' : ''}`}>
      <Header
        activeView={activeView}
        onViewChange={handleViewChange}
        onLogout={() => setActiveView(APP_VIEW.DASHBOARD)}
        onOpenTicketsModal={() => {
          if (isAuthenticated) {
            setIsTicketsModalOpen(true);
          } else {
            setIsLoginModalOpen(true);
          }
        }}
      />
      <main className="main-content" ref={mainContentRef}>
        {renderView()}
        {activeView !== APP_VIEW.MAP && activeView !== APP_VIEW.EXPLORE && <Footer />}
      </main>
      <NotificationToast />

      <TicketsModal
        isOpen={isTicketsModalOpen}
        onClose={() => setIsTicketsModalOpen(false)}
        onViewWallet={() => {
          setIsTicketsModalOpen(false);
          handleViewChange(APP_VIEW.WALLET);
        }}
      />

      <LoginRegisterModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </div>
  )
}

export default App
