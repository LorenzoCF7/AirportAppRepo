import { useRef, useCallback, useEffect } from 'react';

// Hook para manejar scroll a vistas usando refs
export const useViewScroll = ({
  offset = 100,
  behavior = 'smooth',
  skipFirstRender = true
} = {}) => {
  const containerRef = useRef(null);
  const isFirstRender = useRef(skipFirstRender);

  // Calcula la posición de scroll para un elemento
  const calculateScrollPosition = useCallback((element) => {
    if (!element) return 0;
    
    const rect = element.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const offsetTop = rect.top + scrollTop;
    
    return offsetTop - offset;
  }, [offset]);

  // Hace scroll al contenedor referenciado
  const scrollToContainer = useCallback(() => {
    if (!containerRef.current) {
      console.warn('useViewScroll: containerRef no está asignado a ningún elemento');
      return false;
    }
    
    const targetPosition = calculateScrollPosition(containerRef.current);
    
    window.scrollTo({
      top: targetPosition,
      behavior
    });
    
    return true;
  }, [calculateScrollPosition, behavior]);

  // Hace scroll a un elemento específico
  const scrollToElement = useCallback((element) => {
    if (!element) {
      console.warn('useViewScroll: elemento no proporcionado');
      return false;
    }
    
    const targetPosition = calculateScrollPosition(element);
    
    window.scrollTo({
      top: targetPosition,
      behavior
    });
    
    return true;
  }, [calculateScrollPosition, behavior]);

  // Hace scroll al top de la página
  const scrollToTop = useCallback(() => {
    window.scrollTo({
      top: 0,
      behavior
    });
  }, [behavior]);

  // Hace scroll si no es el primer render
  const scrollIfNotFirst = useCallback(() => {
    if (!isFirstRender.current) {
      return scrollToContainer();
    }
    
    // Marcar que ya no es el primer render
    isFirstRender.current = false;
    return false;
  }, [scrollToContainer]);

  // Reset del flag de primer render
  const resetFirstRender = useCallback(() => {
    isFirstRender.current = true;
  }, []);

  // Marca que el primer render ya pasó
  const markFirstRenderDone = useCallback(() => {
    isFirstRender.current = false;
  }, []);

  return {
    // Refs
    containerRef,
    isFirstRender,
    
    // Funciones de scroll
    scrollToContainer,
    scrollToElement,
    scrollToTop,
    scrollIfNotFirst,
    
    // Utilidades
    calculateScrollPosition,
    resetFirstRender,
    markFirstRenderDone
  };
};

// Hook simplificado para scroll automático en cambios de vista
export const useAutoScrollOnChange = (dependency, options = {}) => {
  const { containerRef, scrollIfNotFirst } = useViewScroll(options);

  useEffect(() => {
    scrollIfNotFirst();
  }, [dependency, scrollIfNotFirst]);

  return containerRef;
};

export default useViewScroll;
