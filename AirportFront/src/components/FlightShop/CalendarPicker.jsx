import { useState } from 'react';
import styles from './CalendarPicker.module.css';

const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const DAYS_SHORT = ['Lu','Ma','Mi','Ju','Vi','Sá','Do'];

const toLocal = (dateStr) => {
  if (!dateStr) return null;
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
};

const CalendarPicker = ({ value, onChange, availableDates = [], minDate, onClose }) => {
  const todayLocal = new Date();
  todayLocal.setHours(0, 0, 0, 0);

  const initial = toLocal(value) || todayLocal;
  const [viewYear, setViewYear] = useState(initial.getFullYear());
  const [viewMonth, setViewMonth] = useState(initial.getMonth());

  const availableSet = new Set(availableDates);
  const minLocal = toLocal(minDate) || todayLocal;

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const fmtDate = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  // Build grid
  const firstOfMonth = new Date(viewYear, viewMonth, 1);
  const lastOfMonth  = new Date(viewYear, viewMonth + 1, 0);
  const startDow = (firstOfMonth.getDay() + 6) % 7; // Mon = 0

  const cells = [];

  for (let i = startDow - 1; i >= 0; i--) {
    cells.push({ date: new Date(viewYear, viewMonth, -i), current: false });
  }
  for (let i = 1; i <= lastOfMonth.getDate(); i++) {
    cells.push({ date: new Date(viewYear, viewMonth, i), current: true });
  }
  const rem = 7 - (cells.length % 7);
  if (rem < 7) {
    for (let i = 1; i <= rem; i++) {
      cells.push({ date: new Date(viewYear, viewMonth + 1, i), current: false });
    }
  }

  const todayStr = fmtDate(todayLocal);

  return (
    <div className={styles.calendar}>
      <div className={styles.header}>
        <button type="button" className={styles.navBtn} onClick={prevMonth}>‹</button>
        <span className={styles.monthLabel}>{MONTHS[viewMonth]} {viewYear}</span>
        <button type="button" className={styles.navBtn} onClick={nextMonth}>›</button>
      </div>

      <div className={styles.dayHeaders}>
        {DAYS_SHORT.map(d => <span key={d} className={styles.dayHeader}>{d}</span>)}
      </div>

      <div className={styles.grid}>
        {cells.map((cell, i) => {
          const dateStr    = fmtDate(cell.date);
          const isPast     = cell.date < minLocal;
          const isOther    = !cell.current;
          const isAvail    = availableSet.has(dateStr);
          const isSelected = value === dateStr;
          const isToday    = dateStr === todayStr;

          const cls = [
            styles.day,
            isOther    ? styles.dayOther    : '',
            isPast     ? styles.dayPast     : '',
            isAvail    ? styles.dayAvail    : '',
            isSelected ? styles.daySelected : '',
            isToday    ? styles.dayToday    : '',
          ].filter(Boolean).join(' ');

          return (
            <button
              key={i}
              type="button"
              className={cls}
              disabled={isPast || isOther}
              onClick={() => {
                if (!isPast && !isOther) {
                  onChange(dateStr);
                  if (onClose) onClose();
                }
              }}
            >
              <span className={styles.dayNum}>{cell.date.getDate()}</span>
              {isAvail && !isSelected && <span className={styles.dot} />}
            </button>
          );
        })}
      </div>

      <div className={styles.legend}>
        <span className={styles.legendDot} />
        <span className={styles.legendText}>
          {availableDates.length > 0 ? 'Días con vuelos disponibles' : 'Sin vuelos para esta ruta'}
        </span>
      </div>
    </div>
  );
};

export default CalendarPicker;
