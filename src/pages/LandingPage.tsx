/**
 * LandingPage - presentational shell for the library landing page.
 *
 * Exposes semantic regions: header, main and footer.
 */
import React from 'react'
import styles from './LandingPage.module.css'

/**
 * LandingPage is the presentational shell for the site's landing page.
 *
 * It exposes the semantic regions required by accessibility and the
 * application: header (banner), main (main) and footer (contentinfo).
 *
 * @returns JSX.Element - the rendered landing page
 */
export default function LandingPage(): JSX.Element {
  return (
    <div className={styles.container}>
      <header className={styles.header} role="banner">
        <h1 className={styles.title}>Library Management</h1>
      </header>
      <main className={styles.main} role="main">
        <p>Welcome to the library.</p>
      </main>
      <footer className={styles.footer} role="contentinfo">
        <small>© Library</small>
      </footer>
    </div>
  )
}
