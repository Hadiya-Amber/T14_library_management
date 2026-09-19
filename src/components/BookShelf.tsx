/**
 * BookShelf component - a horizontally scrolling shelf of book cards.
 *
 * Uses live catalogue data from the API, while preserving the existing
 * shelf card markup, motion, and details dialog behavior.
 */

import React, { useEffect, useRef, useState } from "react";
import styles from "./BookShelf.module.css";
import BookDetailsDialog, { type Book as DetailBook } from "./BookDetailsDialog";
import { BOOKS } from "../data/books";
import { fetchBooks } from "../data/booksApi";

/** Shelf card shape consumed by the list renderer. */
export interface Book {
  /** Unique identifier for the book. */
  id: string;
  /** Book title. */
  title: string;
  /** Book author. */
  author: string;
  /** Cover image URL. */
  cover: string;
  /** Optional genre used by the dialog. */
  genre?: string;
  /** Optional availability flag used by the dialog. */
  available?: boolean;
  /** Optional publication year used by the dialog. */
  year?: number;
}

/** Props for the BookShelf component. */
export interface BookShelfProps {
  /** Initial array of books to display before API settles. */
  books: Book[];
}

type ShelfState = "loading" | "live" | "offline";

const OFFLINE_BOOKS: Book[] = BOOKS.slice(0, 6);

/**
 * Converts shelf book data into the detail dialog shape.
 *
 * @param book - Shelf item.
 * @returns Dialog-compatible book with safe defaults.
 */
function toDetailBook(book: Book): DetailBook {
  return {
    id: book.id,
    title: book.title,
    author: book.author,
    cover: book.cover,
    genre: book.genre ?? "General",
    available: book.available ?? false,
    year: book.year,
  };
}

/**
 * BookShelf component.
 *
 * @param books - Initial books.
 * @returns Rendered shelf and dialog.
 */
export default function BookShelf({ books }: BookShelfProps): JSX.Element {
  const [selected, setSelected] = useState<DetailBook | null>(null);
  const [state, setState] = useState<ShelfState>("loading");
  const [shelfBooks, setShelfBooks] = useState<Book[]>(books);
  const openerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const abortController = new AbortController();
    let active = true;

    fetchBooks(abortController.signal)
      .then((apiBooks) => {
        if (!active) {
          return;
        }
        setShelfBooks(apiBooks);
        setState("live");
      })
      .catch(() => {
        if (!active) {
          return;
        }
        setShelfBooks(OFFLINE_BOOKS);
        setState("offline");
      });

    return () => {
      active = false;
      abortController.abort();
    };
  }, []);

  return (
    <>
      {state === "loading" && (
        <p className={styles.statusLine} aria-live="polite">
          <span className={styles.statusDot} aria-hidden="true" />
          Loading the catalogue
        </p>
      )}

      {state === "offline" && (
        <p className={styles.statusLine} aria-live="polite">
          <span className={styles.statusDot} aria-hidden="true" />
          Showing the offline catalogue
        </p>
      )}

      <section
        className={state === "loading" ? `${styles.shelf} ${styles.shelfLoading}` : styles.shelf}
        aria-label="Featured books"
        tabIndex={0}
        data-animation="marquee"
      >
        <div className={styles.scrollContainer} role="list">
          {shelfBooks.map((book) => (
            <BookCard
              key={`first-${book.id}`}
              book={book}
              onOpen={(el) => {
                openerRef.current = el;
                setSelected(toDetailBook(book));
              }}
            />
          ))}
          <div aria-hidden="true" style={{ display: "contents" }}>
            {shelfBooks.map((book) => (
              <BookCard
                key={`second-${book.id}`}
                book={book}
                onOpen={(el) => {
                  openerRef.current = el;
                  setSelected(toDetailBook(book));
                }}
              />
            ))}
          </div>
        </div>
        <BookDetailsDialog book={selected} openerRef={openerRef} onClose={() => setSelected(null)} />
      </section>
    </>
  );
}

/**
 * Individual book card component.
 *
 * @param params - Card props.
 * @returns Rendered card.
 */
function BookCard({ book, onOpen }: { book: Book; onOpen?: (el: HTMLElement) => void }): JSX.Element {
  const [imageError, setImageError] = useState(false);

  return (
    <article className={styles.card}>
      <button
        className={styles.cardButton}
        onClick={(e) => {
          e.currentTarget.blur();
          if (onOpen) {
            onOpen(e.currentTarget);
          }
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.currentTarget.click();
          }
        }}
        aria-label={book.title}
      >
        <div className={styles.coverArea}>
          {!imageError && (
            <img
              className={styles.coverImage}
              src={book.cover}
              alt={book.title}
              onError={() => setImageError(true)}
            />
          )}
          {imageError && (
            <div className={styles.coverPlaceholder}>
              <span className={styles.placeholderTitle}>{book.title}</span>
            </div>
          )}
        </div>
        <div className={styles.cardContent}>
          <h3 className={styles.title}>{book.title}</h3>
          <p className={styles.author}>{book.author}</p>
        </div>
      </button>
    </article>
  );
}
