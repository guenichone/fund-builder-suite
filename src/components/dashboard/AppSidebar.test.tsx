import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import type { ReactNode } from "react";

import { AppSidebar } from "./AppSidebar";
import { isDebugToolsEnabled } from "@/lib/debug";

vi.mock("@/components/ui/sidebar", () => {
  const Wrapper = ({ children }: { children: ReactNode }) => <div>{children}</div>;

  return {
    Sidebar: Wrapper,
    SidebarContent: Wrapper,
    SidebarGroup: Wrapper,
    SidebarGroupLabel: Wrapper,
    SidebarGroupContent: Wrapper,
    SidebarMenu: Wrapper,
    SidebarMenuItem: Wrapper,
    SidebarMenuButton: Wrapper,
    useSidebar: () => ({ open: true }),
  };
});

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

vi.mock("@/components/NavLink", () => ({
  NavLink: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/lib/debug", () => ({
  isDebugToolsEnabled: vi.fn(),
}));

const mockIsDebugToolsEnabled = vi.mocked(isDebugToolsEnabled);

describe("AppSidebar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("hides debug controls when debug tools are disabled", () => {
    mockIsDebugToolsEnabled.mockReturnValue(false);

    render(<AppSidebar role="admin" />);

    expect(screen.queryByText("Console Error")).not.toBeInTheDocument();
    expect(screen.queryByText("HTTP Error")).not.toBeInTheDocument();
  });

  it("shows debug controls when debug tools are enabled", () => {
    mockIsDebugToolsEnabled.mockReturnValue(true);

    render(<AppSidebar role="admin" />);

    expect(screen.getByText("Console Error")).toBeInTheDocument();
    expect(screen.getByText("HTTP Error")).toBeInTheDocument();
  });
});
