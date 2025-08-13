import Navbar from './Navbar';
import Footer from './Footer';
import styles from './styles/Layout.module.css';

const Layout = ({ children }) => {
  return (
    <div className={styles.appWrapper}>
        <Navbar />
        <main className={styles.mainContent}>{children}</main>
        <Footer />
    </div>
  )
}

export default Layout