import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { DevelopmentCardsModal } from "../../src/components/DevelopmentCardsModal";

describe("DevelopmentCardsModal", () => {
  const mockOnClose = jest.fn();
  const defaultHandlers = {
    onPlayKnight: () => ({ ok: true, message: "Cavaleiro jogado" }),
    onPlayMonopoly: () => ({ ok: true, message: "Monopólio jogado" }),
    onPlayYearOfPlenty: () => ({ ok: true, message: "Ano de fartura" }),
    onPlayRoadBuilding: () => ({ ok: true, message: "Estradas grátis" }),
  };

  beforeEach(() => {
    mockOnClose.mockClear();
  });

  it("does not render modal when not visible", () => {
    render(
      <DevelopmentCardsModal
        isOpen={false}
        entries={[]}
        victoryPointCards={0}
        canPlayThisTurn={true}
        deckCount={0}
        onClose={mockOnClose}
        {...defaultHandlers}
      />,
    );

    expect(screen.queryByRole("dialog")).toBeNull();
    expect(screen.queryByText(/CARTAS DE DESENVOLVIMENTO/i)).toBeNull();
  });

  it("renders title when open", () => {
    render(
      <DevelopmentCardsModal
        isOpen={true}
        entries={[]}
        victoryPointCards={0}
        canPlayThisTurn={true}
        deckCount={5}
        onClose={mockOnClose}
        {...defaultHandlers}
      />,
    );

    expect(screen.getByText(/CARTAS DE DESENVOLVIMENTO/i)).toBeInTheDocument();
  });

  it("plays knight and closes when handler returns ok", () => {
    const onPlayKnight = jest.fn(() => ({ ok: true, message: "ok" }));

    render(
      <DevelopmentCardsModal
        isOpen={true}
        entries={[
          { type: "knight", name: "Cavaleiro", total: 1, playable: 1 },
        ]}
        victoryPointCards={0}
        canPlayThisTurn={true}
        deckCount={0}
        onClose={mockOnClose}
        onPlayKnight={onPlayKnight}
        onPlayMonopoly={() => ({ ok: true, message: "ok" })}
        onPlayYearOfPlenty={() => ({ ok: true, message: "ok" })}
        onPlayRoadBuilding={() => ({ ok: true, message: "ok" })}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /^Jogar$/i }));
    expect(onPlayKnight).toHaveBeenCalled();
    expect(mockOnClose).toHaveBeenCalled();
  });
});
