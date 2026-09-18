import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen, within, fireEvent } from "@testing-library/react";
import LandingPage from "../src/pages/LandingPage";
import { BOOKS } from "../src/data/books";

function getExpectedYear(book: any): string {
  const value = book.year ?? book.publishedYear ?? book.publicationYear;
  if (value === undefined || value === null) {
    throw new Error("Selected book is missing a year field (year/publishedYear/publicationYear).");
  }
  return String(value);
}

function getExpectedGenre(book: any): string {
  const value = book.genre ?? book.category;
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error("Selected book is missing a genre/category field.");
  }
  return value;
}

function getExpectedAvailabilityText(book: any): "Available to borrow" | "On loan" {
  if (book.availability === "Available to borrow" || book.availability === "On loan") {
    return book.availability;
  }

  if (typeof book.available === "boolean") {
    return book.available ? "Available to borrow" : "On loan";
  }

  if (typeof book.isAvailable === "boolean") {
    return book.isAvailable ? "Available to borrow" : "On loan";
  }

  throw new Error(
    "Selected book is missing availability as either exact text or a boolean field (available/isAvailable)."
  );
}

describe("Book details dialog integration through LandingPage", () => {
  it("opens a dialog named with the selected title when a featured book opener is clicked", () => {
    const selectedBook = BOOKS[0] as any;

    render(<LandingPage />);

    const opener = screen.getByRole("button", { name: selectedBook.title });
    fireEvent.click(opener);

    const dialog = screen.getByRole("dialog", { name: selectedBook.title });
    expect(dialog).toBeTruthy();
  });

  it("opens a dialog named with the selected title when the focused opener is activated with Enter", () => {
    const selectedBook = BOOKS[1] as any;

    render(<LandingPage />);

    const opener = screen.getByRole("button", { name: selectedBook.title });
    opener.focus();
    fireEvent.keyDown(opener, { key: "Enter", code: "Enter", charCode: 13 });
    fireEvent.keyUp(opener, { key: "Enter", code: "Enter", charCode: 13 });

    const dialog = screen.getByRole("dialog", { name: selectedBook.title });
    expect(dialog).toBeTruthy();
  });

  it("shows selected cover, author, year, genre, and exact selected availability text", () => {
    const selectedBook = BOOKS[2] as any;
    const expectedYear = getExpectedYear(selectedBook);
    const expectedGenre = getExpectedGenre(selectedBook);
    const expectedAvailability = getExpectedAvailabilityText(selectedBook);

    render(<LandingPage />);

    const opener = screen.getByRole("button", { name: selectedBook.title });
    fireEvent.click(opener);

    const dialog = screen.getByRole("dialog", { name: selectedBook.title });
    const inDialog = within(dialog);

    const cover = inDialog.getByRole("img", { name: selectedBook.title });
    expect(cover.getAttribute("src")).toBe(selectedBook.cover);

    expect(inDialog.getByText(selectedBook.author)).toBeTruthy();
    expect(inDialog.getByText(expectedYear)).toBeTruthy();
    expect(inDialog.getByText(expectedGenre)).toBeTruthy();
    expect(inDialog.getByText(expectedAvailability)).toBeTruthy();
  });

  it("closes on Escape and close button, returning focus to the same opener", () => {
    const selectedBook = BOOKS[3] as any;

    render(<LandingPage />);

    const opener = screen.getByRole("button", { name: selectedBook.title });

    fireEvent.click(opener);
    const openedDialog = screen.getByRole("dialog", { name: selectedBook.title });

    fireEvent.keyDown(openedDialog, { key: "Escape", code: "Escape" });

    expect(screen.queryByRole("dialog", { name: selectedBook.title })).toBeNull();
    expect(document.activeElement).toBe(opener);

    fireEvent.click(opener);
    const reopenedDialog = screen.getByRole("dialog", { name: selectedBook.title });
    const closeButton = within(reopenedDialog).getByRole("button", { name: /close/i });

    fireEvent.click(closeButton);

    expect(screen.queryByRole("dialog", { name: selectedBook.title })).toBeNull();
    expect(document.activeElement).toBe(opener);
  });
});
