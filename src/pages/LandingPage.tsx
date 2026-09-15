import React from 'react';
import Hero from '../components/Hero';

/**
 * The site's landing page.
 * Renders the Hero component in the header region.
 */
export default function LandingPage(): JSX.Element {
  const name = 'Hadiya Public Library';
  const description = 'A welcoming community library offering books, events, and digital resources.';

  return (
    <main>
      <header>
        <Hero name={name} description={description} />
      </header>
    </main>
  );
}
