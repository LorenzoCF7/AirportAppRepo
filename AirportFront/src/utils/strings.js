// Utilidades de manipulación de strings

// Capitaliza la primera letra
export const capitalize = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

// Trunca un string a un máximo de caracteres
export const truncate = (str, maxLength = 50, suffix = '...') => {
  if (!str || typeof str !== 'string') return '';
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength).trim() + suffix;
};

// Convierte kebab-case a camelCase
export const kebabToCamel = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
};

// Convierte camelCase a kebab-case
export const camelToKebab = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
};

// Genera un ID único simple
export const generateId = (prefix = '') => {
  const random = Math.random().toString(36).substring(2, 8);
  return prefix ? `${prefix}-${random}` : random;
};

// Genera un código de reserva aleatorio
export const generateBookingCode = (length = 6) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// Elimina espacios extra de un string
export const cleanSpaces = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str.replace(/\s+/g, ' ').trim();
};

// Verifica si un string está vacío
export const isEmpty = (str) => {
  return !str || str.trim().length === 0;
};

export default {
  capitalize,
  truncate,
  kebabToCamel,
  camelToKebab,
  generateId,
  generateBookingCode,
  cleanSpaces,
  isEmpty
};
