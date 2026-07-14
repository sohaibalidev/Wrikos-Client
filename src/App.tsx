import { useState, useEffect } from "react";
import AppProviders from "./providers/AppProviders";
import { AppRoutes } from "./routes";
import { Header } from "./components/Layout";
import styles from "./App.module.css";

const App = () => {
  const [darkMode, setDarkMode] = useState<boolean>(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const systemPrefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    const initialTheme = savedTheme || (systemPrefersDark ? "dark" : "light");

    setDarkMode(initialTheme === "dark");
    document.documentElement.setAttribute("data-theme", initialTheme);
  }, []);

  const toggleTheme = (): void => {
    const newTheme = darkMode ? "light" : "dark";
    setDarkMode(!darkMode);
    localStorage.setItem("theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  return (
    <AppProviders>
      <div className={styles.app}>
        <Header darkMode={darkMode} toggleTheme={toggleTheme} />
        <main className={styles.mainContent}>
          <AppRoutes />
        </main>
      </div>
    </AppProviders>
  );
};

export default App;
