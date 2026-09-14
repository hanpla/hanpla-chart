import { describe, it, expect } from "vitest";
import { cn } from "./cn";

describe("cn utility", () => {
  it("should merge class names correctly", () => {
    const result = cn("p-4", "text-zinc-100", "font-bold");
    expect(result).toBe("p-4 text-zinc-100 font-bold");
  });

  it("should resolve Tailwind class conflicts", () => {
    const result = cn("p-4", "p-6", "bg-red-500", "bg-blue-500");
    expect(result).toBe("p-6 bg-blue-500");
  });

  it("should handle conditional and falsy values", () => {
    const isHidden = false;
    const isVisible = true;
    const result = cn("base-class", isHidden && "hidden", isVisible && "block");
    expect(result).toBe("base-class block");
  });
});
