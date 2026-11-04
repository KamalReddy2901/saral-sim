import React from "react";
import ReactDOM from "react-dom/client";
import "@fontsource-variable/inter-tight/wght.css";
import "@fontsource/instrument-serif/latin-400-italic.css";
import "@fontsource/atkinson-hyperlegible/latin-400.css";
import "@fontsource/atkinson-hyperlegible/latin-700.css";
import "./styles/tokens.css";
import "./styles/global.css";
import "./styles/app.css";
import { App } from "./App";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
