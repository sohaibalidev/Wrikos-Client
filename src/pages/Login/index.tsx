import { useState, useEffect, type JSX } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context";
import styles from "./Login.module.css";

const Login = (): JSX.Element => {
  const [email, setEmail] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<string>("");
  const navigate = useNavigate();
  const {
    verifyMagicLink,
    login,
    isAuthenticated,
    isLoading: authLoading,
  } = useAuth();

  useEffect(() => {
    if (authLoading) return;

    if (isAuthenticated) {
      navigate("/", { replace: true });
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (token) {
      handleVerifyMagicLink(token);
    }
  }, [isAuthenticated, authLoading, navigate]);

  const handleVerifyMagicLink = async (token: string): Promise<void> => {
    setIsLoading(true);
    setError("");
    try {
      await verifyMagicLink(token);
    } catch (err) {
      setError("Invalid or expired login link. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setMessage("");

    try {
      await login(email);
      setMessage("Check your email for the login link!");
      setEmail("");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message || "An error occurred. Please try again.");
      } else {
        setError("An error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.iconWrapper}>
          <div className={styles.iconCircle}>W</div>
        </div>

        <h1 className={styles.title}>Welcome Back</h1>
        <p className={styles.subtitle}>
          Enter your email to receive a secure login link
        </p>

        {error && <div className={styles.error}>{error}</div>}
        {message && <div className={styles.success}>{message}</div>}

        <form onSubmit={onSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="email">Email Address</label>
            <div className={styles.inputWrapper}>
              <input
                id="email"
                type="email"
                className={styles.input}
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEmail(e.target.value)
                }
                placeholder="you@example.com"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <button type="submit" className={styles.button} disabled={isLoading}>
            {isLoading ? "Sending..." : "Send Login Link"}
          </button>
        </form>

        <p className={styles.footer}>
          Powered by <span>Wrikos</span> - Secure and Fast
        </p>
      </div>
    </div>
  );
};

export default Login;
