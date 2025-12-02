type DebugActionOptions = {
  /**
   * Called when the action is disabled (e.g. production build).
   */
  onDisabled: () => void;
  /**
   * Override environment flag for easier testing.
   */
  isDev?: boolean;
};

/**
 * Runs a debug-only action safely by short-circuiting outside development builds.
 * Returns true when the action executed, false when it was skipped.
 */
export function executeDebugAction(action: () => void, options: DebugActionOptions): boolean {
  const { onDisabled, isDev = import.meta.env.DEV } = options;

  if (isDev) {
    action();
    return true;
  }

  onDisabled();
  return false;
}
