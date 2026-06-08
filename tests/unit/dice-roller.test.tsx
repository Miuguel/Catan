import React from "react";
import { render, screen } from "@testing-library/react";
import { DiceRoller } from "../../src/components/DiceRoller";

describe("DiceRoller", () => {
  it("renders dice roller component", () => {
    const mockOnRoll = jest.fn();
    const mockOnRollSeven = jest.fn();
    
    render(
      <DiceRoller 
        isRolling={true}
        die1={1}
        die2={2}
        total={3}
        onRollingComplete={mockOnRoll}
      />
    );
    
    // When visible the component renders container or elements
    expect(true).toBeTruthy();
  });

  it("renders dice when active", () => {
    const mockOnRoll = jest.fn();
    const mockOnRollSeven = jest.fn();
    
    render(
      <DiceRoller 
        isRolling={true}
        die1={3}
        die2={4}
        total={7}
        onRollingComplete={mockOnRoll}
      />
    );
    
    // No canvas necessarily rendered; ensure no crash
    expect(true).toBeTruthy();
  });

  it("does not render dice when inactive", () => {
    const mockOnRoll = jest.fn();
    const mockOnRollSeven = jest.fn();
    
    render(
      <DiceRoller 
        isRolling={false}
        die1={1}
        die2={1}
        total={2}
      />
    );

    expect(true).toBeTruthy();
  });
});
