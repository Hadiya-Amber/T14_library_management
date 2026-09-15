import React from "react";
import { describe, test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import CatalogueCta from "../components/CatalogueCta";
import fs from "fs";
import path from "path";

describe("CatalogueCta", () => {
  test("renders a link labelled 'Browse the catalogue' pointing at /catalogue", () => {
  render(<CatalogueCta />);
  const link = screen.getByRole("link", { name: "Browse the catalogue" });
  expect(link).toBeTruthy();
  // JSDOM represents hrefs as full URLs; ensure it ends with the path.
  expect(link.getAttribute("href")).toBe("/catalogue");
  });

  test("stylesheet defines a visible :focus-visible outline (no outline: none)", () => {
    const cssPath = path.join(__dirname, "..", "components", "CatalogueCta.module.css");
    const content = fs.readFileSync(cssPath, "utf8");
    // Ensure there is a :focus-visible selector
    expect(content).toMatch(/:focus-visible/);
    // And that the focus-visible rule does not remove the outline
    const focusBlock = content.match(/\.cta:focus-visible\s*\{([\s\S]*?)\}/);
    expect(focusBlock).not.toBeNull();
    const block = focusBlock ? focusBlock[1] : "";
    expect(block).not.toMatch(/outline:\s*none/);
  });
});
