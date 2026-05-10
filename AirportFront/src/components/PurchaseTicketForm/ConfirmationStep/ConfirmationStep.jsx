import { memo } from 'react';
import { User, CreditCard, ArrowLeft } from 'lucide-react';
import styles from '../PurchaseTicketForm.module.css';
import { BAGGAGE_OPTIONS, ADDON_OPTIONS, MEAL_OPTIONS } from '../PassengerInfoStep/PassengerInfoStep';

const getClassLabel = (c) => ({ economy: 'Turista', business: 'Business', first: 'Primera Clase' }[c] || 'Turista');

const ConfirmationStep = memo(({ formData, flight, loading, price, basePrice, onBack, onSubmit }) => {
  const basePriceNum  = parseFloat(basePrice)  || 0;
  const totalPriceNum = parseFloat(price)       || basePriceNum;
  const extrasCost    = totalPriceNum - basePriceNum;

  const baggageOpt = BAGGAGE_OPTIONS.find(o => o.id === formData.baggage);
  const mealOpt    = MEAL_OPTIONS.find(o => o.value === formData.meal);
  const activeAddons = ADDON_OPTIONS.filter(o => formData.extras[o.id]);

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

      {/* ── Pago (simulado) ── */}
      <div className={styles.paymentSection}>
        <h4 className={styles.confirmSectionTitle}><CreditCard size={14} /> Pago con tarjeta</h4>

        <div className={styles.cardVisual}>
          <div className={styles.cardChip} />
          <div className={styles.cardNumber}>•••• •••• •••• ••••</div>
          <div className={styles.cardMeta}>
            <span className={styles.cardHolder}>TITULAR DE LA TARJETA</span>
            <span className={styles.cardExpiry}>MM / AA</span>
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label>Número de tarjeta</label>
            <input type="text" placeholder="1234 5678 9012 3456" maxLength={19} />
          </div>
          <div className={styles.formGroup}>
            <label>Nombre en la tarjeta</label>
            <input
              type="text"
              placeholder={`${formData.firstName} ${formData.lastName}`.trim() || 'Juan García'}
            />
          </div>
        </div>
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label>Caducidad</label>
            <input type="text" placeholder="MM / AA" maxLength={7} />
          </div>
          <div className={styles.formGroup}>
            <label>CVV</label>
            <input type="text" placeholder="•••" maxLength={4} />
          </div>
        </div>
        <p className={styles.paymentNote}>
          🔒 Pago seguro · Todos los datos están protegidos con cifrado SSL
        </p>
      </div>

      <form onSubmit={onSubmit}>
        <div className={styles.formActions}>
          <button type="button" className={styles.btnBack} onClick={onBack} disabled={loading}>
            <ArrowLeft size={18} /> Volver
          </button>
          <button type="submit" className={styles.btnSubmit} disabled={loading}>
            {loading ? 'Procesando...' : `Pagar ${totalPriceNum.toFixed(0)} €`}
          </button>
        </div>
      </form>
    </div>
  );
});

ConfirmationStep.displayName = 'ConfirmationStep';
export default ConfirmationStep;
