/**
 * BookShelf component - a horizontally scrolling shelf of book cards.
 *
 * Renders a region named "Featured books" containing article elements for each book.
 * Each article displays a cover image (with fallback), title, and author.
 * The shelf supports keyboard navigation and has a marquee animation.
 */

import React, { useState, useRef } from "react";
import styles from "./BookShelf.module.css";
import BookDetailsDialog, { Book as DetailBook } from "./BookDetailsDialog";

/** Book data structure */
export interface Book {
  /** Unique identifier for the book */
  id: string;
  /** Book title */
  title: string;
  /** Book author */
  author: string;
  /** Cover image URL */
  cover: string;
}

/** Props for the BookShelf component */
export interface BookShelfProps {
  /** Array of books to display */
  books: Book[];
}

/**
 * BookShelf component.
 *
 * Renders a horizontally scrolling region with book cards.
 * Each card shows a cover image (with gradient placeholder on error),
 * the book title, and author name.
 *
 * @param props - BookShelfProps
 * @returns JSX.Element
 */
export default function BookShelf({ books }: BookShelfProps): JSX.Element {
  const [selected, setSelected] = useState<DetailBook | null>(null);
  const openerRef = useRef<HTMLElement | null>(null);

  return (
    <section
      className={styles.shelf}
      aria-label="Featured books"
      tabIndex={0}
      data-animation="marquee"
    >
      <div className={styles.scrollContainer} role="list">
        {/* First copy of books - visible to assistive technology */}
        {books.map((book) => (
          <BookCard key={`first-${book.id}`} book={book} onOpen={(el) => { openerRef.current = el; setSelected(book as DetailBook); }} />
        ))}
        {/* Second copy of books - hidden from assistive technology for seamless loop */}
        <div aria-hidden="true" style={{ display: 'contents' }}>
          {books.map((book) => (
            <BookCard key={`second-${book.id}`} book={book} onOpen={(el) => { openerRef.current = el; setSelected(book as DetailBook); }} />
          ))}
        </div>
      </div>
      <BookDetailsDialog book={selected} openerRef={openerRef} onClose={() => setSelected(null)} />
    </section>
  );
}

/**
 * Individual book card component.
 *
 * @param props - Object containing the book data
 * @returns JSX.Element
 */
function BookCard({ book, onOpen }: { book: Book; onOpen?: (el: HTMLElement) => void }): JSX.Element {
  const [imageError, setImageError] = useState(false);

  return (
    <article className={styles.card}>
      <button
        className={styles.cardButton}
        onClick={(e) => { e.currentTarget.blur(); if (onOpen) onOpen(e.currentTarget); }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
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
