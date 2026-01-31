import { memo } from 'react';
import styles from './LoadingSpinner.module.css';

const LoadingSpinner = memo(({ message = 'Cargando...' }) => (
  <div className={styles.container}>
    <div className={styles.spinner} />
    {message && <p className={styles.message}>{message}</p>}
  </div>
));

LoadingSpinner.displayName = 'LoadingSpinner';

export default LoadingSpinner;
