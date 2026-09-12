import React from 'react'
import styles from './LandingPage.module.css'

/**
 * LandingPage - a minimal scaffold for the Library Management landing page.
 *
 * This component intentionally uses semantic elements so tests can
 * assert the presence of header, main and footer regions.
 */
export default function LandingPage(): JSX.Element {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Library Management</h1>
      </header>

      <main className={styles.main}>
        <p>Welcome to the library. This is a scaffold for the landing page.</p>
      </main>

      <footer className={styles.footer}>
        <small>© Library Management</small>
      </footer>
    </div>
  )
}
