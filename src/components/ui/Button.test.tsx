import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Button } from "./Button";

describe("Button UI Component", () => {
  it("renders with default props and text", () => {
    render(<Button>Click me</Button>);
    const btn = screen.getByRole("button", { name: "Click me" });
    expect(btn).toBeDefined();
    expect(btn.className).toContain("bg-zinc-800");
  });

  it("handles click events", () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Trigger</Button>);
    fireEvent.click(screen.getByRole("button", { name: "Trigger" }));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("renders tab variant with active state", () => {
    const { rerender } = render(
      <Button variant="tab" isActive={false}>
        Tab 1
      </Button>,
    );
    let btn = screen.getByRole("button", { name: "Tab 1" });
    expect(btn.getAttribute("aria-pressed")).toBe("false");
    expect(btn.className).toContain("text-zinc-400");

    rerender(
      <Button variant="tab" isActive={true}>
        Tab 1
      </Button>,
    );
    btn = screen.getByRole("button", { name: "Tab 1" });
    expect(btn.getAttribute("aria-pressed")).toBe("true");
    expect(btn.className).toContain("bg-zinc-800");
  });

  it("applies ghost and outline variants", () => {
    const { rerender } = render(<Button variant="ghost">Ghost</Button>);
    let btn = screen.getByRole("button", { name: "Ghost" });
    expect(btn.className).toContain("hover:bg-zinc-800");

    rerender(<Button variant="outline">Outline</Button>);
    btn = screen.getByRole("button", { name: "Outline" });
    expect(btn.className).toContain("border-zinc-700");
  });

  it("merges additional custom classNames safely", () => {
    render(
      <Button className="custom-test-class text-emerald-400">Custom</Button>,
    );
    const btn = screen.getByRole("button", { name: "Custom" });
    expect(btn.className).toContain("custom-test-class");
    expect(btn.className).toContain("text-emerald-400");
  });
});
