import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import BookShelf from "../components/BookShelf";
import { fetchBooks } from "../data/booksApi";

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe("BookShelf API integration", () => {
  it("renders only API-returned titles and no offline notice when /books resolves", async () => {
    globalThis.fetch = vi.fn(async () => ({
      ok: true,
      json: async () => [
        { id: "api-1", title: "API Title One", author: "Author One", cover: "/covers/api-1.jpg" },
        { id: "api-2", title: "API Title Two", author: "Author Two", cover: "/covers/api-2.jpg" }
      ]
    })) as unknown as typeof fetch;

    const { container } = render(<BookShelf books={[]} />);

    await screen.findByRole("heading", { name: "API Title One" });
    await screen.findByRole("heading", { name: "API Title Two" });

    const shelf = container.querySelector('[aria-label="Featured books"]');
    expect(shelf).not.toBeNull();

    const headings = within(shelf as HTMLElement).getAllByRole("heading", { level: 3 });
    expect(headings).toHaveLength(2);
    expect(headings.map((h) => h.textContent)).toEqual(["API Title One", "API Title Two"]);

    expect(screen.queryByText("Showing the offline catalogue")).toBeNull();
  });

  it("falls back to bundled catalogue with polite offline notice when fetch rejects", async () => {
    globalThis.fetch = vi.fn(async () => {
      throw new Error("network down");
    }) as unknown as typeof fetch;

    const { container } = render(<BookShelf books={[]} />);

    await screen.findByText("Showing the offline catalogue");

    const liveRegion = container.querySelector('[aria-live="polite"]');
    expect(liveRegion).not.toBeNull();
    expect(liveRegion?.textContent).toContain("Showing the offline catalogue");

    const shelf = container.querySelector('[aria-label="Featured books"]');
    expect(shelf).not.toBeNull();

    const headings = within(shelf as HTMLElement).getAllByRole("heading", { level: 3 });
    expect(headings).toHaveLength(6);
  });

  it("uses 3000ms timeout to transition to offline fallback when fetch never settles", async () => {
    vi.useFakeTimers();

    globalThis.fetch = vi.fn(() => new Promise(() => {})) as unknown as typeof fetch;

    const { container } = render(<BookShelf books={[]} />);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(3000);
    });

    const liveRegion = container.querySelector('[aria-live="polite"]');
    expect(liveRegion).not.toBeNull();
    expect(liveRegion?.textContent).toContain("Showing the offline catalogue");

    const shelf = container.querySelector('[aria-label="Featured books"]');
    expect(shelf).not.toBeNull();

    const headings = within(shelf as HTMLElement).getAllByRole("heading", { level: 3 });
    expect(headings).toHaveLength(6);
  });

  it("announces loading in polite live region and applies loading min-height class on first render", () => {
    globalThis.fetch = vi.fn(() => new Promise(() => {})) as unknown as typeof fetch;

    const { container } = render(<BookShelf books={[]} />);

    const liveRegion = container.querySelector('[aria-live="polite"]');
    expect(liveRegion).not.toBeNull();
    expect(liveRegion?.textContent).toContain("Loading the catalogue");

    const shelf = container.querySelector('[aria-label="Featured books"]');
    expect(shelf).not.toBeNull();
    expect((shelf as HTMLElement).className).toMatch(/loading/i);
  });

  it("maps missing cover to empty string and renders cover placeholder fallback behavior", async () => {
    globalThis.fetch = vi.fn(async () => ({
      ok: true,
      json: async () => [
        { id: "api-missing-cover", title: "No Cover API Book", author: "Author Missing Cover" }
      ]
    })) as unknown as typeof fetch;

    const mapped = await fetchBooks();
    expect(mapped).toHaveLength(1);
    expect(mapped[0].cover).toBe("");

    render(<BookShelf books={mapped} />);

    const cardButton = screen.getByRole("button", { name: "No Cover API Book" });
    const image = within(cardButton).getByRole("img", { name: "No Cover API Book" });

    await act(async () => {
      fireEvent.error(image);
    });

    expect(within(cardButton).queryByRole("img", { name: "No Cover API Book" })).toBeNull();
    expect(within(cardButton).getAllByText("No Cover API Book")).toHaveLength(2);
  });
});
