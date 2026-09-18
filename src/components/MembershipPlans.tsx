/**
 * MembershipPlans component
 *
 * Renders the available membership plans as a responsive three-column grid on
 * wide viewports and a single column on small screens.
 */
import React from "react";
import styles from "./MembershipPlans.module.css";
import { PLANS } from "../data/plans";

/**
 * MembershipPlans renders a section containing one card per plan from the
 * PLANS data module. Each card includes the plan name, price, three perks and
 * a call-to-action button. The Gold plan is marked as recommended.
 *
 * @returns JSX.Element membership plans section
 */
export default function MembershipPlans(): JSX.Element {
  return (
    <section id="membership" aria-labelledby="membership-heading">
      <div className={styles.container}>
        <h2 id="membership-heading" className={styles.heading}>
          Membership plans
        </h2>

        <div className={styles.grid}>
          {PLANS.map((plan) => (
            <article key={plan.name} className={styles.card} aria-labelledby={`plan-${plan.name}`}>
              <div className={styles.cardHeader}>
                <h3 id={`plan-${plan.name}`} className={styles.planName}>
                  {plan.name}
                </h3>
                {plan.recommended ? (
                  <span className={styles.pill} aria-hidden>
                    Most popular
                  </span>
                ) : null}
              </div>

              <p className={styles.price}>{plan.price}</p>

              <ul className={styles.perks}>
                {plan.perks.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>

              <div className={styles.actions}>
                <button type="button" className={styles.cta} aria-label={`Get ${plan.name} membership`}>
                  Get {plan.name} membership
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
