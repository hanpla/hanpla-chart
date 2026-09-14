import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Badge } from "./Badge";

describe("Badge UI Component", () => {
  it("renders with default neutral styling", () => {
    render(<Badge>Default</Badge>);
    const badge = screen.getByText("Default");
    expect(badge).toBeDefined();
    expect(badge.className).toContain("text-zinc-300");
  });

  it("renders with warning and whale intents", () => {
    const { rerender } = render(<Badge intent="warning">유의</Badge>);
    let badge = screen.getByText("유의");
    expect(badge.className).toContain("text-amber-400");

    rerender(<Badge intent="whale">WHALE</Badge>);
    badge = screen.getByText("WHALE");
    expect(badge.className).toContain("bg-amber-400");
    expect(badge.className).toContain("text-zinc-950");
  });

  it("applies up and down intents correctly", () => {
    const { rerender } = render(<Badge intent="up">+5.00%</Badge>);
    let badge = screen.getByText("+5.00%");
    expect(badge.className).toContain("text-emerald-400");

    rerender(<Badge intent="down">-5.00%</Badge>);
    badge = screen.getByText("-5.00%");
    expect(badge.className).toContain("text-rose-400");
  });
});
