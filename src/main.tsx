import ReactDOM from "react-dom/client";
import App from "./App";
import HealthCheckWrapper from "./components/HealthCheckWrapper";
import "./index.css";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement,
);
root.render(
  <HealthCheckWrapper>
    <App />
  </HealthCheckWrapper>,
);
