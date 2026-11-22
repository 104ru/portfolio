import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import PortfolioDemo from "./components/experimental/PortfolioDemo";
import "./index.css";
import "./reference.css";
import "./components/experimental/features.css";

const floatingDemo = new URLSearchParams(window.location.search).get("demo") === "floating";
createRoot(document.getElementById("root")!).render(floatingDemo ? <PortfolioDemo><App floatingDemo /></PortfolioDemo> : <App />);
