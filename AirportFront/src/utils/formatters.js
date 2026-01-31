// Utilidades de formateo de fechas, horas y números

import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Formatea altitud en pies
export const formatAltitude = (altitude) => {
  return altitude ? `${Math.round(altitude).toLocaleString()} ft` : 'N/A';
};

// Formatea velocidad en km/h
export const formatSpeed = (speed) => {
  return speed ? `${Math.round(speed)} km/h` : 'N/A';
};

// Formatea una fecha a hora (HH:mm)
export const formatTime = (dateString) => {
  if (!dateString) return '--:--';
  try {
    return format(new Date(dateString), 'HH:mm', { locale: es });
  } catch {
    return '--:--';
  }
};

// Formatea una fecha a día y mes (dd MMM)
export const formatDate = (dateString) => {
  if (!dateString) return '';
  try {
    return format(new Date(dateString), 'dd MMM', { locale: es });
  } catch {
    return '';
  }
};

// Formatea una fecha completa con hora
export const formatDateTime = (dateString) => {
  if (!dateString) return 'No disponible';
  try {
    return format(new Date(dateString), "dd 'de' MMMM 'a las' HH:mm", { locale: es });
  } catch {
    return 'No disponible';
  }
};

// Formatea fecha en formato largo
export const formatDateLong = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    return format(new Date(dateString), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: es });
  } catch {
    return 'N/A';
  }
};

// Valida coordenadas GPS
export const isValidCoordinate = (lat, lng) => {
  const latitude = Number(lat);
  const longitude = Number(lng);
  return !isNaN(latitude) && !isNaN(longitude) && 
         latitude >= -90 && latitude <= 90 &&
         longitude >= -180 && longitude <= 180;
};

// Formatea un precio con símbolo de moneda
export const formatPrice = (price, currency = 'EUR') => {
  if (price === null || price === undefined) return 'N/A';
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency
  }).format(price);
};
