import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';

// Import components under test. These paths match the repository's declared implementation paths.
import NavBar from '../src/components/NavBar';
import LandingPage from '../src/pages/LandingPage';

describe('NavBar component', () => {
  it("renders as a navigation landmark containing the text 'Indian National Library'", () => {
    render(<NavBar />);

    // Assert there is a navigation landmark
    const nav = screen.getByRole('navigation');
    expect(nav).toBeInTheDocument();

    // And that it contains the wordmark text
    expect(nav).toHaveTextContent('Indian National Library');
  });

  it('contains links labelled Catalogue, Books, About and Contact', () => {
    render(<NavBar />);

    // Each named link must be present as an accessible link
    expect(screen.getByRole('link', { name: 'Catalogue' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Books' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'About' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Contact' })).toBeInTheDocument();
  });
});

describe('LandingPage integration', () => {
  it("renders navigation carrying data-animation='fade-down'", () => {
    render(<LandingPage />);

    const nav = screen.getByRole('navigation');
    expect(nav).toBeInTheDocument();
    expect(nav).toHaveAttribute('data-animation', 'fade-down');
  });
});
