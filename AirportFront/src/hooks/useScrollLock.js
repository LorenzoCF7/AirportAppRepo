import { useEffect, useRef } from 'react';

// Bloquea/desbloquea el scroll del body para modales
export const useScrollLock = (isLocked) => {
  const scrollPositionRef = useRef(0);

  useEffect(() => {
    if (!isLocked) return;

    // Guardar posición actual de scroll
    scrollPositionRef.current = window.scrollY;
    
    // Bloquear scroll
    const originalStyle = {
      overflow: document.body.style.overflow,
      position: document.body.style.position,
      top: document.body.style.top,
      width: document.body.style.width,
      paddingRight: document.body.style.paddingRight
    };

    // Calcular ancho de scrollbar para evitar "jump"
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollPositionRef.current}px`;
    document.body.style.width = '100%';
    
    // Añadir padding para compensar scrollbar
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    // Cleanup: restaurar estilos originales
    return () => {
      document.body.style.overflow = originalStyle.overflow;
      document.body.style.position = originalStyle.position;
      document.body.style.top = originalStyle.top;
      document.body.style.width = originalStyle.width;
      document.body.style.paddingRight = originalStyle.paddingRight;

      // Restaurar posición de scroll
      window.scrollTo(0, scrollPositionRef.current);
    };
  }, [isLocked]);
};

// Versión simplificada que solo bloquea overflow
export const useSimpleScrollLock = (isLocked) => {
  useEffect(() => {
    if (!isLocked) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isLocked]);
};

export default useScrollLock;
