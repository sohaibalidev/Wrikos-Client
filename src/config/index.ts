interface Config {
  REACT_APP_BACKEND_URL: string;
}

const getBackendUrl = (): string => {
  if (import.meta.env.VITE_BACKEND_URL) {
    return import.meta.env.VITE_BACKEND_URL;
  }

  if (import.meta.env.DEV) {
    return "http://localhost:3000";
  }

  return window.location.origin;
};

const config: Config = {
  REACT_APP_BACKEND_URL: getBackendUrl(),
};

export default config;
