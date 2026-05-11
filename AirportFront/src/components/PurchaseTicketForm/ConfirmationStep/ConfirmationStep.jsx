import { memo, useState, useRef } from 'react';
import { User, CreditCard, ArrowLeft } from 'lucide-react';
import styles from '../PurchaseTicketForm.module.css';
import { BAGGAGE_OPTIONS, ADDON_OPTIONS, MEAL_OPTIONS } from '../PassengerInfoStep/PassengerInfoStep';
import StripePaymentForm from '../StripePaymentForm/StripePaymentForm';
import { paymentService } from '../../../services/paymentService';

const getClassLabel = (c) => ({ economy: 'Turista', business: 'Business', first: 'Primera Clase' }[c] || 'Turista');

const ConfirmationStep = memo(({ formData, flight, loading, price, basePrice, onBack, onSubmit, userId }) => {
  const [paymentError, setPaymentError] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const stripePaymentRef = useRef(null);

  const basePriceNum  = parseFloat(basePrice)  || 0;
  const totalPriceNum = parseFloat(price)       || basePriceNum;
  const extrasCost    = totalPriceNum - basePriceNum;

  const baggageOpt = BAGGAGE_OPTIONS.find(o => o.id === formData.baggage);
  const mealOpt    = MEAL_OPTIONS.find(o => o.value === formData.meal);
  const activeAddons = ADDON_OPTIONS.filter(o => formData.extras[o.id]);

  const handlePaymentSuccess = () => {
    setPaymentError('');
  };

  const handlePaymentError = (error) => {
    setPaymentError(error);
  };

  const handleSubmitWithStripe = async (e) => {
    e.preventDefault();
    setIsProcessingPayment(true);
    setPaymentError('');

    try {
      const paymentRef = stripePaymentRef.current;

      // Demo mode (no Stripe key configured) — skip payment processing
      if (!paymentRef || paymentRef.isDemoMode()) {
        onSubmit(e);
        return;
      }

      if (!paymentRef.isPaymentReady()) {
        throw new Error('El sistema de pago no está listo. Por favor, recarga la página.');
      }

      const { clientSecret, paymentIntentId } = await paymentService.createPaymentIntent(
        userId, `ticket-${Date.now()}`, totalPriceNum, 'EUR'
      );

      const cardElement  = paymentRef.getCardElement();
      const paymentResult = await paymentService.processPayment(clientSecret, cardElement);

      if (paymentResult.success) {
        await paymentService.confirmPayment(paymentIntentId);
        onSubmit(e);
      } else {
        setPaymentError('El pago requiere autenticación adicional');
      }
    } catch (error) {
      console.error('❌ Error en pago:', error);
      setPaymentError(error.message || 'Error procesando el pago');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  return (
    <div className={styles.confirmationStep}>

      {/* ── Datos del pasajero ── */}
      <div className={styles.confirmSection}>
        <h4 className={styles.confirmSectionTitle}><User size={14} /> Pasajero</h4>
        <div className={styles.confirmGrid}>
          <div className={styles.confirmItem}>
            <span className={styles.confirmLabel}>Nombre completo</span>
            <span className={styles.confirmValue}>{formData.firstName} {formData.lastName}</span>
          </div>
          <div className={styles.confirmItem}>
            <span className={styles.confirmLabel}>Documento</span>
            <span className={styles.confirmValue}>{formData.documentType}: {formData.documentNumber}</span>
          </div>
          {formData.email && (
            <div className={styles.confirmItem}>
              <span className={styles.confirmLabel}>Email</span>
              <span className={styles.confirmValue}>{formData.email}</span>
            </div>
          )}
          {formData.phone && (
            <div className={styles.confirmItem}>
              <span className={styles.confirmLabel}>Teléfono</span>
              <span className={styles.confirmValue}>{formData.phone}</span>
            </div>
          )}
          <div className={styles.confirmItem}>
            <span className={styles.confirmLabel}>Asiento</span>
            <span className={styles.confirmValue}>{formData.seatNumber}</span>
          </div>
          <div className={styles.confirmItem}>
            <span className={styles.confirmLabel}>Clase</span>
            <span className={styles.confirmValue}>{getClassLabel(formData.ticketClass)}</span>
          </div>
          {formData.meal !== 'none' && (
            <div className={styles.confirmItem}>
              <span className={styles.confirmLabel}>Comida</span>
              <span className={styles.confirmValue}>{mealOpt?.label}</span>
            </div>
          )}
          {formData.baggage !== 'none' && (
            <div className={styles.confirmItem}>
              <span className={styles.confirmLabel}>Equipaje</span>
              <span className={styles.confirmValue}>{baggageOpt?.label} ({baggageOpt?.sublabel})</span>
            </div>
          )}
          {activeAddons.length > 0 && (
            <div className={styles.confirmItem} style={{ gridColumn: '1 / -1' }}>
              <span className={styles.confirmLabel}>Extras</span>
              <span className={styles.confirmValue}>{activeAddons.map(a => a.label).join(', ')}</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Desglose de precio ── */}
      <div className={styles.confirmSection}>
        <h4 className={styles.confirmSectionTitle}><CreditCard size={14} /> Resumen del precio</h4>
        <div className={styles.priceBreakdown}>
          <div className={styles.priceRow}>
            <span>Tarifa base · {getClassLabel(formData.ticketClass)}</span>
            <span>{basePriceNum.toFixed(0)} €</span>
          </div>
          {baggageOpt && baggageOpt.price > 0 && (
            <div className={styles.priceRow}>
              <span>{baggageOpt.label}</span>
              <span>+{baggageOpt.price} €</span>
            </div>
          )}
          {activeAddons.map(addon => (
            <div key={addon.id} className={styles.priceRow}>
              <span>{addon.label}</span>
              <span>+{addon.price} €</span>
            </div>
          ))}
          <div className={styles.priceDivider} />
          <div className={styles.priceTotalRow}>
            <span>Total a pagar</span>
            <span className={styles.priceTotalAmount}>{totalPriceNum.toFixed(0)} €</span>
          </div>
        </div>
      </div>

      {/* ── Pago con Stripe ── */}
      <StripePaymentForm
        ref={stripePaymentRef}
        amount={totalPriceNum}
        currency="EUR"
        userId={userId}
        ticketId={`ticket-${Date.now()}`}
        onPaymentSuccess={handlePaymentSuccess}
        onPaymentError={handlePaymentError}
        isProcessing={isProcessingPayment}
      />

      {paymentError && (
        <div className={styles.errorMessage} style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#fee', borderRadius: '4px', color: '#c33' }}>
          ❌ {paymentError}
        </div>
      )}

      <form onSubmit={handleSubmitWithStripe}>
        <div className={styles.formActions}>
          <button type="button" className={styles.btnBack} onClick={onBack} disabled={loading || isProcessingPayment}>
            <ArrowLeft size={18} /> Volver
          </button>
          <button type="submit" className={styles.btnSubmit} disabled={loading || isProcessingPayment}>
            {isProcessingPayment ? '⏳ Procesando pago...' : (loading ? 'Finalizando...' : `Pagar ${totalPriceNum.toFixed(0)} €`)}
          </button>
        </div>
      </form>
    </div>
  );
});

ConfirmationStep.displayName = 'ConfirmationStep';
export default ConfirmationStep;
