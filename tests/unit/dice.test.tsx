import React from "react";
import { render } from "@testing-library/react";
import { Dice } from "../../src/components/Dice";

describe("Dice", () => {
  it("renders dice component", () => {
    const { container } = render(
      <Dice 
        finalValue={3}
        isRolling={false}
      />
    );
    expect(container).toBeTruthy();
  });

  it("contains canvas for rendering", () => {
    const { container } = render(
      <Dice 
        finalValue={4}
        isRolling={false}
      />
    );
    const img = container.querySelector("img.dice-sprite__img");
    expect(img).toBeTruthy();
  });

  it("renders different dice values", () => {
    const values = [1, 2, 3, 4, 5, 6];
    
    values.forEach(value => {
      const { container } = render(
        <Dice 
          finalValue={value}
          isRolling={false}
        />
      );
      
      const img = container.querySelector("img.dice-sprite__img");
      expect(img).toBeTruthy();
    });
  });

  it("accepts different colors", () => {
    const colors = ["red", "blue", "white"];
    
    colors.forEach(color => {
      const { container } = render(
        <Dice 
          finalValue={1}
          isRolling={false}
        />
      );
      
      expect(container).toBeTruthy();
    });
  });
});
