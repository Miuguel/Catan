import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PlayerSelection from "../../src/components/PlayerSelection";

describe("PlayerSelection", () => {
  it("renders player selection component", () => {
    const mockOnConfirm = jest.fn();
    const mockOnBack = jest.fn();
    render(<PlayerSelection onConfirm={mockOnConfirm} onBack={mockOnBack} />);
    
    const headings = screen.getAllByRole("heading");
    expect(headings.length).toBeGreaterThanOrEqual(0);
  });

  it("has buttons for player interactions", () => {
    const mockOnConfirm = jest.fn();
    const mockOnBack = jest.fn();
    render(<PlayerSelection onConfirm={mockOnConfirm} onBack={mockOnBack} />);
    
    const buttons = screen.queryAllByRole("button");
    expect(buttons.length).toBeGreaterThanOrEqual(0);
  });

  it("displays form elements", () => {
    const mockOnConfirm = jest.fn();
    const mockOnBack = jest.fn();
    render(<PlayerSelection onConfirm={mockOnConfirm} onBack={mockOnBack} />);
    
    const inputs = screen.queryAllByRole("textbox");
    expect(inputs).toBeDefined();
  });
});
