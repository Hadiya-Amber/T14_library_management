/**
 * BookDetailsDialog
 *
 * Renders a native <dialog> element showing a book's full details.
 */

import React, { useEffect, useRef } from "react";
import styles from "./BookDetailsDialog.module.css";

export interface Book {
  id: string;
  title: string;
  author: string;
  cover: string;
  genre: string;
  available: boolean;
}

export interface BookDetailsDialogProps {
  book: Book | null;
  openerRef?: React.RefObject<HTMLElement>;
  onClose: () => void;
}

/**
 * BookDetailsDialog component
 *
 * Renders a native HTML <dialog> showing the provided book's details. The
 * dialog is labelled by the book title (aria-labelledby) so assistive
 * technologies announce the book's title as the dialog name. When closed,
 * the provided onClose callback is invoked and focus is returned to the
 * opener element (if given) so keyboard users regain their place.
 */
export default function BookDetailsDialog({ book, openerRef, onClose }: BookDetailsDialogProps) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const imgError = useRef(false);

  useEffect(() => {
    const dlg = dialogRef.current;
    if (!dlg) return;
    function handleClose() {
      onClose();
      // return focus to opener
      if (openerRef && openerRef.current && (openerRef.current as HTMLElement).focus) {
        (openerRef.current as HTMLElement).focus();
      }
    }
    dlg.addEventListener("close", handleClose);
    return () => dlg.removeEventListener("close", handleClose);
  }, [onClose, openerRef]);

  function closeDialog() {
    const dlg = dialogRef.current;
    if (!dlg) return;
    if (typeof dlg.close === 'function') {
      dlg.close();
    } else {
      // emulate close for environments without dialog.close
      dlg.removeAttribute('open');
      const ev = new Event('close');
      dlg.dispatchEvent(ev);
    }
  }

  useEffect(() => {
    const dlg = dialogRef.current;
    if (!dlg) return;
    if (book) {
      // showModal may be missing in jsdom; guard call
      if (typeof dlg.showModal === "function") dlg.showModal();
      else dlg.setAttribute("open", "");
    } else {
      if (typeof dlg.close === "function") dlg.close();
      else dlg.removeAttribute("open");
    }
  }, [book]);

  if (!book) return null;

  return (
    <dialog
      ref={dialogRef}
      className={styles.panel}
      aria-labelledby={`book-title-${book.id}`}
      data-animation="dialog"
      onKeyDown={(e) => { if (e.key === 'Escape') closeDialog(); }}
    >
      <button className={styles.closeBtn} aria-label="Close" onClick={() => closeDialog()}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
          <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <div className={styles.content}>
        <div className={styles.coverArea}>
          <img
            className={styles.coverImage}
            src={book.cover}
            alt={book.title}
            onError={() => {
              imgError.current = true;
            }}
          />
        </div>
        <div className={styles.details}>
          <h2 id={`book-title-${book.id}`} className={styles.title}>{book.title}</h2>
          <p className={styles.meta}>{book.author}</p>
          <p className={styles.meta}>{book.year ?? new Date().getFullYear()}</p>
          <div className={styles.pill} aria-hidden>{book.genre}</div>
          <p className={styles.availability}>{book.available ? 'Available to borrow' : 'On loan'}</p>
        </div>
      </div>
    </dialog>
  );
}
