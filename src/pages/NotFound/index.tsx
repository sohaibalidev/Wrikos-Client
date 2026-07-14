import { Link } from "react-router-dom";
import { FiHome, FiArrowLeft } from "react-icons/fi";
import styles from "./NotFound.module.css";
import { type JSX } from "react";

const NotFound = (): JSX.Element => {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.iconWrapper}>
          <span className={styles.icon}>404</span>
        </div>
        <h1 className={styles.title}>Page Not Found</h1>
        <h2 className={styles.subtitle}>Oops! Something went wrong</h2>
        <p className={styles.description}>
          The page you are looking for doesn't exist or has been moved. Let's
          get you back on track.
        </p>
        <div className={styles.buttonGroup}>
          <Link to="/" className={styles.button}>
            <FiHome size={18} />
            Go Back Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className={`${styles.button} ${styles.buttonSecondary}`}
          >
            <FiArrowLeft size={18} />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
