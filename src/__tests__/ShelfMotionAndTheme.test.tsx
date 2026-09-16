import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import BookShelf from "../components/BookShelf";

const BOOKS = [
  { id: "1", title: "The Odyssey", author: "Homer", cover: "/covers/odyssey.jpg" },
  { id: "2", title: "Pride and Prejudice", author: "Jane Austen", cover: "/covers/pride.jpg" },
  { id: "3", title: "Invisible Man", author: "Ralph Ellison", cover: "/covers/invisible.jpg" }
];

describe("AC-1: BookShelf marquee animation", () => {
  test("shelf element carries data-animation='marquee'", () => {
    render(<BookShelf books={BOOKS} />);

    const region = screen.getByRole("region", { name: "Featured books" });
    expect(region).toBeInTheDocument();
    expect(region).toHaveAttribute("data-animation", "marquee");
  });

  test("scrollContainer element exists within the shelf", () => {
    render(<BookShelf books={BOOKS} />);

    const region = screen.getByRole("region", { name: "Featured books" });
    expect(region).toBeInTheDocument();

    // The scrollContainer has role="list"
    const scrollContainer = screen.getByRole("list");
    expect(scrollContainer).toBeInTheDocument();
    expect(region).toContainElement(scrollContainer);
  });
});

describe("AC-2: Theme font tokens", () => {
  test("theme.css declares --font-display and --font-body tokens", async () => {
    // Read theme.css from disk using dynamic import
    const fs = await import("node:fs");
    const path = await import("node:path");

    const themePath = path.resolve(__dirname, "../styles/theme.css");
    const themeContent = fs.readFileSync(themePath, "utf-8");

    // Assert --font-display is declared
    expect(themeContent).toContain("--font-display");

    // Assert --font-body is declared
    expect(themeContent).toContain("--font-body");

    // Assert they are applied to body and headings
    expect(themeContent).toContain("font-family: var(--font-body)");
    expect(themeContent).toContain("font-family: var(--font-display)");
  });
});

describe("AC-3: Theme teal palette", () => {
  test("theme.css has --accent: #0f766e and no #b45309", async () => {
    const fs = await import("node:fs");
    const path = await import("node:path");

    const themePath = path.resolve(__dirname, "../styles/theme.css");
    const themeContent = fs.readFileSync(themePath, "utf-8");

    // Assert --accent is #0f766e (teal)
    expect(themeContent).toContain("--accent: #0f766e");

    // Assert the old warm accent #b45309 no longer appears
    expect(themeContent).not.toContain("#b45309");
  });
});
