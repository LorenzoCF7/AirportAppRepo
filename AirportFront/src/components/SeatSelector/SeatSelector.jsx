import styles from './SeatSelector.module.css';

const SeatSelector = ({ selectedSeat, onSeatSelect, occupiedSeats = [] }) => {
  const rows = 30;
  const seatsPerRow = ['A', 'B', 'C', '', 'D', 'E', 'F']; // '' = pasillo

  const isSeatOccupied = (seat) => {
    return occupiedSeats.includes(seat);
  };

  const isSeatSelected = (seat) => {
    return selectedSeat === seat;
  };

  const handleSeatClick = (seat) => {
    if (!isSeatOccupied(seat)) {
      onSeatSelect(seat);
    }
  };

  const getSeatClass = (seat) => {
    if (isSeatOccupied(seat)) return styles.seatOccupied;
    if (isSeatSelected(seat)) return styles.seatSelected;
    return styles.seatAvailable;
  };

  return (
    <div className={styles.seatSelector}>
      <div className={styles.seatSelectorHeader}>
        <h3>Selecciona tu asiento</h3>
        <div className={styles.seatLegend}>
          <div className={styles.legendItem}>
            <div className={`${styles.legendSeat} ${styles.seatAvailable}`}></div>
            <span>Disponible</span>
          </div>
          <div className={styles.legendItem}>
            <div className={`${styles.legendSeat} ${styles.seatSelected}`}></div>
            <span>Seleccionado</span>
          </div>
          <div className={styles.legendItem}>
            <div className={`${styles.legendSeat} ${styles.seatOccupied}`}></div>
            <span>Ocupado</span>
          </div>
        </div>
      </div>

      <div className={styles.planeDiagram}>
        {/* Cabecera del avión */}
        <div className={styles.planeFront}>
          <svg viewBox="0 0 100 40" className={styles.planeNose}>
            <path d="M 0 40 Q 50 0 100 40" fill="rgba(255, 255, 255, 0.1)" />
          </svg>
        </div>

        {/* Etiquetas de columnas */}
        <div className={`${styles.seatRow} ${styles.seatRowHeader}`}>
          <div className={styles.rowNumber}></div>
          {seatsPerRow.map((letter, index) => (
            <div key={index} className={letter === '' ? styles.seatSpacer : styles.seatLabel}>
              {letter}
            </div>
          ))}
        </div>

        {/* Filas de asientos */}
        <div className={styles.seatsContainer}>
          {Array.from({ length: rows }, (_, rowIndex) => {
            const rowNumber = rowIndex + 1;
            return (
              <div key={rowNumber} className={styles.seatRow}>
                <div className={styles.rowNumber}>{rowNumber}</div>
                {seatsPerRow.map((letter, seatIndex) => {
                  if (letter === '') {
                    return <div key={seatIndex} className={styles.seatSpacer}></div>;
                  }
                  
                  const seatCode = `${rowNumber}${letter}`;
                  const seatClass = getSeatClass(seatCode);
                  
                  return (
                    <button
                      key={seatIndex}
                      className={`${styles.seat} ${seatClass}`}
                      onClick={() => handleSeatClick(seatCode)}
                      disabled={isSeatOccupied(seatCode)}
                      title={seatCode}
                    >
                      <span className={styles.seatLetter}>{letter}</span>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Cola del avión */}
        <div className={styles.planeRear}>
          <div className={styles.planeTail}></div>
        </div>
      </div>

      {/* Información del asiento seleccionado */}
      {selectedSeat && (
        <div className={styles.selectedSeatInfo}>
          <div className={styles.selectedSeatBadge}>
            <span className={styles.badgeLabel}>Asiento seleccionado:</span>
            <span className={styles.badgeSeat}>{selectedSeat}</span>
          </div>
          <p className={styles.seatPositionInfo}>
            {selectedSeat.includes('A') || selectedSeat.includes('F') 
              ? '🪟 Ventana' 
              : selectedSeat.includes('B') || selectedSeat.includes('E')
              ? '↔️ Centro'
              : '🚶 Pasillo'}
          </p>
        </div>
      )}
    </div>
  );
};

export default SeatSelector;
