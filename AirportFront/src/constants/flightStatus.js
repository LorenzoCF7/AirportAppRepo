// Constantes de estados de vuelo

export const FLIGHT_STATUS = {
  SCHEDULED: 'scheduled',
  ACTIVE: 'active',
  LANDED: 'landed',
  CANCELLED: 'cancelled',
  DELAYED: 'delayed'
};

export const FLIGHT_STATUS_LABELS = {
  [FLIGHT_STATUS.SCHEDULED]: 'Programado',
  [FLIGHT_STATUS.ACTIVE]: 'En Vuelo',
  [FLIGHT_STATUS.LANDED]: 'Aterrizado',
  [FLIGHT_STATUS.CANCELLED]: 'Cancelado',
  [FLIGHT_STATUS.DELAYED]: 'Retrasado'
};

export const FLIGHT_STATUS_COLORS = {
  [FLIGHT_STATUS.SCHEDULED]: {
    bg: 'linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%)',
    color: '#1E3A8A',
    shadowColor: 'rgba(59, 130, 246, 0.3)',
    gradient: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)'
  },
  [FLIGHT_STATUS.ACTIVE]: {
    bg: 'linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%)',
    color: '#065F46',
    shadowColor: 'rgba(16, 185, 129, 0.3)',
    gradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
  },
  [FLIGHT_STATUS.LANDED]: {
    bg: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
    color: '#92400E',
    shadowColor: 'rgba(245, 158, 11, 0.3)',
    gradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)'
  },
  [FLIGHT_STATUS.CANCELLED]: {
    bg: 'linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%)',
    color: '#991B1B',
    shadowColor: 'rgba(239, 68, 68, 0.2)',
    gradient: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)'
  },
  [FLIGHT_STATUS.DELAYED]: {
    bg: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
    color: '#92400E',
    shadowColor: 'rgba(245, 158, 11, 0.2)',
    gradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)'
  }
};
