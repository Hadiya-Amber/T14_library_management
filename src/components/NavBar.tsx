/**
 * Navigation bar component for the Library Management application.
 *
 * Provides a sticky navigation landmark with the library wordmark and
 * links to the four main sections of the site.
 */
import React from "react";
import styles from "./NavBar.module.css";

/**
 * NavBar renders the site navigation.
 *
 * @returns JSX.Element navigation landmark with wordmark and links
 */
export default function NavBar(): JSX.Element {
  return (
    <nav className={styles.navbar} data-animation="fade-down" aria-label="Main">
      <div className={styles.inner}>
        <span className={styles.wordmark}>Indian National Library</span>
        <ul className={styles.links} role="list">
          <li>
            <a href="#catalogue" className={styles.link}>
              Catalogue
            </a>
          </li>
          <li>
            <a href="#books" className={styles.link}>
              Books
            </a>
          </li>
          <li>
            <a href="#about" className={styles.link}>
              About
            </a>
          </li>
          <li>
            <a href="#contact" className={styles.link}>
              Contact
            </a>
          </li>
        </ul>
      </div>
    </nav>
  );
}
