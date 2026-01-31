import { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, AlertCircle, Plane, PlaneTakeoff, TrendingUp, Clock, Calendar } from 'lucide-react';

import FlipCard from '../FlipCard/FlipCard';
import { flightService } from '../../services/flightService';
import { flightSimulator } from '../../services/flightSimulator';
import styles from './DashboardView.module.css';

const DashboardView = () => {
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(false); // Cambiado a false para renderizar inmediatamente
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // React 19: useCallback para optimizar re-renders
  const loadFlights = useCallback(async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);
      
      // Obtener vuelos (forzar refresh genera nuevos datos MOCK)
      const response = await flightService.getAllFlights(forceRefresh);
      const newFlights = response.data || [];
      
      // Si es refresh forzado, reinicializar el simulador con los nuevos datos
      if (forceRefresh) {
        console.log('🔄 Reinicializando simulador con nuevos vuelos...');
        flightSimulator.clear(false); // Limpiar datos pero mantener el simulador corriendo
        flightSimulator.initializeFlights(newFlights);
      }
      
      setFlights(newFlights);
      setLastUpdate(new Date());
      
      console.log('✅ Dashboard actualizado con', newFlights.length, 'vuelos');
    } catch (err) {
      setError('Error al cargar los vuelos. Por favor, intenta de nuevo.');
      console.error('Error loading flights:', err);
    } finally {
      setLoading(false);
    }
  }, []); // Sin dependencias para evitar bucle infinito

  useEffect(() => {
    loadFlights();
    
    // Escuchar eventos de cambio de estado del simulador
    const handleFlightUpdate = () => {
      // Recargar solo desde sessionStorage (sin hacer nueva llamada a API)
      const stored = sessionStorage.getItem('flight_tracker_data');
      if (stored) {
        const data = JSON.parse(stored);
        setFlights(data.data || []);
        setLastUpdate(new Date());
      }
    };
    
    // Actualización automática cada 2 segundos desde sessionStorage
    // Esto permite ver cambios en tiempo real mientras miras las tarjetas
    const intervalId = setInterval(handleFlightUpdate, 2000);
    
    // Escuchar notificaciones de vuelos (despegue/aterrizaje)
    window.addEventListener('flight-notification', handleFlightUpdate);
    
    return () => {
      clearInterval(intervalId);
      window.removeEventListener('flight-notification', handleFlightUpdate);
    };
  }, []); // Solo se ejecuta una vez al montar

  // React 19: useMemo para cachear cálculos pesados
  const stats = useMemo(() => ({
    total: flights.length,
    active: flights.filter(f => f.flight_status === 'active').length,
    scheduled: flights.filter(f => f.flight_status === 'scheduled').length,
    landed: flights.filter(f => f.flight_status === 'landed').length,
  }), [flights]);

  // Ordenar vuelos por estado: active → scheduled → landed
  const sortedFlights = useMemo(() => {
    const statusOrder = {
      'active': 1,
      'scheduled': 2,
      'landed': 3,
      'cancelled': 4,
      'delayed': 5
    };
    
    return [...flights].sort((a, b) => {
      const orderA = statusOrder[a.flight_status] || 999;
      const orderB = statusOrder[b.flight_status] || 999;
      return orderA - orderB;
    });
  }, [flights]);

  return (
    <div className={styles.dashboardView}>
      {/* Header - Renderizar inmediatamente sin animación para mejorar LCP */}
      <div className={styles.viewHeader}>
        <div className={styles.headerContent}>
          <div>
            <h1 className={styles.dashboardTitle}>
              <Plane className={styles.titleIcon} />
              Dashboard - Vuelos en Europa
            </h1>
            <p className={styles.dashboardSubtitle}>
              Modo de prueba con datos simulados • Actualización manual
            </p>
          </div>
          <button
            onClick={() => loadFlights(true)}
            disabled={loading}
            className={styles.refreshButton}
          >
            <RefreshCw size={20} className={loading ? 'spinning' : ''} />
            <span>Actualizar Vuelos</span>
          </button>
        </div>
      </div>

      {/* Stats Cards - SIN motion.div wrapper para prevenir override de estilos */}
      <div className={styles.statsGrid}>
        <StatsCard
          value={stats.total}
          label="Total Vuelos"
          type="total"
          icon={<PlaneTakeoff className="stat-icon" />}
        />
        <StatsCard
          value={stats.active}
          label="En Vuelo"
          type="active"
          icon={<TrendingUp className="stat-icon" />}
          pulse
        />
        <StatsCard
          value={stats.scheduled}
          label="Programados"
          type="scheduled"
          icon={<Clock className="stat-icon" />}
        />
        <StatsCard
          value={stats.landed}
          label="Aterrizados"
          type="landed"
          icon={<Calendar className="stat-icon" />}
        />
      </div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={styles.errorMessage}
          >
            <AlertCircle size={20} />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Flights Section */}
      <div className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <h2>Vuelos Recientes</h2>
          <span className={styles.lastUpdate}>
            <Clock size={16} />
            Última actualización: {lastUpdate.toLocaleTimeString('es-ES')}
          </span>
        </div>

        {loading ? (
          <div className={styles.loadingContainer}>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              className={styles.loadingSpinner}
            />
            <p>Cargando vuelos...</p>
          </div>
        ) : sortedFlights.length === 0 ? (
          <div className={styles.emptyState}>
            <Plane size={48} style={{ opacity: 0.3 }} />
            <p>No hay vuelos disponibles</p>
            <button onClick={() => loadFlights(true)} className={styles.refreshButton}>
              <RefreshCw size={20} />
              <span>Cargar Vuelos</span>
            </button>
          </div>
        ) : (
          <div className={styles.flightsGrid}>
            {sortedFlights.map((flight, index) => (
              <FlipCard
                key={flight.flight?.iata || flight.flightNumber || `flight-${index}`}
                flight={flight}
                index={index}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Stats Card Component - Memoizado para evitar re-renders innecesarios
const StatsCard = memo(({ value, label, type, icon, pulse }) => {
  return (
    <div className={`${styles.statCard} ${styles[`statCard${type.charAt(0).toUpperCase() + type.slice(1)}`]}`}>
      <div className={styles.statCardInner}>
        <div className={styles.statHeader}>
          <div className={`${styles.statIconWrapper} ${pulse ? styles.pulse : ''}`}>
            {icon}
          </div>
        </div>
        <div className={styles.statValue}>{value}</div>
        <div className={styles.statLabel}>{label}</div>
      </div>
    </div>
  );
});

StatsCard.displayName = 'StatsCard';

export default DashboardView;
export { StatsCard };
