import React from "react";
import { render } from "@testing-library/react";
import ClickSound from "../../src/components/ClickSound";
import HoverSound from "../../src/components/HoverSound";
import KeyboardSound from "../../src/components/KeyboardSound";
import BackgroundMusic from "../../src/components/BackgroundMusic";

describe("Sound Components", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("ClickSound", () => {
    it("renders click sound component", () => {
      const { container } = render(
        <ClickSound src="/audio/click.mp3" />
      );
      expect(container).toBeTruthy();
    });
  });

  describe("HoverSound", () => {
    it("renders hover sound component", () => {
      const { container } = render(
        <HoverSound src="/audio/hover.mp3" />
      );
      expect(container).toBeTruthy();
    });
  });

  describe("KeyboardSound", () => {
    it("renders keyboard sound component", () => {
      const { container } = render(
        <KeyboardSound src="/audio/keyboard.mp3" />
      );
      expect(container).toBeTruthy();
    });
  });

  describe("BackgroundMusic", () => {
    it("renders background music component", () => {
      const { container } = render(
        <BackgroundMusic src="/audio/bg.mp3" />
      );
      expect(container).toBeTruthy();
    });

    it("contains audio element", () => {
      const { container } = render(
        <BackgroundMusic src="/audio/bg.mp3" />
      );
      const audio = container.querySelector("audio");
      expect(audio).toBeTruthy();
    });
  });
});
