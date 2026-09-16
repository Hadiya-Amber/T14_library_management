import React from "react";
import { render, screen, within } from "@testing-library/react";
import "@testing-library/jest-dom";
import BookShelf from "../components/BookShelf";

const BOOKS = [
  { id: "1", title: "The Odyssey", author: "Homer", cover: "/covers/odyssey.jpg" },
  { id: "2", title: "Pride and Prejudice", author: "Jane Austen", cover: "/covers/pride.jpg" },
  { id: "3", title: "Invisible Man", author: "Ralph Ellison", cover: "/covers/invisible.jpg" }
];

test("BookShelf renders one article per book with image alt, title and author", () => {
  render(<BookShelf books={BOOKS} />);

  const articles = screen.getAllByRole("article");
  expect(articles).toHaveLength(BOOKS.length);

  BOOKS.forEach((book, index) => {
    const article = articles[index];

    // each article contains an image whose accessible name (alt) matches the book title
    const img = within(article).getByRole("img", { name: book.title });
    expect(img).toBeInTheDocument();

    // title text is present inside the article
    expect(within(article).getByText(book.title)).toBeInTheDocument();

    // author text is present inside the article
    expect(within(article).getByText(book.author)).toBeInTheDocument();
  });
});

test("scrolling container is a region named 'Featured books' with tabIndex 0", () => {
  render(<BookShelf books={BOOKS} />);

  const region = screen.getByRole("region", { name: "Featured books" });
  expect(region).toBeInTheDocument();

  // tabindex in the DOM is lowercase 'tabindex'
  expect(region).toHaveAttribute("tabindex", "0");
});

test("shelf element carries data-animation=\"marquee\"", () => {
  render(<BookShelf books={BOOKS} />);

  const region = screen.getByRole("region", { name: "Featured books" });
  expect(region).toBeInTheDocument();

  expect(region).toHaveAttribute("data-animation", "marquee");
});
