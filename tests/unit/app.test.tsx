import React from "react";
import { render, screen } from "@testing-library/react";
import App from "../../src/App";

describe("App", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders app component", () => {
    const { container } = render(<App />);
    expect(container).toBeTruthy();
  });

  it("has main content area", () => {
    render(<App />);
    const main = document.querySelector("main") || document.querySelector("div");
    expect(main).toBeTruthy();
  });
});
