/**
 * Landing page shell for the Library Management app.
 *
 * Provides semantic landmarks: header, main and footer.
 */
import React from "react";
import styles from "./LandingPage.module.css";
import Hero from "../components/Hero";

/**
 * LandingPage is the public-facing page for the application.
 *
 * It provides the semantic regions required by accessibility and tests:
 * header (banner), main and footer (contentinfo).
 *
 * @returns JSX.Element landing page markup
 */
export default function LandingPage(): JSX.Element {
  return (
    <div className={styles.container}>
      <header className={styles.header} role="banner">
        <Hero
          name="Library Management"
          description="A concise one-line description."
        />
      </header>

      <main className={styles.main} role="main">
        <p>Welcome to the library.</p>
      </main>

      <footer className={styles.footer} role="contentinfo">
        <small>© Library</small>
      </footer>
    </div>
  );
}
