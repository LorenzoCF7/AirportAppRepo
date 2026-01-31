import { useState, useEffect } from 'react';
import { FLIGHT_STATUS } from '../constants/flightStatus';

// Calcula y actualiza el progreso de un vuelo (0-100)
export const useFlightProgress = (flight, updateInterval = 2000) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!flight) {
      setProgress(0);
      return;
    }

    const calculateProgress = () => {
      // Vuelo aterrizado = 100%
      if (flight.flight_status === FLIGHT_STATUS.LANDED) {
        return 100;
      }
      
      // Vuelo programado = 0%
      if (flight.flight_status === FLIGHT_STATUS.SCHEDULED) {
        return 0;
      }
      
      // Vuelo activo con datos de simulación
      if (flight.flight_status === FLIGHT_STATUS.ACTIVE && flight.simulation?.realProgress) {
        return Math.round(flight.simulation.realProgress * 100);
      }
      
      // Vuelo activo sin simulación - calcular por tiempo
      if (flight.flight_status === FLIGHT_STATUS.ACTIVE && 
          flight.departure?.scheduled) {
        const now = Date.now();
        const departureTime = new Date(flight.departure.scheduled).getTime();
        // Usar estimated o scheduled para la llegada
        const arrivalTimeStr = flight.arrival?.estimated || flight.arrival?.scheduled;
        if (!arrivalTimeStr) return 0;
        
        const arrivalTime = new Date(arrivalTimeStr).getTime();
        const totalDuration = arrivalTime - departureTime;
        const elapsed = now - departureTime;
        
        if (totalDuration <= 0) return 0;
        return Math.max(0, Math.min(100, Math.round((elapsed / totalDuration) * 100)));
      }
      
      return 0;
    };
    
    // Calcular progreso inicial
    setProgress(calculateProgress());
    
    // Actualizar periódicamente solo para vuelos activos
    if (flight.flight_status === FLIGHT_STATUS.ACTIVE) {
      const intervalId = setInterval(() => {
        setProgress(calculateProgress());
      }, updateInterval);
      
      return () => clearInterval(intervalId);
    }
  }, [
    flight?.flight_status, 
    flight?.simulation?.realProgress, 
    flight?.departure?.scheduled, 
    flight?.arrival?.estimated,
    flight?.arrival?.scheduled,
    updateInterval
  ]);

  return progress;
};

export default useFlightProgress;
