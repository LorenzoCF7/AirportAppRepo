import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import LoginRegisterModal from '../LoginRegisterModal/LoginRegisterModal';
import styles from './Header.module.css';

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <>
      <header className={styles.header}>
        <div className={styles.container}>
          {/* Nombre de la App */}
          <div className={styles.appName}>
            <h1>✈️ AirportApp</h1>
          </div>

          {/* Sección de autenticación */}
          <div className={styles.authSection}>
            {isAuthenticated ? (
              <div className={styles.userContainer}>
                <button
                  className={styles.userButton}
                  onClick={() => setShowUserMenu(!showUserMenu)}
                >
                  <span className={styles.userIcon}>👤</span>
                  <span className={styles.userName}>{user.username || user.email}</span>
                  <span className={styles.dropdown}>▼</span>
                </button>

                {showUserMenu && (
                  <div className={styles.userMenu}>
                    <div className={styles.userInfo}>
                      <p className={styles.userEmail}>{user.email}</p>
                    </div>
                    <button
                      className={styles.logoutBtn}
                      onClick={() => {
                        logout();
                        setShowUserMenu(false);
                      }}
                    >
                      Cerrar Sesión
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                className={styles.loginBtn}
                onClick={() => setIsLoginModalOpen(true)}
              >
                Iniciar Sesión
              </button>
            )}
          </div>
        </div>
      </header>

      <LoginRegisterModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </>
  );
};

export default Header;
