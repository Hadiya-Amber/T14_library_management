import React from "react";
import { render, screen, within } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import AboutLibrary from "../components/AboutLibrary";
import Footer from "../components/Footer";
import LandingPage from "../pages/LandingPage";

describe("AboutLibrary and Footer integration", () => {
  it("renders founding year and computes age when given a fixed now (AC-1)", () => {
    const now = new Date("2026-01-01T00:00:00Z");

    render(<AboutLibrary foundedYear={1836} now={now} />);

    expect(screen.getByText(/1836/)).toBeTruthy();
    expect(screen.getByText(/190\s*years?/i)).toBeTruthy();
  });

  it("footer is a contentinfo landmark and contains postal address, mailto and tel links (AC-2)", () => {
    render(<Footer />);

    const footer = screen.getByRole("contentinfo");
    expect(footer).toBeTruthy();

    const addressEl = footer.querySelector("address");
    expect(addressEl).toBeTruthy();

    const mailAnchor = footer.querySelector("a[href^=\"mailto:\"]");
    expect(mailAnchor).toBeTruthy();

    const telAnchor = footer.querySelector("a[href^=\"tel:\"]");
    expect(telAnchor).toBeTruthy();
  });

  it("landing page's about and footer sections carry data-animation='rise' (AC-3)", () => {
    render(<LandingPage />);

    const footer = screen.getByRole("contentinfo");
    expect(footer.getAttribute("data-animation")).toBe("rise");

    const main = screen.getByRole("main");
    const animatedInMain = main.querySelector("[data-animation=\"rise\"]");
    expect(animatedInMain).toBeTruthy();
  });

  it("main has a single direct child data-layout='shell' and hero, book shelf, opening-hours and about are descendants (AC-4)", () => {
    render(<LandingPage />);

    const main = screen.getByRole("main");
    const directChildren = Array.from(main.children).filter((n) => n.nodeType === Node.ELEMENT_NODE);
    expect(directChildren.length).toBe(1);

    const shell = directChildren[0];
    expect(shell.getAttribute("data-layout")).toBe("shell");

    const heroText = within(shell).getByText(/Welcome to the library\./i);
    expect(heroText).toBeTruthy();

    const listInShell = shell.querySelector("ul, ol") || within(shell).queryByRole("list");
    expect(listInShell).toBeTruthy();

    const monday = within(shell).queryByText(/Monday/);
    expect(monday).toBeTruthy();

    const aboutInShell = shell.querySelector("[data-animation=\"rise\"]");
    expect(aboutInShell).toBeTruthy();
  });
});
