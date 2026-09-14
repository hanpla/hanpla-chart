import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PerformanceHud } from "./PerformanceHud";

describe("PerformanceHud component", () => {
  it("renders mini trigger button with FPS and latency information", () => {
    render(<PerformanceHud totalTicks={150} />);

    // Check trigger button presence
    const trigger = screen.getByTitle("성능 진단 HUD 열기/닫기");
    expect(trigger).toBeInTheDocument();
    expect(trigger).toHaveTextContent("FPS");
    expect(trigger).toHaveTextContent("ms");
  });

  it("opens detailed dashboard modal when clicked", () => {
    render(<PerformanceHud totalTicks={250} />);

    const trigger = screen.getByTitle("성능 진단 HUD 열기/닫기");
    fireEvent.click(trigger);

    // Modal elements should be in document
    expect(screen.getByText("PERFORMANCE HUD")).toBeInTheDocument();
    expect(screen.getByText("FRAME RATE")).toBeInTheDocument();
    expect(screen.getByText("EVENT LOOP LAG")).toBeInTheDocument();
    expect(screen.getByText("THROUGHPUT")).toBeInTheDocument();
    expect(screen.getByText("ACTIVE DOM NODES")).toBeInTheDocument();
    expect(screen.getByText("60 FPS Defense Stack Active")).toBeInTheDocument();
  });

  it("closes the modal when close button is clicked", () => {
    render(<PerformanceHud totalTicks={300} />);

    const trigger = screen.getByTitle("성능 진단 HUD 열기/닫기");
    fireEvent.click(trigger);

    const closeBtn = screen.getByLabelText("닫기");
    expect(closeBtn).toBeInTheDocument();

    fireEvent.click(closeBtn);
    expect(screen.queryByText("PERFORMANCE HUD")).not.toBeInTheDocument();
  });

  it("closes modal on Escape key press", () => {
    render(<PerformanceHud totalTicks={500} />);

    const trigger = screen.getByTitle("성능 진단 HUD 열기/닫기");
    fireEvent.click(trigger);
    expect(screen.getByText("PERFORMANCE HUD")).toBeInTheDocument();

    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByText("PERFORMANCE HUD")).not.toBeInTheDocument();
  });
});
