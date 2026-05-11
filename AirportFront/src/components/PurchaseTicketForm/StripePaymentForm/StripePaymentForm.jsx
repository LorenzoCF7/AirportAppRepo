import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { CreditCard, Lock } from 'lucide-react';
import { paymentService } from '../../../services/paymentService';
import styles from '../PurchaseTicketForm.module.css';

const StripePaymentForm = forwardRef(({ amount, currency = 'EUR', isProcessing }, ref) => {
  const [stripe, setStripe]       = useState(null);
  const [cardElement, setCardElement] = useState(null);
  const [isReady, setIsReady]     = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);

  useImperativeHandle(ref, () => ({
    getCardElement:   () => cardElement,
    getStripe:        () => stripe,
    isPaymentReady:   () => isReady,
    isDemoMode:       () => isDemoMode,
  }), [cardElement, stripe, isReady, isDemoMode]);

  useEffect(() => {
    const initStripe = async () => {
      try {
        if (!paymentService.isStripeAvailable()) throw new Error('no-key');

        const stripeInstance = await paymentService.initializeStripe();
        setStripe(stripeInstance);

        const elements = stripeInstance.elements({ appearance: { theme: 'stripe' } });
        const card = elements.create('card', {
          style: {
            base: { fontSize: '16px', color: '#424770', fontFamily: 'inherit' },
            invalid: { color: '#e74c3c' }
          },
          hidePostalCode: true,
        });

        const container = document.getElementById('stripe-card-element');
        if (container) {
          card.mount(container);
          setCardElement(card);
          setIsReady(true);
        }
      } catch {
        // Stripe not configured — use demo mode
        setIsDemoMode(true);
        setIsReady(true);
      }
    };

    initStripe();
    return () => { if (cardElement) cardElement.destroy(); };
  }, []);

  if (isDemoMode) {
    return (
      <div className={styles.paymentSection}>
        <h4 className={styles.confirmSectionTitle}>
          <CreditCard size={14} /> Datos de pago
        </h4>

        <div className={styles.demoCardFields}>
          <div className={styles.demoField}>
            <label>Número de tarjeta</label>
            <input type="text" placeholder="1234 5678 9012 3456" maxLength={19} disabled={isProcessing} className={styles.demoInput} />
          </div>
          <div className={styles.demoFieldRow}>
            <div className={styles.demoField}>
              <label>Caducidad</label>
              <input type="text" placeholder="MM/AA" maxLength={5} disabled={isProcessing} className={styles.demoInput} />
            </div>
            <div className={styles.demoField}>
              <label>CVC</label>
              <input type="text" placeholder="123" maxLength={3} disabled={isProcessing} className={styles.demoInput} />
            </div>
          </div>
          <div className={styles.demoField}>
            <label>Nombre en la tarjeta</label>
            <input type="text" name="cardHolder" placeholder="Juan García" disabled={isProcessing} className={styles.demoInput} />
          </div>
        </div>

        <div className={styles.paymentNote}>
          <Lock size={12} /> Pago seguro · Todos los datos están protegidos con cifrado SSL
        </div>
      </div>
    );
  }

  return (
    <div className={styles.paymentSection}>
      <h4 className={styles.confirmSectionTitle}>
        <CreditCard size={14} /> Pago seguro con Stripe
      </h4>

      <div className={styles.stripeContainer}>
        <div id="stripe-card-element" />
      </div>

      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label htmlFor="cardHolder">Nombre en la tarjeta</label>
          <input id="cardHolder" type="text" name="cardHolder" placeholder="Juan García" disabled={isProcessing} />
        </div>
      </div>

      <div className={styles.paymentNote}>
        <Lock size={12} /> Pago seguro · Todos los datos están protegidos con cifrado SSL por Stripe
      </div>
    </div>
  );
});

StripePaymentForm.displayName = 'StripePaymentForm';

export default StripePaymentForm;
