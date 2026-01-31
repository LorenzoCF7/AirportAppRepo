import { useState, useRef, useEffect, useCallback } from 'react';
import FlightCard from '../FlightCard/FlightCard';
import FlightDetails from '../FlightDetails/FlightDetails';
import { useScrollLock } from '../../hooks';
import styles from './FlipCard.module.css';

const FlipCard = ({ flight, index }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef(null);
  const timeoutRef = useRef(null);

  // Bloquear scroll cuando la tarjeta está abierta
  useScrollLock(isOpen);

  // Animación de entrada escalonada (sin framer-motion)
  useEffect(() => {
    const delay = index * 30; // 30ms entre cada tarjeta
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [index]);

  // Cleanup de timeouts
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleCardClick = useCallback(() => {
    setIsOpen(true);
    setIsAnimating(true);
    
    // Activar flip después de montar
    timeoutRef.current = setTimeout(() => {
      setIsFlipped(true);
      setIsAnimating(false);
    }, 50);
  }, []);

  const handleClose = useCallback(() => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setIsFlipped(false);
    
    // Cerrar después del flip
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
      setIsAnimating(false);
    }, 600);
  }, [isAnimating]);

  if (!flight) return null;

  return (
    <>
      {/* Overlay - Solo renderizar cuando está abierto */}
      {isOpen && (
        <div 
          className={`${styles.modalOverlay} ${styles.overlayVisible}`}
          onClick={handleClose}
        />
      )}

      {/* Modal expandido - Solo renderizar cuando está abierto */}
      {isOpen && (
        <div 
          className={`${styles.flipCardContainer} ${styles.expanded} ${styles.modalVisible}`}
        >
          <div className={`${styles.flipCardInner} ${isFlipped ? styles.flipped : ''}`}>
            <div className={styles.flipCardFront}>
              <FlightCard flight={flight} onSelect={handleCardClick} />
            </div>
            <div className={styles.flipCardBack}>
              <FlightDetails flight={flight} onClose={handleClose} isFlipped={isFlipped} />
            </div>
          </div>
        </div>
      )}

      {/* Tarjeta en el grid - animación CSS pura */}
      <div
        ref={cardRef}
        className={`${styles.flipCardContainer} ${styles.gridCard} ${isVisible ? styles.visible : ''}`}
        style={{ 
          visibility: isOpen ? 'hidden' : 'visible',
          pointerEvents: isOpen ? 'none' : 'auto'
        }}
      >
        <div className={styles.flipCardInner}>
          <div className={styles.flipCardFront}>
            <FlightCard flight={flight} onSelect={handleCardClick} />
          </div>
        </div>
      </div>
    </>
  );
};

export default FlipCard;
