import React from "react";
import styles from "./AboutLibrary.module.css";

export interface AboutLibraryProps {
  foundedYear: number;
  now: Date;
}

/**
 * AboutLibrary renders a short description of the library and three stat blocks.
 */
export default function AboutLibrary({ foundedYear, now }: AboutLibraryProps): JSX.Element {
  const age = Math.max(0, now.getFullYear() - foundedYear);

  return (
    <section className={styles.about} aria-label="About the library" data-animation="rise">
      <div className={styles.inner}>
        <div className={styles.copy}>
          <p>
            The Indian National Library preserves a rich collection of Indian
            literature and historical works, serving researchers, students and
            readers since its founding.
          </p>
        </div>

        <div className={styles.stats}>
          <div className={styles.stat}>
            <div className={styles.value}>{foundedYear}</div>
            <div className={styles.label}>Founded</div>
          </div>

          <div className={styles.stat}>
            <div className={styles.value}>{age} years</div>
          </div>

          <div className={styles.stat}>
            <div className={styles.value}>120k+</div>
            <div className={styles.label}>Items</div>
          </div>
        </div>
      </div>
    </section>
  );
}
