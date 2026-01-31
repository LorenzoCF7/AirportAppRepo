// Barrel export de utilidades

// Formatters
export { 
  formatTime, 
  formatDate, 
  formatDateTime,
  formatDateLong,
  formatAltitude,
  formatSpeed,
  formatPrice,
  isValidCoordinate 
} from './formatters';

// Flight Status
export { 
  getStatusConfig, 
  getStatusLabel, 
  getStatusColor,
  isFlightActive,
  isFlightCompleted 
} from './flightStatus.jsx';

// Strings
export { 
  capitalize, 
  truncate, 
  kebabToCamel,
  camelToKebab,
  generateId,
  generateBookingCode,
  cleanSpaces,
  isEmpty 
} from './strings';
