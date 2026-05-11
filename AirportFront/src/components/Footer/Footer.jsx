import { useState } from 'react';
import { Plane, X, Wrench, Clock } from 'lucide-react';
import styles from './Footer.module.css';

const links = [
  {
    title: 'Empresa',
    items: [
      { label: 'Sobre nosotros',       soon: true },
      { label: 'Trabaja con nosotros', href: 'https://www.linkedin.com' },
      { label: 'Prensa',               href: 'mailto:prensa@airportapp.com' },
      { label: 'Blog',                 soon: true },
    ],
  },
  {
    title: 'Soporte',
    items: [
      { label: 'Centro de ayuda', soon: true },
      { label: 'Contacto',        href: 'mailto:hola@airportapp.com' },
      { label: 'Accesibilidad',   soon: true },
      { label: 'Comentarios',     href: 'mailto:feedback@airportapp.com' },
    ],
  },
  {
    title: 'Legal',
    items: [
      { label: 'Privacidad',          soon: true },
      { label: 'Términos de uso',     soon: true },
      { label: 'Política de cookies', soon: true },
      { label: 'Aviso legal',         soon: true },
    ],
  },
  {
    title: 'Descubrir',
    items: [
      { label: 'Vuelos baratos',     view: 'shop' },
      { label: 'Destinos populares', view: 'explore' },
      { label: 'Aeropuertos',        view: 'shop' },
      { label: 'Aerolíneas',         view: 'shop' },
    ],
  },
];

const ComingSoonModal = ({ label, onClose }) => (
  <div className={styles.modalOverlay} onClick={onClose}>
    <div className={styles.modal} onClick={e => e.stopPropagation()}>
      <button className={styles.modalClose} onClick={onClose}>
        <X size={18} />
      </button>

      <div className={styles.modalIconWrap}>
        <Wrench size={28} className={styles.modalIcon} />
        <Clock size={16} className={styles.modalIconSmall} />
      </div>

      <h3 className={styles.modalTitle}>Próximamente</h3>
      <p className={styles.modalSection}>{label}</p>
      <p className={styles.modalDesc}>
        Estamos trabajando en ello. Esta sección estará disponible muy pronto.
      </p>

      <button className={styles.modalBtn} onClick={onClose}>
        Entendido
      </button>
    </div>
  </div>
);

const Footer = ({ onNavigate }) => {
  const [comingSoon, setComingSoon] = useState(null);

  return (
    <>
      <footer className={styles.footer}>
        <div className={styles.inner}>

          <div className={styles.brand}>
            <div className={styles.logo}>
              <span className={styles.logoSquare}>
                <Plane size={13} color="white" />
              </span>
              <span className={styles.logoText}>AirportApp</span>
            </div>
            <p className={styles.tagline}>
              Compara vuelos en cientos de webs.<br />Encuentra la mejor oferta en segundos.
            </p>
          </div>

          {links.map(col => (
            <div key={col.title} className={styles.col}>
              <h4 className={styles.colTitle}>{col.title}</h4>
              <ul className={styles.colList}>
                {col.items.map(item => (
                  <li key={item.label}>
                    {item.view ? (
                      <button
                        className={styles.colLink}
                        onClick={() => onNavigate && onNavigate(item.view)}
                      >
                        {item.label}
                      </button>
                    ) : item.soon ? (
                      <button
                        className={styles.colLink}
                        onClick={() => setComingSoon(item.label)}
                      >
                        {item.label}
                      </button>
                    ) : (
                      <a
                        className={styles.colLink}
                        href={item.href}
                        target={item.href.startsWith('mailto:') ? undefined : '_blank'}
                        rel="noopener noreferrer"
                      >
                        {item.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}

        </div>

        <div className={styles.bottom}>
          <span>© {new Date().getFullYear()} AirportApp. Todos los derechos reservados.</span>
          <span className={styles.bottomRight}>Hecho con ♥ para viajeros</span>
        </div>
      </footer>

      {comingSoon && (
        <ComingSoonModal label={comingSoon} onClose={() => setComingSoon(null)} />
      )}
    </>
  );
};

export default Footer;
