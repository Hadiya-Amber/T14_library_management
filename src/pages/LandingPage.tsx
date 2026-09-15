/**
 * Landing page shell for the Library Management app.
 *
 * Provides semantic landmarks: header, main and footer.
 */
import React from "react";
import styles from "./LandingPage.module.css";
import Hero from "../components/Hero";
import CatalogueCta from "../components/CatalogueCta";
import OpeningHours from "../components/OpeningHours";

/** Default seven-day schedule for the library */
const DEFAULT_SCHEDULE = [
  { day: "Sunday", hours: "Closed", opens: null, closes: null },
  { day: "Monday", hours: "09:00–17:00", opens: "09:00", closes: "17:00" },
  { day: "Tuesday", hours: "09:00–17:00", opens: "09:00", closes: "17:00" },
  { day: "Wednesday", hours: "09:00–17:00", opens: "09:00", closes: "17:00" },
  { day: "Thursday", hours: "09:00–17:00", opens: "09:00", closes: "17:00" },
  { day: "Friday", hours: "09:00–17:00", opens: "09:00", closes: "17:00" },
  { day: "Saturday", hours: "10:00–16:00", opens: "10:00", closes: "16:00" },
];

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
        <div className={styles.content}>
          <div className={styles.heroSection}>
            <p className={styles.welcome}>Welcome to the library.</p>
            <CatalogueCta />
          </div>
          <OpeningHours schedule={DEFAULT_SCHEDULE} now={new Date()} />
        </div>
      </main>

      <footer className={styles.footer} role="contentinfo">
        <small>© Library</small>
      </footer>
    </div>
  );
}
