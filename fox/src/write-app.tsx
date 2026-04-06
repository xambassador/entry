import { StrictMode } from "react";
import ReactDOM from "react-dom/client";

import "./main.css";

import { WriteApp } from "./components/views/write";

const rootElement = document.getElementById("root")!;
ReactDOM.createRoot(rootElement).render(
  <StrictMode>
    <WriteApp />
  </StrictMode>
);
