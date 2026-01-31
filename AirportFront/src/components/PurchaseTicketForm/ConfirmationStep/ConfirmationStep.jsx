import { memo } from 'react';
import { User, Plane, CreditCard, ArrowLeft } from 'lucide-react';
import styles from '../PurchaseTicketForm.module.css';

// Obtiene la etiqueta de clase legible
const getClassLabel = (ticketClass) => {
  const labels = {
    economy: 'Turista',
    business: 'Business',
    first: 'Primera Clase'
  };
  return labels[ticketClass] || 'Turista';
};

// Paso 3: Confirmación final de compra
const ConfirmationStep = memo(({
  formData,
  flight,
  loading,
  price,
  onBack,
  onSubmit
}) => (
  <div className={styles.confirmationStep}>
    {/* Resumen de la compra */}
    <div className={styles.confirmationSummary}>
      <h3>Resumen de tu compra</h3>
      
      {/* Datos del pasajero */}
      <div className={styles.summarySection}>
        <h4><User size={18} /> Pasajero</h4>
        <p><strong>Nombre:</strong> {formData.passengerName}</p>
        <p><strong>Documento:</strong> {formData.passengerDocument}</p>
      </div>

      {/* Datos del vuelo */}
      <div className={styles.summarySection}>
        <h4><Plane size={18} /> Vuelo</h4>
        <p><strong>Número:</strong> {flight.flight?.iata || flight.flightNumber}</p>
        <p><strong>Clase:</strong> {getClassLabel(formData.ticketClass)}</p>
        <p><strong>Asiento:</strong> {formData.seatNumber}</p>
      </div>

      {/* Precio total */}
      <div className={styles.summarySection}>
        <h4><CreditCard size={18} /> Precio</h4>
        <p className={styles.priceTotal}>{price} EUR</p>
      </div>
    </div>

    {/* Formulario de confirmación */}
    <form onSubmit={onSubmit}>
      <div className={styles.formActions}>
        <button 
          type="button" 
          className={styles.btnBack}
          onClick={onBack}
          disabled={loading}
        >
          <ArrowLeft size={18} /> Volver
        </button>
        <button 
          type="submit" 
          className={styles.btnSubmit}
          disabled={loading}
        >
          {loading ? 'Procesando...' : 'Confirmar Compra'}
        </button>
      </div>
    </form>
  </div>
));

ConfirmationStep.displayName = 'ConfirmationStep';

export default ConfirmationStep;
