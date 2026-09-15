import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Hero from '../components/Hero';
import LandingPage from '../pages/LandingPage';

describe('Hero component', () => {
  it('renders exactly one h1 containing the provided name', () => {
    const name = 'My Library';
    const { container } = render(<Hero name={name} description="Some description" />);

    const h1s = container.querySelectorAll('h1');
    expect(h1s.length).toBe(1);

    const h1 = h1s[0];
    expect(h1.textContent).toBe(name);
  });
});

describe('LandingPage hero', () => {
  it('renders the hero description beneath the name', () => {
    const { container } = render(<LandingPage />);

    const h1 = container.querySelector('h1');
    expect(h1).not.toBeNull();

    // The description should be present beneath the h1 in the DOM order.
    const descElement = h1!.nextElementSibling;
    expect(descElement).not.toBeNull();

    const descText = (descElement!.textContent || '').trim();
    // Description must be non-empty and distinct from the heading text.
    expect(descText.length).toBeGreaterThan(0);
    expect(descText).not.toBe((h1!.textContent || '').trim());
  });
});
