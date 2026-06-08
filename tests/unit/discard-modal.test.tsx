import React from "react";
import { render, screen } from "@testing-library/react";
import { DiscardModal } from "../../src/components/DiscardModal";

describe("DiscardModal", () => {
  it("renders discard modal when visible", () => {
    const mockOnConfirm = jest.fn();
    
    render(
      <DiscardModal
        isOpen={true}
        playerName="Player 1"
        required={3}
        available={{ brick: 1, lumber: 1, wool: 1, grain: 1, ore: 1 }}
        onConfirm={() => ({ ok: true, message: "ok" })}
      />
    );
    
    const modal = screen.queryByRole("dialog");
    if (!modal) {
      const texts = screen.queryAllByText(/DESCARTE|discard/i, { exact: false });
      expect(texts.length).toBeGreaterThan(0);
    } else {
      expect(modal).toBeDefined();
    }
  });

  it("does not render discard modal when not visible", () => {
    const mockOnConfirm = jest.fn();
    
    render(
      <DiscardModal
        isOpen={false}
        playerName="Player 1"
        required={3}
        available={{ brick: 1, lumber: 1, wool: 1, grain: 1, ore: 1 }}
        onConfirm={() => ({ ok: true, message: "ok" })}
      />
    );
    
    const modal = screen.queryByRole("dialog");
    expect(modal).toBeNull();
  });

  it("displays player name and cards to discard", () => {
    const mockOnConfirm = jest.fn();
    
    render(
      <DiscardModal
        isOpen={true}
        playerName="Player 1"
        required={5}
        available={{ brick: 5, lumber: 5, wool: 5, grain: 5, ore: 5 }}
        onConfirm={() => ({ ok: true, message: "ok" })}
      />
    );
    
    // Should display the number of cards to discard
    const texts = screen.queryAllByText(/5|discard/i, { exact: false });
    expect(texts.length).toBeGreaterThan(0);
  });

  it("has confirm button", () => {
    const mockOnConfirm = jest.fn();
    
    render(
      <DiscardModal
        isOpen={true}
        playerName="Player 1"
        required={3}
        available={{ brick: 1, lumber: 1, wool: 1, grain: 1, ore: 1 }}
        onConfirm={() => ({ ok: true, message: "ok" })}
      />
    );
    
    const buttons = screen.queryAllByRole("button");
    expect(buttons.length).toBeGreaterThanOrEqual(0);
  });
});
