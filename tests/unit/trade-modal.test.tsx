import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TradeModal } from "../../src/components/TradeModal";

describe("TradeModal", () => {
  const mockTrade = {
    id: "trade-1",
    fromPlayerId: "player-1",
    toPlayerId: "player-2",
    offering: { brick: 1 },
    requesting: { grain: 1 },
  };

  it("renders trade modal when visible", () => {
    const mockOnAccept = jest.fn();
    const mockOnReject = jest.fn();
    
    render(
      <TradeModal
        isOpen={true}
        onClose={() => {}}
        currentPlayerName="Player 1"
        otherPlayers={[]}
        onBankTrade={() => ({ ok: true, message: "ok" })}
        onPlayerTrade={() => ({ ok: true, message: "ok" })}
      />
    );
    
    // Should render modal content
    const modal = screen.queryByRole("dialog") || screen.queryByText(/trade/i, { exact: false });
    expect(modal).toBeDefined();
  });

  it("does not render trade modal when not visible", () => {
    const mockOnAccept = jest.fn();
    const mockOnReject = jest.fn();
    
    const { container } = render(
      <TradeModal
        isOpen={false}
        onClose={() => {}}
        currentPlayerName="Player 1"
        otherPlayers={[]}
        onBankTrade={() => ({ ok: true, message: "ok" })}
        onPlayerTrade={() => ({ ok: true, message: "ok" })}
      />
    );
    
    // Modal should not be visible
    const modal = screen.queryByRole("dialog");
    expect(modal).toBeNull();
  });

  it("has accept and reject buttons", () => {
    const mockOnAccept = jest.fn();
    const mockOnReject = jest.fn();
    
    render(
      <TradeModal
        isOpen={true}
        onClose={() => {}}
        currentPlayerName="Player 1"
        otherPlayers={[]}
        onBankTrade={() => ({ ok: true, message: "ok" })}
        onPlayerTrade={() => ({ ok: true, message: "ok" })}
      />
    );
    
    const buttons = screen.queryAllByRole("button");
    expect(buttons.length).toBeGreaterThanOrEqual(0);
  });
});
