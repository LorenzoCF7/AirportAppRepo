// Utilidades de estado de vuelo

import { Clock, Plane, CheckCircle, AlertCircle } from 'lucide-react';
import { 
  FLIGHT_STATUS, 
  FLIGHT_STATUS_LABELS, 
  FLIGHT_STATUS_COLORS 
} from '../constants/flightStatus';

// Obtiene la configuración completa de un estado de vuelo (colores, icono, label)
export const getStatusConfig = (status) => {
  const configs = {
    [FLIGHT_STATUS.SCHEDULED]: {
      ...FLIGHT_STATUS_COLORS[FLIGHT_STATUS.SCHEDULED],
      icon: <Clock size={16} />,
      label: FLIGHT_STATUS_LABELS[FLIGHT_STATUS.SCHEDULED],
      rotating: false
    },
    [FLIGHT_STATUS.ACTIVE]: {
      ...FLIGHT_STATUS_COLORS[FLIGHT_STATUS.ACTIVE],
      icon: <Plane size={16} />,
      label: FLIGHT_STATUS_LABELS[FLIGHT_STATUS.ACTIVE],
      rotating: false
    },
    [FLIGHT_STATUS.LANDED]: {
      ...FLIGHT_STATUS_COLORS[FLIGHT_STATUS.LANDED],
      icon: <CheckCircle size={16} />,
      label: FLIGHT_STATUS_LABELS[FLIGHT_STATUS.LANDED],
      rotating: false
    },
    [FLIGHT_STATUS.CANCELLED]: {
      ...FLIGHT_STATUS_COLORS[FLIGHT_STATUS.CANCELLED],
      icon: <AlertCircle size={16} />,
      label: FLIGHT_STATUS_LABELS[FLIGHT_STATUS.CANCELLED],
      rotating: false
    },
    [FLIGHT_STATUS.DELAYED]: {
      ...FLIGHT_STATUS_COLORS[FLIGHT_STATUS.DELAYED],
      icon: <Clock size={16} />,
      label: FLIGHT_STATUS_LABELS[FLIGHT_STATUS.DELAYED],
      rotating: true
    }
  };
  
  return configs[status] || configs[FLIGHT_STATUS.SCHEDULED];
};

// Obtiene la etiqueta traducida de un estado
export const getStatusLabel = (status) => {
  return FLIGHT_STATUS_LABELS[status] || 'Desconocido';
};

// Obtiene los colores de un estado
export const getStatusColor = (status) => {
  return FLIGHT_STATUS_COLORS[status] || FLIGHT_STATUS_COLORS[FLIGHT_STATUS.SCHEDULED];
};

// Determina si el vuelo está activo
export const isFlightActive = (status) => {
  return status === FLIGHT_STATUS.ACTIVE;
};

// Determina si el vuelo ha terminado
export const isFlightCompleted = (status) => {
  return status === FLIGHT_STATUS.LANDED || status === FLIGHT_STATUS.CANCELLED;
};

export default {
  getStatusConfig,
  getStatusLabel,
  getStatusColor,
  isFlightActive,
  isFlightCompleted
};
