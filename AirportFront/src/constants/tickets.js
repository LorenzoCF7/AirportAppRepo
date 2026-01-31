// Constantes de clases de cabina y estados de tickets

export const CABIN_CLASS = {
  ECONOMY: 'economy',
  BUSINESS: 'business',
  FIRST: 'first'
};

export const CABIN_CLASS_LABELS = {
  [CABIN_CLASS.ECONOMY]: 'Turista',
  [CABIN_CLASS.BUSINESS]: 'Business',
  [CABIN_CLASS.FIRST]: 'Primera'
};

export const TICKET_STATUS = {
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled'
};

export const TICKET_FILTER = {
  ALL: 'all',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled'
};
