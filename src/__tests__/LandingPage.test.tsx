import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, test, expect } from "vitest";
import App from "../App";

describe("LandingPage", () => {
  test("mounts without throwing and exposes header, main and footer regions", () => {
    // Ensure the app renders without throwing
    render(<App />);

    // Check for semantic landmarks
    const header = screen.getByRole("banner");
    const main = screen.getByRole("main");
    const footer = screen.getByRole("contentinfo");

    expect(header).toBeTruthy();
    expect(main).toBeTruthy();
    expect(footer).toBeTruthy();
  });
});
