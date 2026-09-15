/**
 * Primary call-to-action for the landing page.
 *
 * Renders a plain anchor linking to /catalogue. Styling is provided by a CSS
 * module which defines a visible :focus-visible outline to satisfy accessibility
 * requirements.
 */
import React from "react";
import styles from "./CatalogueCta.module.css";

/** CatalogueCta renders a single anchor that navigates to the catalogue. */
export default function CatalogueCta(): JSX.Element {
  return (
    <a className={styles.cta} href="/catalogue">
      Browse the catalogue
    </a>
  );
}
