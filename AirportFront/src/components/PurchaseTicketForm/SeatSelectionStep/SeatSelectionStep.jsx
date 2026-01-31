import { memo } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import SeatSelector from '../../SeatSelector/SeatSelector';
import styles from '../PurchaseTicketForm.module.css';

// Paso 2: Selección de asiento
const SeatSelectionStep = memo(({
  selectedSeat,
  onSeatSelect,
  onBack,
  onContinue,
  occupiedSeats = []
}) => (
  <div className={styles.seatSelectionStep}>
    <SeatSelector
      selectedSeat={selectedSeat}
      onSeatSelect={onSeatSelect}
      occupiedSeats={occupiedSeats}
    />

    <div className={styles.formActions}>
      <button 
        type="button" 
        className={styles.btnBack}
        onClick={onBack}
      >
        <ArrowLeft size={18} /> Volver
      </button>
      <button 
        type="button" 
        className={styles.btnContinue}
        onClick={onContinue}
        disabled={!selectedSeat}
      >
        Continuar <ArrowRight size={18} />
      </button>
    </div>
  </div>
));

SeatSelectionStep.displayName = 'SeatSelectionStep';

export default SeatSelectionStep;
