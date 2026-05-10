import { memo } from 'react';
import { User, Zap, Utensils, ArrowRight } from 'lucide-react';
import styles from '../PurchaseTicketForm.module.css';

export const BAGGAGE_OPTIONS = [
  { id: 'none',     icon: '🎒', label: 'Solo equipaje de mano',   sublabel: '1 bolso + 1 maleta cabina',  price: 0  },
  { id: 'hold23',   icon: '🧳', label: '1 maleta facturada',       sublabel: '23 kg',                      price: 35 },
  { id: 'hold23x2', icon: '🧳', label: '2 maletas facturadas',     sublabel: '2 × 23 kg',                  price: 65 },
  { id: 'hold32',   icon: '🧳', label: 'Maleta extra-grande',      sublabel: '32 kg',                      price: 55 },
];

export const ADDON_OPTIONS = [
  { id: 'priorityBoarding', icon: '⚡', label: 'Embarque prioritario',    sublabel: 'Accede antes al avión',          price: 12 },
  { id: 'insurance',        icon: '🛡️', label: 'Seguro de viaje',         sublabel: 'Cancelación + asistencia médica', price: 28 },
  { id: 'loungeAccess',     icon: '✨', label: 'Sala VIP del aeropuerto', sublabel: 'Lounge + bebidas incluidas',      price: 45 },
];

export const MEAL_OPTIONS = [
  { value: 'none',        label: 'Sin preferencia (comida estándar)' },
  { value: 'vegetarian',  label: 'Vegetariano'                       },
  { value: 'vegan',       label: 'Vegano'                            },
  { value: 'glutenfree',  label: 'Sin gluten'                        },
  { value: 'halal',       label: 'Halal'                             },
  { value: 'lowsodium',   label: 'Bajo en sodio'                     },
  { value: 'diabetic',    label: 'Diabético / bajo en azúcar'        },
];

const DOCUMENT_TYPES = ['DNI', 'Pasaporte', 'NIE', 'Otro'];

const PassengerInfoStep = memo(({
  formData,
  onChange,
  onExtrasChange,
  onBaggageChange,
  onSubmit,
  onCancel,
  isClassLocked = false,
  basePrice = 0,
  extrasCost = 0,
}) => (
  <form onSubmit={onSubmit}>

    {/* ── Datos del pasajero ── */}
    <div className={styles.formSection}>
      <h3 className={styles.sectionTitle}>
        <User size={16} /> Datos del pasajero
      </h3>

      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label htmlFor="firstName">Nombre *</label>
          <input
            type="text" id="firstName" name="firstName"
            value={formData.firstName} onChange={onChange}
            placeholder="Juan" required
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="lastName">Apellidos *</label>
          <input
            type="text" id="lastName" name="lastName"
            value={formData.lastName} onChange={onChange}
            placeholder="García López" required
          />
        </div>
      </div>

      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label htmlFor="documentType">Tipo de documento</label>
          <select id="documentType" name="documentType" value={formData.documentType} onChange={onChange}>
            {DOCUMENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="documentNumber">Número *</label>
          <input
            type="text" id="documentNumber" name="documentNumber"
            value={formData.documentNumber} onChange={onChange}
            placeholder="12345678A" required
          />
        </div>
      </div>

      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label htmlFor="birthDate">Fecha de nacimiento</label>
          <input type="date" id="birthDate" name="birthDate" value={formData.birthDate} onChange={onChange} />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="nationality">Nacionalidad</label>
          <input
            type="text" id="nationality" name="nationality"
            value={formData.nationality} onChange={onChange}
            placeholder="Española"
          />
        </div>
      </div>

      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label htmlFor="email">Email de contacto *</label>
          <input
            type="email" id="email" name="email"
            value={formData.email} onChange={onChange}
            placeholder="correo@ejemplo.com" required
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="phone">Teléfono</label>
          <input
            type="tel" id="phone" name="phone"
            value={formData.phone} onChange={onChange}
            placeholder="+34 600 000 000"
          />
        </div>
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="ticketClass">Clase de vuelo</label>
        <select id="ticketClass" name="ticketClass" value={formData.ticketClass} onChange={onChange} disabled={isClassLocked}>
          <option value="economy">Turista (Economy)</option>
          <option value="business">Business Class</option>
          <option value="first">Primera Clase</option>
        </select>
        {isClassLocked && <small>Clase fijada desde la oferta seleccionada</small>}
      </div>
    </div>

    {/* ── Equipaje ── */}
    <div className={styles.formSection}>
      <h3 className={styles.sectionTitle}>
        🧳 Equipaje
      </h3>
      <div className={styles.baggageGrid}>
        {BAGGAGE_OPTIONS.map(opt => (
          <button
            key={opt.id}
            type="button"
            className={`${styles.baggageCard} ${formData.baggage === opt.id ? styles.baggageCardSelected : ''}`}
            onClick={() => onBaggageChange(opt.id)}
          >
            <span className={styles.baggageCardIcon}>{opt.icon}</span>
            <span className={styles.baggageCardLabel}>{opt.label}</span>
            <span className={styles.baggageCardSub}>{opt.sublabel}</span>
            <span className={styles.baggageCardPrice}>
              {opt.price === 0 ? 'Incluido' : `+${opt.price} €`}
            </span>
            {formData.baggage === opt.id && <span className={styles.baggageCheck}>✓</span>}
          </button>
        ))}
      </div>
    </div>

    {/* ── Servicios adicionales ── */}
    <div className={styles.formSection}>
      <h3 className={styles.sectionTitle}>
        <Zap size={16} /> Servicios adicionales
      </h3>
      <div className={styles.extrasGrid}>
        {ADDON_OPTIONS.map(opt => (
          <button
            key={opt.id}
            type="button"
            className={`${styles.extraCard} ${formData.extras[opt.id] ? styles.extraCardSelected : ''}`}
            onClick={() => onExtrasChange(opt.id)}
          >
            <span className={styles.extraIcon}>{opt.icon}</span>
            <span className={styles.extraInfo}>
              <span className={styles.extraLabel}>{opt.label}</span>
              <span className={styles.extraSub}>{opt.sublabel}</span>
            </span>
            <span className={styles.extraPrice}>+{opt.price} €</span>
            <span className={`${styles.extraCheckbox} ${formData.extras[opt.id] ? styles.extraCheckboxChecked : ''}`}>
              {formData.extras[opt.id] && '✓'}
            </span>
          </button>
        ))}
      </div>
    </div>

    {/* ── Preferencia de comida ── */}
    <div className={styles.formSection}>
      <h3 className={styles.sectionTitle}>
        <Utensils size={16} /> Preferencia de comida <span className={styles.optionalTag}>opcional</span>
      </h3>
      <div className={styles.formGroup}>
        <select name="meal" value={formData.meal} onChange={onChange}>
          {MEAL_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
    </div>

    {/* ── Total corriente ── */}
    <div className={styles.priceSummaryBar}>
      <div>
        <span className={styles.priceSummaryLabel}>Total estimado</span>
        {extrasCost > 0 && (
          <span className={styles.priceSummaryExtras}> (+{extrasCost} € extras)</span>
        )}
      </div>
      <span className={styles.priceSummaryAmount}>{(basePrice + extrasCost).toFixed(0)} €</span>
    </div>

    <div className={styles.formActions}>
      <button type="button" className={styles.btnCancel} onClick={onCancel}>Cancelar</button>
      <button type="submit" className={styles.btnContinue}>
        Elegir asiento <ArrowRight size={18} />
      </button>
    </div>
  </form>
));

PassengerInfoStep.displayName = 'PassengerInfoStep';
export default PassengerInfoStep;
