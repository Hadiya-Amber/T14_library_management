/**
 * MembershipNotice component
 *
 * Renders a brief membership notice beneath the landing hero.
 */
import React from "react";
import styles from "./MembershipNotice.module.css";

/**
 * MembershipNotice is a presentational component that renders a region
 * landmark labelled "Membership" containing a heading and a single-line
 * paragraph announcing that membership is free for residents.
 *
 * This component has no props; the copy is fixed by design.
 */
export default function MembershipNotice(): JSX.Element {
  return (
    <section className={styles.notice} aria-label="Membership">
      <p className={styles.line}>Membership is free for all residents</p>
    </section>
  );
}
