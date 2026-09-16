import React from "react";
import styles from "./Footer.module.css";

/**
 * Footer is the site's contentinfo landmark containing contact details and
 * navigation links. It intentionally uses an address element for the postal
 * address and provides mailto: and tel: links for contact.
 */
export default function Footer(): JSX.Element {
  return (
    <footer className={styles.footer} role="contentinfo" data-animation="rise">
      <div className={styles.inner}>
        <address className={styles.address}>
          Indian National Library<br />
          91 National Library Avenue<br />
          Kolkata, 700071
        </address>

        <div className={styles.contact}>
          <a href="mailto:contact@indiannational.library">contact@indiannational.library</a>
          <br />
          <a href="tel:+913312345678">+91 33 1234 5678</a>
        </div>

        <div className={styles.nav} aria-label="Footer">
          <ul role="list">
            <li>
              <a href="#catalogue">Catalogue</a>
            </li>
            <li>
              <a href="#about">About</a>
            </li>
            <li>
              <a href="#contact">Contact</a>
            </li>
          </ul>
        </div>
      </div>

      <div className={styles.copy}>
        <small>© Indian National Library</small>
      </div>
    </footer>
  );
}
