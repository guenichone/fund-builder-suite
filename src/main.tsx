import { createRoot } from "react-dom/client";
import * as Sentry from "@sentry/react";
import App from "./App.tsx";
import "./index.css";

Sentry.init({
  dsn: "https://ac6c00af0e51dc8e9563b5069ff4b69d@o4510458792902656.ingest.de.sentry.io/4510458835435600",
  // Enable debug mode to see Sentry logs in the console
  debug: true,
  // Setting this option to true will send default PII data to Sentry.
  // For example, automatic IP address collection on events
  sendDefaultPii: true,
});

const container = document.getElementById("root")!;
const root = createRoot(container);
root.render(<App />);
