import { describe, expect, it, vi } from "vitest";
import { executeDebugAction } from "./debug-actions";

describe("executeDebugAction", () => {
  it("runs the callback in development mode", () => {
    const action = vi.fn();
    const onDisabled = vi.fn();

    const didRun = executeDebugAction(action, { onDisabled, isDev: true });

    expect(didRun).toBe(true);
    expect(action).toHaveBeenCalledTimes(1);
    expect(onDisabled).not.toHaveBeenCalled();
  });

  it("skips the callback outside development mode", () => {
    const action = vi.fn();
    const onDisabled = vi.fn();

    const didRun = executeDebugAction(action, { onDisabled, isDev: false });

    expect(didRun).toBe(false);
    expect(action).not.toHaveBeenCalled();
    expect(onDisabled).toHaveBeenCalledTimes(1);
  });
});
