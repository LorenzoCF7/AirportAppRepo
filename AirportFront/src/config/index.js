// Sistema centralizado de z-index
export const Z_INDEX = {
  // Niveles base (0-10)
  BASE: 1,
  ABOVE: 2,
  ELEMENT: 10,
  
  // Niveles de layout (100-600)
  SIDEBAR: 100,
  SIDEBAR_ELEVATED: 101,
  DROPDOWN: 200,
  STICKY: 500,
  MAP_CONTROLS: 600,
  
  // Niveles de overlay (1000-2000)
  FIXED: 1000,
  OVERLAY: 2000,
  OVERLAY_CONTENT: 2001,
  
  // Cursor personalizado
  CURSOR: 9999,
  
  // Modales y notificaciones (10000+)
  MODAL_BACKDROP: 10000,
  MODAL: 10001,
  NOTIFICATION: 10002,
  
  // FlipCard expandido (máximo nivel)
  FLIPCARD_OVERLAY: 999999,
  FLIPCARD_EXPANDED: 1000000,
};

// Sistema centralizado de breakpoints
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  XXL: 1536,
};

// Media queries para uso en JavaScript
export const MEDIA_QUERIES = {
  SM: `(max-width: ${BREAKPOINTS.SM}px)`,
  MD: `(max-width: ${BREAKPOINTS.MD}px)`,
  LG: `(max-width: ${BREAKPOINTS.LG}px)`,
  XL: `(max-width: ${BREAKPOINTS.XL}px)`,
  XXL: `(max-width: ${BREAKPOINTS.XXL}px)`,
  
  // Min-width (mobile-first)
  SM_UP: `(min-width: ${BREAKPOINTS.SM + 1}px)`,
  MD_UP: `(min-width: ${BREAKPOINTS.MD + 1}px)`,
  LG_UP: `(min-width: ${BREAKPOINTS.LG + 1}px)`,
  XL_UP: `(min-width: ${BREAKPOINTS.XL + 1}px)`,
};

// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
};
