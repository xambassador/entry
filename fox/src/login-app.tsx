import { StrictMode } from "react";
import ReactDOM from "react-dom/client";

import "./main.css";

import { LoginApp } from "./components/views/login";

const rootElement = document.getElementById("root")!;
ReactDOM.createRoot(rootElement).render(
  <StrictMode>
    <LoginApp />
  </StrictMode>
);
