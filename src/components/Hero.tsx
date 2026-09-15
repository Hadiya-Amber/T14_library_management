import React from 'react';
import styles from './Hero.module.css';

/**
 * Props for the Hero component.
 */
export interface HeroProps {
  /** The library or site name shown as the single page H1. */
  name: string;
  /** A short one-line description shown beneath the name. */
  description: string;
}

/**
 * Presentational hero shown at the top of the landing page.
 * Renders a single <h1> containing the provided `name` and
 * a description paragraph immediately following it.
 */
export default function Hero({ name, description }: HeroProps) {
  return (
    <section className={styles.hero} aria-label="Hero">
      <h1 className={styles.title}>{name}</h1>
      <p className={styles.description}>{description}</p>
    </section>
  );
}
