import { Link } from "react-router-dom";
import { FiSun, FiMoon, FiLogOut } from "react-icons/fi";
import { useAuth } from "@/hooks/useAuth";
import styles from "./Header.module.css";

interface HeaderProps {
  darkMode: boolean;
  toggleTheme: () => void;
}

const Header = ({ darkMode, toggleTheme }: HeaderProps) => {
  const { isAuthenticated, logout } = useAuth();

  return (
    <header className={styles.header}>
      <div className={styles.headerContainer}>
        <Link to="/" className={styles.logo}>
          <div className={styles.logoIcon}>W</div>
          <div className={styles.logoText}>
            <h1>Wrikos</h1>
            <span className={styles.logoSubtitle}>Task Manager</span>
          </div>
        </Link>

        <div className={styles.headerActions}>
          {isAuthenticated && (
            <button onClick={logout} className={styles.logoutBtn}>
              <FiLogOut size={18} />
              <span>Logout</span>
            </button>
          )}
          <button
            onClick={toggleTheme}
            className={styles.themeToggle}
            aria-label={`Switch to ${darkMode ? "light" : "dark"} mode`}
          >
            {darkMode ? <FiSun size={18} /> : <FiMoon size={18} />}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
