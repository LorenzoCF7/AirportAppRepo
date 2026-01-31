import { memo } from 'react';
import styles from '../PurchaseTicketForm.module.css';

const STEPS = [
  { id: 1, label: '1. Datos' },
  { id: 2, label: '2. Asiento' },
  { id: 3, label: '3. Confirmar' }
];

// Indicador de pasos del formulario multi-step
const StepIndicator = memo(({ currentStep, steps = STEPS }) => (
  <div className={styles.stepIndicator}>
    {steps.map(({ id, label }) => (
      <div 
        key={id}
        className={`${styles.step} ${currentStep >= id ? styles.active : ''}`}
      >
        {label}
      </div>
    ))}
  </div>
));

StepIndicator.displayName = 'StepIndicator';

export default StepIndicator;
