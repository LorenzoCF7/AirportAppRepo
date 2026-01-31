import { useEffect, useRef, useCallback, useMemo } from 'react';
import { gsap } from 'gsap';
import styles from './TargetCursor.module.css';

const TargetCursor = ({
  targetSelector = '.cursor-target',
  dynamicTargetSelector = '.plane-icon',
  spinDuration = 2,
  hideDefaultCursor = true,
  hoverDuration = 0.2,
  parallaxOn = true,
  radarEffect = true,
  enableSpin = true
}) => {
  const cursorRef = useRef(null);
  const cornersRef = useRef(null);
  const spinTl = useRef(null);
  const dotRef = useRef(null);

  const isActiveRef = useRef(false);
  const targetCornerPositionsRef = useRef(null);
  const tickerFnRef = useRef(null);
  const activeStrengthRef = useRef(0);
  const lockTimeoutRef = useRef(null);
  const lastMouseMoveRef = useRef(Date.now());

  const isMobile = useMemo(() => {
    const hasTouchScreen = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const isSmallScreen = window.innerWidth <= 768;
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
    const isMobileUserAgent = mobileRegex.test(userAgent.toLowerCase());
    return (hasTouchScreen && isSmallScreen) || isMobileUserAgent;
  }, []);

  const constants = useMemo(
    () => ({
      borderWidth: 3,
      cornerSize: 12
    }),
    []
  );

  const moveCursor = useCallback((x, y) => {
    if (!cursorRef.current) return;
    gsap.to(cursorRef.current, {
      x,
      y,
      duration: 0.1,
      ease: 'power3.out'
    });
  }, []);

  useEffect(() => {
    if (isMobile || !cursorRef.current) return;

    const originalCursor = document.body.style.cursor;
    if (hideDefaultCursor) {
      document.body.style.cursor = 'none';
    }

    const cursor = cursorRef.current;
    const corners = cursor.querySelectorAll(`.${styles.targetCursorCorner}`);
    cornersRef.current = corners;

    let activeTarget = null;
    let currentLeaveHandler = null;
    let resumeTimeout = null;

    const cleanupTarget = target => {
      if (currentLeaveHandler) {
        target.removeEventListener('mouseleave', currentLeaveHandler);
      }
      currentLeaveHandler = null;
    };

    gsap.set(cursor, {
      xPercent: -50,
      yPercent: -50,
      x: window.innerWidth / 2,
      y: window.innerHeight / 2
    });

    const createSpinTimeline = () => {
      if (spinTl.current) {
        spinTl.current.kill();
      }
      
      if (enableSpin) {
        spinTl.current = gsap
          .timeline({ repeat: -1 })
          .to(cursor, { rotation: '+=360', duration: spinDuration, ease: 'none' });
      }
    };

    createSpinTimeline();

    const tickerFn = () => {
      if (!targetCornerPositionsRef.current || !cursorRef.current || !cornersRef.current) {
        return;
      }

      const strength = activeStrengthRef.current;
      if (strength === 0) return;

      const cursorX = gsap.getProperty(cursorRef.current, 'x');
      const cursorY = gsap.getProperty(cursorRef.current, 'y');

      const corners = Array.from(cornersRef.current);
      corners.forEach((corner, i) => {
        const currentX = gsap.getProperty(corner, 'x');
        const currentY = gsap.getProperty(corner, 'y');

        const targetX = targetCornerPositionsRef.current[i].x - cursorX;
        const targetY = targetCornerPositionsRef.current[i].y - cursorY;

        const finalX = currentX + (targetX - currentX) * strength;
        const finalY = currentY + (targetY - currentY) * strength;

        const duration = strength >= 0.99 ? (parallaxOn ? 0.2 : 0) : 0.05;

        gsap.to(corner, {
          x: finalX,
          y: finalY,
          duration: duration,
          ease: duration === 0 ? 'none' : 'power1.out',
          overwrite: 'auto'
        });
      });
    };

    tickerFnRef.current = tickerFn;

    const moveHandler = e => {
      moveCursor(e.clientX, e.clientY);
      lastMouseMoveRef.current = Date.now();
      
      // Si se mueve el ratón, cancelar el timeout de lock
      if (lockTimeoutRef.current) {
        clearTimeout(lockTimeoutRef.current);
      }
    };
    window.addEventListener('mousemove', moveHandler);
    
    // Escuchar evento para mover el cursor automáticamente (cuando sigue un avión)
    const moveCursorToHandler = (event) => {
      const { x, y } = event.detail;
      if (x && y) {
        moveCursor(x, y);
      }
    };
    window.addEventListener('move-cursor-to', moveCursorToHandler);

    const scrollHandler = () => {
      if (!activeTarget || !cursorRef.current) return;
      
      // Verificar si el target todavía está en el DOM y es visible
      if (!document.body.contains(activeTarget)) {
        if (currentLeaveHandler) {
          currentLeaveHandler();
        }
        return;
      }
      
      const rect = activeTarget.getBoundingClientRect();
      
      // Si el target se salió de la vista, cancelar
      if (rect.width === 0 || rect.height === 0 || 
          rect.top < -100 || rect.bottom > window.innerHeight + 100 ||
          rect.left < -100 || rect.right > window.innerWidth + 100) {
        if (currentLeaveHandler) {
          currentLeaveHandler();
        }
        return;
      }
      
      const { borderWidth, cornerSize } = constants;
      
      // Actualizar posiciones de las esquinas según nueva posición del target
      targetCornerPositionsRef.current = [
        { x: rect.left - borderWidth, y: rect.top - borderWidth },
        { x: rect.right + borderWidth - cornerSize, y: rect.top - borderWidth },
        { x: rect.right + borderWidth - cornerSize, y: rect.bottom + borderWidth - cornerSize },
        { x: rect.left - borderWidth, y: rect.bottom + borderWidth - cornerSize }
      ];
      
      // Verificar si el cursor sigue sobre el target
      const mouseX = gsap.getProperty(cursorRef.current, 'x');
      const mouseY = gsap.getProperty(cursorRef.current, 'y');
      const elementUnderMouse = document.elementFromPoint(mouseX, mouseY);
      
      if (!elementUnderMouse) {
        if (currentLeaveHandler) {
          currentLeaveHandler();
        }
        return;
      }
      
      const isStillOverTarget =
        elementUnderMouse === activeTarget || 
        elementUnderMouse.closest(targetSelector) === activeTarget ||
        elementUnderMouse.closest(dynamicTargetSelector) === activeTarget;
      
      if (!isStillOverTarget) {
        if (currentLeaveHandler) {
          currentLeaveHandler();
        }
      }
    };
    window.addEventListener('scroll', scrollHandler, { passive: true });
    
    // Detectar movimientos/zoom del mapa de Leaflet
    const mapMoveHandler = () => {
      if (activeTarget && activeTarget.closest('.leaflet-container')) {
        // Usar requestAnimationFrame para evitar llamadas excesivas
        requestAnimationFrame(() => {
          scrollHandler();
        });
      }
    };
    
    // Escuchar eventos de Leaflet si existe un mapa
    const leafletContainer = document.querySelector('.leaflet-container');
    let mapMoveThrottle = null;
    const throttledMapMove = () => {
      if (mapMoveThrottle) return;
      mapMoveThrottle = setTimeout(() => {
        mapMoveHandler();
        mapMoveThrottle = null;
      }, 50); // Throttle a 50ms
    };
    
    if (leafletContainer) {
      leafletContainer.addEventListener('mousewheel', throttledMapMove, { passive: true });
      leafletContainer.addEventListener('mousemove', throttledMapMove, { passive: true });
    }

    const mouseDownHandler = () => {
      if (!dotRef.current) return;
      gsap.to(dotRef.current, { scale: 0.7, duration: 0.3 });
      gsap.to(cursorRef.current, { scale: 0.9, duration: 0.2 });
    };

    const mouseUpHandler = () => {
      if (!dotRef.current) return;
      gsap.to(dotRef.current, { scale: 1, duration: 0.3 });
      gsap.to(cursorRef.current, { scale: 1, duration: 0.2 });
    };

    window.addEventListener('mousedown', mouseDownHandler);
    window.addEventListener('mouseup', mouseUpHandler);

    const enterHandler = e => {
      const directTarget = e.target;
      const allTargets = [];
      let current = directTarget;
      while (current && current !== document.body) {
        // Priorizar elementos dinámicos (aviones) sobre targets estáticos
        if (current.matches(dynamicTargetSelector)) {
          allTargets.unshift(current); // Añadir al inicio para darles prioridad
        } else if (current.matches(targetSelector)) {
          allTargets.push(current);
        }
        current = current.parentElement;
      }
      const target = allTargets[0] || null;
      if (!target || !cursorRef.current || !cornersRef.current) return;
      if (activeTarget === target) return;
      if (activeTarget) {
        cleanupTarget(activeTarget);
      }
      if (resumeTimeout) {
        clearTimeout(resumeTimeout);
        resumeTimeout = null;
      }

      activeTarget = target;
      const corners = Array.from(cornersRef.current);
      corners.forEach(corner => gsap.killTweensOf(corner));

      gsap.killTweensOf(cursorRef.current, 'rotation');
      spinTl.current?.pause();
      gsap.set(cursorRef.current, { rotation: 0 });

      // Detectar si el target es un avión (plane-icon) para efecto de radar
      const isPlane = target.matches(dynamicTargetSelector);
      if (isPlane && radarEffect && cursorRef.current) {
        cursorRef.current.classList.add(styles.radarLock);
        
        // Iniciar timeout para seguimiento automático si el cursor se queda quieto
        if (lockTimeoutRef.current) {
          clearTimeout(lockTimeoutRef.current);
        }
        
        lockTimeoutRef.current = setTimeout(() => {
          // Si han pasado 800ms sin mover el ratón, activar seguimiento
          const timeSinceLastMove = Date.now() - lastMouseMoveRef.current;
          if (timeSinceLastMove >= 700 && activeTarget && isPlane) {
            console.log('🎯 Lock confirmado en avión - Activando seguimiento automático');
            
            // Emitir evento personalizado para que RealTimeMap active el seguimiento
            const lockEvent = new CustomEvent('plane-lock', {
              detail: { target: activeTarget }
            });
            window.dispatchEvent(lockEvent);
          }
        }, 800);
      } else if (cursorRef.current) {
        cursorRef.current.classList.remove(styles.radarLock);
        if (lockTimeoutRef.current) {
          clearTimeout(lockTimeoutRef.current);
        }
      }

      const rect = target.getBoundingClientRect();
      const { borderWidth, cornerSize } = constants;
      const cursorX = gsap.getProperty(cursorRef.current, 'x');
      const cursorY = gsap.getProperty(cursorRef.current, 'y');

      targetCornerPositionsRef.current = [
        { x: rect.left - borderWidth, y: rect.top - borderWidth },
        { x: rect.right + borderWidth - cornerSize, y: rect.top - borderWidth },
        { x: rect.right + borderWidth - cornerSize, y: rect.bottom + borderWidth - cornerSize },
        { x: rect.left - borderWidth, y: rect.bottom + borderWidth - cornerSize }
      ];

      isActiveRef.current = true;
      gsap.ticker.add(tickerFnRef.current);

      gsap.to(activeStrengthRef, {
        current: 1,
        duration: hoverDuration,
        ease: 'power2.out'
      });

      corners.forEach((corner, i) => {
        gsap.to(corner, {
          x: targetCornerPositionsRef.current[i].x - cursorX,
          y: targetCornerPositionsRef.current[i].y - cursorY,
          duration: 0.2,
          ease: 'power2.out'
        });
      });

      const leaveHandler = () => {
        gsap.ticker.remove(tickerFnRef.current);

        isActiveRef.current = false;
        targetCornerPositionsRef.current = null;
        gsap.set(activeStrengthRef, { current: 0, overwrite: true });
        
        // Remover clase de radar al salir
        if (cursorRef.current) {
          cursorRef.current.classList.remove(styles.radarLock);
        }
        
        // Cancelar timeout de lock
        if (lockTimeoutRef.current) {
          clearTimeout(lockTimeoutRef.current);
          lockTimeoutRef.current = null;
        }
        
        activeTarget = null;

        if (cornersRef.current) {
          const corners = Array.from(cornersRef.current);
          gsap.killTweensOf(corners);
          const { cornerSize } = constants;
          const positions = [
            { x: -cornerSize * 1.5, y: -cornerSize * 1.5 },
            { x: cornerSize * 0.5, y: -cornerSize * 1.5 },
            { x: cornerSize * 0.5, y: cornerSize * 0.5 },
            { x: -cornerSize * 1.5, y: cornerSize * 0.5 }
          ];
          const tl = gsap.timeline();
          corners.forEach((corner, index) => {
            tl.to(
              corner,
              {
                x: positions[index].x,
                y: positions[index].y,
                duration: 0.3,
                ease: 'power3.out'
              },
              0
            );
          });
        }

        resumeTimeout = setTimeout(() => {
          if (!activeTarget && cursorRef.current && spinTl.current && enableSpin) {
            const currentRotation = gsap.getProperty(cursorRef.current, 'rotation');
            const normalizedRotation = currentRotation % 360;
            spinTl.current.kill();
            spinTl.current = gsap
              .timeline({ repeat: -1 })
              .to(cursorRef.current, { rotation: '+=360', duration: spinDuration, ease: 'none' });
            gsap.to(cursorRef.current, {
              rotation: normalizedRotation + 360,
              duration: spinDuration * (1 - normalizedRotation / 360),
              ease: 'none',
              onComplete: () => {
                spinTl.current?.restart();
              }
            });
          }
          resumeTimeout = null;
        }, 50);

        cleanupTarget(target);
      };

      currentLeaveHandler = leaveHandler;
      target.addEventListener('mouseleave', leaveHandler);
    };

    window.addEventListener('mouseover', enterHandler, { passive: true });

    return () => {
      if (tickerFnRef.current) {
        gsap.ticker.remove(tickerFnRef.current);
      }

      window.removeEventListener('mousemove', moveHandler);
      window.removeEventListener('move-cursor-to', moveCursorToHandler);
      window.removeEventListener('mouseover', enterHandler);
      window.removeEventListener('scroll', scrollHandler);
      window.removeEventListener('mousedown', mouseDownHandler);
      window.removeEventListener('mouseup', mouseUpHandler);
      
      // Limpiar listeners del mapa de Leaflet
      const leafletContainer = document.querySelector('.leaflet-container');
      if (leafletContainer) {
        leafletContainer.removeEventListener('mousewheel', mapMoveHandler);
        leafletContainer.removeEventListener('mousemove', mapMoveHandler);
      }

      if (activeTarget) {
        cleanupTarget(activeTarget);
      }

      spinTl.current?.kill();
      document.body.style.cursor = originalCursor;

      isActiveRef.current = false;
      targetCornerPositionsRef.current = null;
      activeStrengthRef.current = 0;
      
      // Forzar limpieza del lock y animaciones al desmontar
      if (cursor) {
        cursor.classList.remove(styles.radarLock);
        gsap.killTweensOf(cursor);
      }
      if (corners && corners.length) {
        gsap.killTweensOf(Array.from(corners));
      }
      
      // Limpiar timeout de lock
      if (lockTimeoutRef.current) {
        clearTimeout(lockTimeoutRef.current);
      }
    };
  }, [targetSelector, dynamicTargetSelector, spinDuration, moveCursor, constants, hideDefaultCursor, isMobile, hoverDuration, parallaxOn, radarEffect, enableSpin]);

  useEffect(() => {
    if (isMobile || !cursorRef.current || !spinTl.current) return;
    if (spinTl.current.isActive()) {
      spinTl.current.kill();
      spinTl.current = gsap
        .timeline({ repeat: -1 })
        .to(cursorRef.current, { rotation: '+=360', duration: spinDuration, ease: 'none' });
    }
  }, [spinDuration, isMobile]);

  if (isMobile) {
    return null;
  }

  return (
    <div ref={cursorRef} className={styles.targetCursorWrapper}>
      <div ref={dotRef} className={styles.targetCursorDot} />
      <div className={`${styles.targetCursorCorner} ${styles.cornerTl}`} />
      <div className={`${styles.targetCursorCorner} ${styles.cornerTr}`} />
      <div className={`${styles.targetCursorCorner} ${styles.cornerBr}`} />
      <div className={`${styles.targetCursorCorner} ${styles.cornerBl}`} />
    </div>
  );
};

export default TargetCursor;