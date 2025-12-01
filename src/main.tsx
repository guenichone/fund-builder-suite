import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initSentry } from "./lib/sentry";
import { supabase } from "./integrations/supabase/client";

// Initialize Sentry for error monitoring
initSentry(supabase);

createRoot(document.getElementById("root")!).render(<App />);
