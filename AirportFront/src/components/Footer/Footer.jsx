import { Plane } from 'lucide-react';
import styles from './Footer.module.css';

const links = [
  {
    title: 'Empresa',
    items: ['Sobre nosotros', 'Trabaja con nosotros', 'Prensa', 'Blog'],
  },
  {
    title: 'Soporte',
    items: ['Centro de ayuda', 'Contacto', 'Accesibilidad', 'Comentarios'],
  },
  {
    title: 'Legal',
    items: ['Privacidad', 'Términos de uso', 'Política de cookies', 'Aviso legal'],
  },
  {
    title: 'Descubrir',
    items: ['Vuelos baratos', 'Destinos populares', 'Aeropuertos', 'Aerolíneas'],
  },
];

const Footer = () => (
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
              <li key={item}>
                <button className={styles.colLink}>{item}</button>
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
);

export default Footer;
