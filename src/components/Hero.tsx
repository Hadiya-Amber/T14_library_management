/**
 * Hero component for the landing page.
 *
 * Renders a single h1 containing the library name and a short description
 * paragraph beneath it. Styles are localized via CSS modules.
 */
import React from "react";
import styles from "./Hero.module.css";

export interface HeroProps {
  /** The library name to show in the single h1. */
  name: string;
  /** A concise one-line description shown beneath the name. */
  description: string;
}

/**
 * Presentational hero component.
 *
 * The component guarantees it renders exactly one h1 for the provided name.
 */
export default function Hero({ name, description }: HeroProps): JSX.Element {
  return (
    <div className={styles.hero}>
      <h1>{name}</h1>
      <p className={styles.description}>{description}</p>
    </div>
  );
}
