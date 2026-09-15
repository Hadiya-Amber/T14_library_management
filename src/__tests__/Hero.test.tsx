import React from "react";
import { test, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";

// Import components under test exactly as they will be implemented.
import Hero from "../components/Hero";
import LandingPage from "../pages/LandingPage";

// TP-001 / AC-1
test("Hero renders the library name inside the only h1", () => {
  // Render the Hero with an explicit name and description.
  render(<Hero name="MyLibrary" description="A concise one-line description." />);

  // There must be exactly one top-level h1 for the component.
  const h1s = screen.getAllByRole("heading", { level: 1 });
  expect(h1s.length).toBe(1);

  // The h1 must contain the provided name.
  expect(h1s[0].textContent).toBe("MyLibrary");
});

// TP-002 / AC-2
test("LandingPage includes the hero description beneath the name", () => {
  // Render the page shell which should include the hero.
  render(<LandingPage />);

  // The page must expose a banner landmark containing the hero.
  const banner = screen.getByRole("banner");
  const heading = within(banner).getByRole("heading", { level: 1 });

  // The expected one-line description that the hero should render beneath the name.
  const expectedDescription = "A concise one-line description.";

  // The banner's text should include the description (i.e. the description is present beneath the name).
  const bannerText = banner.textContent ?? "";
  expect(bannerText).toContain(expectedDescription);

  // Also assert the description text element exists within the banner and is not the h1 itself.
  const descElement = within(banner).getByText(expectedDescription);
  expect(descElement).toBeTruthy();
  expect(descElement).not.toBe(heading);
});
