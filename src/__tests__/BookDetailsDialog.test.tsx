import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import BookShelf from '../components/BookShelf';
import { BOOKS } from '../data/books';

// jsdom does not implement showModal/close; stub them so dialog.open attribute is managed
beforeAll(() => {
  if (!('showModal' in HTMLDialogElement.prototype)) {
    // @ts-ignore
    HTMLDialogElement.prototype.showModal = function () {
      this.setAttribute('open', '');
    };
  }
  if (!('close' in HTMLDialogElement.prototype)) {
    // @ts-ignore
    HTMLDialogElement.prototype.close = function () {
      this.removeAttribute('open');
      const ev = new Event('close');
      this.dispatchEvent(ev);
    };
  }
});

test('activating a book opens a dialog named by the book title and shows details', async () => {
  render(<BookShelf books={BOOKS} />);
  const first = BOOKS[0];

  // find the button by accessible name (book title)
  const btn = screen.getByRole('button', { name: first.title });
  fireEvent.click(btn);

  // dialog should be in the document with aria-labelledby pointing at the title
  const dialog = screen.getByRole('dialog');
  const labelledby = dialog.getAttribute('aria-labelledby');
  const title = document.getElementById(labelledby || '');
  expect(title).toBeTruthy();
  expect(title?.textContent).toBe(first.title);

  // cover image present
  const img = within(dialog).getByRole('img', { name: first.title });
  expect(img).toBeTruthy();

  // author text present
  expect(within(dialog).getByText(first.author)).toBeTruthy();

  // genre pill present
  expect(within(dialog).getByText(first.genre)).toBeTruthy();

  // availability text
  const availText = first.available ? 'Available to borrow' : 'On loan';
  expect(within(dialog).getByText(availText)).toBeTruthy();
});

test('close button closes dialog and returns focus to opener; escape also closes', async () => {
  render(<BookShelf books={BOOKS} />);
  const first = BOOKS[1];
  const btn = screen.getByRole('button', { name: first.title });
  fireEvent.click(btn);
  const dialog = screen.getByRole('dialog');

  // close button
  const close = within(dialog).getByRole('button', { name: 'Close' });
  fireEvent.click(close);
  // dialog should be removed
  expect(dialog.hasAttribute('open')).toBe(false);
  // focus should return to opener
  expect(document.activeElement).toBe(btn);

  // open again to test Escape
  fireEvent.click(btn);
  const dialog2 = screen.getByRole('dialog');
  fireEvent.keyDown(dialog2, { key: 'Escape', code: 'Escape' });
  expect(dialog2.hasAttribute('open')).toBe(false);
  expect(document.activeElement).toBe(btn);
});
