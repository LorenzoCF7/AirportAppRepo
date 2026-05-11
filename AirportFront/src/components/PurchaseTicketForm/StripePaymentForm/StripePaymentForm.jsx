import { useState, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import { CreditCard } from 'lucide-react';
import { paymentService } from '../../../services/paymentService';
import styles from '../PurchaseTicketForm.module.css';

const StripePaymentForm = forwardRef(({ amount, currency = 'EUR', userId, ticketId, onPaymentSuccess, onPaymentError, isProcessing }, ref) => {
  const [stripe, setStripe] = useState(null);
  const [cardElement, setCardElement] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [cardBrand, setCardBrand] = useState('');
  const [cardLastFour, setCardLastFour] = useState('');
  const [errors, setErrors] = useState({});

  // Exponer cardElement y stripe mediante ref
  useImperativeHandle(ref, () => ({
    getCardElement: () => cardElement,
    getStripe: () => stripe,
    isPaymentReady: () => isReady
  }), [cardElement, stripe, isReady]);

  // Inicializar Stripe
  useEffect(() => {
    const initStripe = async () => {
      try {
        const stripeInstance = await paymentService.initializeStripe();
        setStripe(stripeInstance);
        
        // Crear elementos de Stripe (modo desarrollo: menos validaciones)
        const elements = stripeInstance.elements({
          // Modo de prueba: permitir más libertad
          appearance: {
            theme: 'stripe',
          }
        });
        
        const card = elements.create('card', {
          style: {
            base: {
              fontSize: '16px',
              color: '#424770',
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
            },
            invalid: {
              color: '#9ecaed'
            }
          },
          // Modo prueba: validación más laxa
          hidePostalCode: import.meta.env.DEV
        });

        // Montar el elemento en el DOM
        const cardContainer = document.getElementById('stripe-card-element');
        if (cardContainer) {
          card.mount(cardContainer);
          setCardElement(card);
          setIsReady(true);

          // Escuchar cambios en el card element
          card.on('change', (event) => {
            if (event.error) {
              // En modo desarrollo, solo advertencia
              if (import.meta.env.DEV) {
                console.warn('⚠️ Aviso de validación (modo desarrollo):', event.error.message);
              } else {
                setErrors({ card: event.error.message });
              }
            } else {
              setErrors({});
              // Extraer información de la tarjeta
              setCardBrand(event.brand || '');
              setCardLastFour(event.last4 || '');
            }
          });

          console.log('✅ Stripe inicializado en modo ' + (import.meta.env.DEV ? 'DESARROLLO' : 'PRODUCCIÓN'));
        }
      } catch (error) {
        console.error('❌ Error inicializando Stripe:', error);
        onPaymentError('Error inicializando sistema de pago');
      }
    };

    initStripe();

    return () => {
      if (cardElement) cardElement.destroy();
    };
  }, [onPaymentError]);

  const handleCardholderNameChange = useCallback((e) => {
    // Validar nombre
    const name = e.target.value;
    
    // En modo desarrollo, aceptar casi cualquier cosa
    if (import.meta.env.DEV) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.cardholderName;
        return newErrors;
      });
      return;
    }
    
    // En producción, validación estricta
    if (name && !name.match(/^[a-zA-Z\s]{2,}$/)) {
      setErrors(prev => ({ ...prev, cardholderName: 'Nombre inválido' }));
    } else {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.cardholderName;
        return newErrors;
      });
    }
  }, []);

  return (
    <div className={styles.paymentSection}>
      <h4 className={styles.confirmSectionTitle}>
        <CreditCard size={14} /> Pago seguro con Stripe
      </h4>

      {/* Contenedor para Stripe Card Element */}
      <div className={styles.stripeContainer} data-stripe-card>
        <div id="stripe-card-element" />
        {errors.card && (
          <div className={styles.errorMessage} style={{ marginTop: '8px', color: '#e74c3c' }}>
            {errors.card}
          </div>
        )}
      </div>

      {/* Nombre del titular */}
      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label htmlFor="cardHolder">Nombre en la tarjeta</label>
          <input
            id="cardHolder"
            type="text"
            name="cardHolder"
            placeholder="Juan García"
            onChange={handleCardholderNameChange}
            disabled={isProcessing}
            className={errors.cardholderName ? styles.inputError : ''}
          />
          {errors.cardholderName && (
            <span className={styles.errorMessage}>{errors.cardholderName}</span>
          )}
        </div>
      </div>

      {/* Información adicional */}
      <div className={styles.paymentNote}>
        🔒 Pago seguro · Todos los datos están protegidos con cifrado SSL por Stripe
      </div>

      {/* Estado de la tarjeta */}
      {cardBrand && (
        <div className={styles.cardInfo}>
          <span>Tarjeta: {cardBrand.toUpperCase()}</span>
          {cardLastFour && <span>Últimos 4 dígitos: ••••{cardLastFour}</span>}
        </div>
      )}

      {/* Información de depuración */}
      {import.meta.env.DEV && (
        <div style={{ fontSize: '12px', color: '#999', marginTop: '10px' }}>
          <p>💳 Monto: {amount} {currency}</p>
          <p>👤 Usuario ID: {userId}</p>
          <p>🎫 Ticket ID: {ticketId}</p>
          <p>🔐 Stripe: {isReady ? '✅ Listo' : '⏳ Cargando...'}</p>
        </div>
      )}
    </div>
  );
});

StripePaymentForm.displayName = 'StripePaymentForm';

export default StripePaymentForm;
