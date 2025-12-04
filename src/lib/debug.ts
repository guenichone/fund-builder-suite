const ENABLE_DEBUG_FLAG = "VITE_ENABLE_DEBUG_TOOLS";

/**
 * Determines whether developer-only debug controls should be shown.
 * Enabled when running in dev mode or explicitly opting in via env flag.
 */
export function isDebugToolsEnabled(): boolean {
  const env = import.meta?.env;

  if (!env) {
    return false;
  }

  if (env[ENABLE_DEBUG_FLAG] === "true") {
    return true;
  }

  return Boolean(env.DEV);
}
