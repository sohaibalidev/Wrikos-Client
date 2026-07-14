import { useState, useEffect, useRef, type ReactNode } from "react";
import axios, { type CancelTokenSource } from "axios";
import { FiWifiOff, FiRefreshCw, FiServer } from "react-icons/fi";
import config from "@/config";
import styles from "./HealthCheckWrapper.module.css";

const RETRY_IN = 30;
const TIMEOUT = 3;
const MAX_RETRIES = 10;

interface HealthCheckWrapperProps {
  children: ReactNode;
}

const HealthCheckWrapper = ({ children }: HealthCheckWrapperProps) => {
  const [isServerOnline, setIsServerOnline] = useState<boolean | null>(null);
  const [retryIn, setRetryIn] = useState<number>(RETRY_IN);
  const [retryCount, setRetryCount] = useState<number>(0);
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const retryTimerRef = useRef<number | null>(null);
  const cancelTokenRef = useRef<CancelTokenSource | null>(null);
  const isMountedRef = useRef<boolean>(true);
  const BACKEND_URL = config.REACT_APP_BACKEND_URL;

  const clearRetryTimer = (): void => {
    if (retryTimerRef.current) {
      clearInterval(retryTimerRef.current);
      retryTimerRef.current = null;
    }
  };

  const checkHealth = async (): Promise<void> => {
    if (isChecking || !isMountedRef.current) return;

    setIsChecking(true);

    try {
      if (cancelTokenRef.current) {
        cancelTokenRef.current.cancel("New request initiated");
        cancelTokenRef.current = null;
      }

      const source: CancelTokenSource = axios.CancelToken.source();
      cancelTokenRef.current = source;

      const timeout = setTimeout(() => {
        if (source) {
          source.cancel("Request timeout after 3 seconds");
        }
      }, TIMEOUT * 1000);

      await axios.get(`${BACKEND_URL}/api/health`, {
        cancelToken: source.token,
        timeout: TIMEOUT * 1000,
      });

      clearTimeout(timeout);

      if (isMountedRef.current) {
        setIsServerOnline(true);
        setRetryCount(0);
        clearRetryTimer();
      }
    } catch (err) {
      if (axios.isCancel(err)) {
        return;
      }

      if (isMountedRef.current) {
        setIsServerOnline(false);
        setRetryIn(RETRY_IN);
        setRetryCount((prev) => prev + 1);
      }
    } finally {
      if (isMountedRef.current) {
        setIsChecking(false);
      }
      cancelTokenRef.current = null;
    }
  };

  useEffect(() => {
    isMountedRef.current = true;
    checkHealth();

    return () => {
      isMountedRef.current = false;
      clearRetryTimer();
      if (cancelTokenRef.current) {
        cancelTokenRef.current.cancel("Component unmounting");
        cancelTokenRef.current = null;
      }
    };
  }, []); 

  useEffect(() => {
    if (isServerOnline === false && retryCount < MAX_RETRIES && !isChecking) {
      clearRetryTimer();

      const interval = setInterval(() => {
        setRetryIn((prev) => {
          if (prev <= 1) {
            clearRetryTimer();
            setTimeout(() => {
              checkHealth();
            }, 0);
            return RETRY_IN;
          }
          return prev - 1;
        });
      }, 1000);

      retryTimerRef.current = interval;
    }

    return () => {
      clearRetryTimer();
    };
  }, [isServerOnline, retryCount]); 

  const handleRetryNow = (): void => {
    if (isChecking) return;

    clearRetryTimer();
    setRetryIn(RETRY_IN);
    setTimeout(() => {
      checkHealth();
    }, 0);
  };

  const getProgressPercentage = (): number => {
    return ((RETRY_IN - retryIn) / RETRY_IN) * 100;
  };

  if (isServerOnline === null) {
    return (
      <div className={styles.loadingScreen}>
        <div className={styles.loadingContent}>
          <div className={styles.spinner} />
          <div className={styles.loadingText}>
            <h3>Connecting to Server</h3>
            <p>Please wait while we establish a connection...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isServerOnline) {
    return (
      <div className={styles.offlineScreen}>
        <div className={styles.offlineCard}>
          <div className={styles.offlineIconWrapper}>
            <FiWifiOff className={styles.offlineIcon} />
          </div>

          <h2>Server Unavailable</h2>

          <p className={styles.offlineDescription}>
            Our backend server is currently not responding. This can happen when
            the system is restarting or temporarily unreachable.
          </p>

          <div className={styles.offlineNotice}>
            <FiServer size={18} />
            <span>
              <strong>No action needed.</strong> We are automatically retrying
              every few seconds and will reconnect once the server is back
              online.
            </span>
          </div>

          {retryCount < MAX_RETRIES ? (
            <div className={styles.retrySection}>
              <div className={styles.retryInfo}>
                <span className={styles.retryCount}>
                  Attempt {retryCount + 1} of {MAX_RETRIES}
                </span>
                <span className={styles.retryTimer}>
                  Next attempt in <strong>{retryIn}</strong> second
                  {retryIn !== 1 ? "s" : ""}
                </span>
              </div>

              <div className={styles.progressWrapper}>
                <div
                  className={styles.progressBar}
                  style={{ width: `${getProgressPercentage()}%` }}
                />
              </div>

              <button
                className={styles.retryButton}
                onClick={handleRetryNow}
                disabled={isChecking}
              >
                <FiRefreshCw className={isChecking ? styles.spinning : ""} />
                <span>{isChecking ? "Checking..." : "Retry Now"}</span>
              </button>
            </div>
          ) : (
            <div className={styles.maxRetriesReached}>
              <p>
                <strong>Maximum retry attempts reached.</strong>
              </p>
              <p className={styles.retryHelp}>
                Please refresh the page or check your internet connection.
              </p>
              <button
                className={`${styles.retryButton} ${styles.refreshButton}`}
                onClick={() => window.location.reload()}
              >
                <FiRefreshCw />
                <span>Refresh Page</span>
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default HealthCheckWrapper;
