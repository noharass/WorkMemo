import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { NotificationApp } from "./NotificationApp";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    {new URLSearchParams(window.location.search).has("notice") ? <NotificationApp /> : <App />}
  </React.StrictMode>,
);
