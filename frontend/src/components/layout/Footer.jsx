import { Link } from 'react-router-dom';
import styles from './styles/Footer.module.css';

const Footer = () => {
  return (
    <footer className={`${styles.footer} py-5 text-white`}>
      <div className="container">
        {/* Instagram carousel placeholder */}
        <div className={`${styles.instaCarousel} mb-4 p-3 rounded shadow-sm`}>
          <h3 className="mb-3 h5">Follow us on Instagram</h3>
          <div className="d-flex gap-3 overflow-auto pb-2">
            {[1, 2, 3, 4, 5].map((item) => (
              <div
                key={item}
                className={styles.instaPost}
                aria-label="Instagram post"
              />
            ))}
          </div>
        </div>

        <div className="row gy-4">
          {/* About */}
          <div className="col-12 col-md-3">
            <h3 className={styles.sectionTitle}>About KEasy</h3>
            <p className={styles.textLight}>
              KEasy is a platform designed to help foreigners navigate life in South Korea, providing resources, community, and services.
            </p>
          </div>

          {/* Quick Links */}
          <div className="col-12 col-md-3">
            <h3 className={styles.sectionTitle}>Quick Links</h3>
            <ul className="list-unstyled">
              <li>
                <Link to="/about" className={styles.link}>About Us</Link>
              </li>
              <li>
                <Link to="/faq" className={styles.link}>FAQ</Link>
              </li>
              <li>
                <Link to="/contact" className={styles.link}>Contact</Link>
              </li>
            </ul>
          </div>

          {/* Features */}
          <div className="col-12 col-md-3">
            <h3 className={styles.sectionTitle}>Features</h3>
            <ul className="list-unstyled">
              {['/marketplace', '/events', '/blog', '/community', '/nearby'].map((path) => {
                const label = path.replace('/', '').replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase());
                return (
                  <li key={path}>
                    <Link to={path} className={styles.link}>{label}</Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Contact */}
          <div className="col-12 col-md-3">
            <h3 className={styles.sectionTitle}>Contact Us</h3>
            <ul className={`${styles.textLight} list-unstyled`}>
              <li>Seoul, South Korea</li>
              <li>
                <a href="mailto:info@keasy.com" className={styles.link}>info@keasy.com</a>
              </li>
            </ul>
          </div>
        </div>

        <div className={`${styles.bottom} mt-4 pt-3 border-top text-center`}>
          <p className={styles.textMuted}>&copy; {new Date().getFullYear()} KEasy. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;