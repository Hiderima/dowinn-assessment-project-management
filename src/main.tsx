// Application entry point — mounts the root <App /> into #root and loads global styles.
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
