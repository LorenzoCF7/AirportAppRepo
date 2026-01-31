import { useSpring } from '@react-spring/web';

// Animación de entrada fade-in + slide-up con soporte stagger
export const useFlightAnimation = ({ 
  index = 0, 
  delay = 0,
  staggerDelay = 30,
  immediate = false 
} = {}) => {
  const springProps = useSpring({
    from: { 
      opacity: 0, 
      transform: 'translateY(20px)' 
    },
    to: { 
      opacity: 1, 
      transform: 'translateY(0px)' 
    },
    config: { 
      tension: 280, 
      friction: 24 
    },
    delay: delay + (index * staggerDelay),
    immediate
  });

  return springProps;
};

// Animación de expansión para modales y popups
export const useExpandAnimation = (isOpen) => {
  const springProps = useSpring({
    from: { 
      opacity: 0, 
      transform: 'scale(0.95)' 
    },
    to: { 
      opacity: isOpen ? 1 : 0, 
      transform: isOpen ? 'scale(1)' : 'scale(0.95)' 
    },
    config: { 
      tension: 300, 
      friction: 20 
    }
  });

  return springProps;
};

// Animación de fade para overlays
export const useFadeAnimation = (isVisible, duration = 200) => {
  const springProps = useSpring({
    opacity: isVisible ? 1 : 0,
    config: { 
      duration 
    }
  });

  return springProps;
};

export default useFlightAnimation;
