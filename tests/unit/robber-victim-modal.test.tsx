import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { RobberVictimModal } from "../../src/components/RobberVictimModal";

describe("RobberVictimModal", () => {
  const victims = [
    { id: "p1", name: "Alice", resourceCount: 5 },
    { id: "p2", name: "Bob", resourceCount: 3, avatarSrc: "/avatar.png" },
  ];

  it("does not render when closed", () => {
    render(
      <RobberVictimModal isOpen={false} victims={victims} onPick={jest.fn()} />,
    );

    expect(screen.queryByText(/ESCOLHA QUEM ROUBAR/i)).toBeNull();
  });

  it("lists victims and calls onPick", () => {
    const onPick = jest.fn();

    render(
      <RobberVictimModal isOpen={true} victims={victims} onPick={onPick} />,
    );

    expect(screen.getByText(/ESCOLHA QUEM ROUBAR/i)).toBeInTheDocument();
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Alice/i }));
    expect(onPick).toHaveBeenCalledWith("p1");
  });

  it("shows resource counts for each victim", () => {
    render(
      <RobberVictimModal isOpen={true} victims={victims} onPick={jest.fn()} />,
    );

    expect(screen.getByText("5 carta(s)")).toBeInTheDocument();
    expect(screen.getByText("3 carta(s)")).toBeInTheDocument();
  });
});
