import { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import styles from './NotificationToast.module.css';

const NotificationToast = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const handleNotification = (event) => {
      const { title, message, type } = event.detail;
      
      const id = Date.now();
      const newNotification = { id, title, message, type };
      
      setNotifications(prev => [...prev, newNotification]);
      
      // Auto-remove después de 5 segundos
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== id));
      }, 5000);
    };

    // Escuchar eventos de notificación
    window.addEventListener('flight-notification', handleNotification);
    
    return () => {
      window.removeEventListener('flight-notification', handleNotification);
    };
  }, []);

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle size={20} />;
      case 'error':
        return <AlertCircle size={20} />;
      default:
        return <Info size={20} />;
    }
  };

  return (
    <div className={styles.notificationContainer}>
      {notifications.map((notification) => (
        <div 
          key={notification.id} 
          className={`${styles.notificationToast} ${styles[`notification${notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}`]}`}
        >
          <div className={styles.notificationIcon}>
            {getIcon(notification.type)}
          </div>
          <div className={styles.notificationContent}>
            <div className={styles.notificationTitle}>{notification.title}</div>
            <div className={styles.notificationMessage}>{notification.message}</div>
          </div>
          <button 
            className={styles.notificationClose}
            onClick={() => removeNotification(notification.id)}
          >
            <X size={18} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default NotificationToast;
