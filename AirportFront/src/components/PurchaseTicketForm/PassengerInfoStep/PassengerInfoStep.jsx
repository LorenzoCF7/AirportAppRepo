import { memo } from 'react';
import { User, CreditCard, ArrowRight } from 'lucide-react';
import styles from '../PurchaseTicketForm.module.css';

// Paso 1: Información del pasajero y detalles del billete
const PassengerInfoStep = memo(({
  formData,
  onChange,
  onSubmit,
  onCancel,
  isClassLocked = false,
  isPriceLocked = false,
  pricePlaceholder = 'Se calculará automáticamente'
}) => (
  <form onSubmit={onSubmit}>
    {/* Sección: Datos del pasajero */}
    <div className={styles.formSection}>
      <h3><User size={20} /> Información del Pasajero</h3>
      
      <div className={styles.formGroup}>
        <label htmlFor="passengerName">Nombre Completo *</label>
        <input
          type="text"
          id="passengerName"
          name="passengerName"
          value={formData.passengerName}
          onChange={onChange}
          placeholder="Ej: Juan Pérez García"
          required
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="passengerDocument">Documento de Identidad *</label>
        <input
          type="text"
          id="passengerDocument"
          name="passengerDocument"
          value={formData.passengerDocument}
          onChange={onChange}
          placeholder="DNI, Pasaporte, etc."
          required
        />
      </div>
    </div>

    {/* Sección: Detalles del billete */}
    <div className={styles.formSection}>
      <h3><CreditCard size={20} /> Detalles del Billete</h3>
      
      <div className={styles.formGroup}>
        <label htmlFor="ticketClass">Clase</label>
        <select
          id="ticketClass"
          name="ticketClass"
          value={formData.ticketClass}
          onChange={onChange}
          disabled={isClassLocked}
        >
          <option value="economy">Turista</option>
          <option value="business">Business</option>
          <option value="first">Primera Clase</option>
        </select>
        {isClassLocked && (
          <small>Clase seleccionada desde la oferta</small>
        )}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="price">Precio (EUR)</label>
        <input
          type="number"
          id="price"
          name="price"
          value={formData.price}
          onChange={onChange}
          placeholder={pricePlaceholder}
          step="0.01"
          min="0"
          disabled={isPriceLocked}
        />
        {isPriceLocked ? (
          <small>Precio fijo de la oferta comercial</small>
        ) : (
          <small>Se calculará basado en la clase si se deja vacío</small>
        )}
      </div>
    </div>

    {/* Botones de acción */}
    <div className={styles.formActions}>
      <button 
        type="button" 
        className={styles.btnCancel}
        onClick={onCancel}
      >
        Cancelar
      </button>
      <button 
        type="submit" 
        className={styles.btnContinue}
      >
        Continuar <ArrowRight size={18} />
      </button>
    </div>
  </form>
));

PassengerInfoStep.displayName = 'PassengerInfoStep';

export default PassengerInfoStep;
