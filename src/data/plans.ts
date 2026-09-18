/**
 * Static membership plan data.
 *
 * Provides the set of plans rendered on the landing page.
 */

/** Membership plan shape */
export interface Plan {
  name: string;
  price: string;
  perks: string[];
  recommended?: boolean;
}

/** Public membership plans shown on the landing page */
export const PLANS: Plan[] = [
  {
    name: "Bronze",
    price: "₹0 / year",
    perks: [
      "Access to reading room",
      "Free events and talks",
      "Newsletter subscription",
    ],
  },
  {
    name: "Gold",
    price: "₹499 / year",
    perks: [
      "Borrow up to 5 books",
      "Priority reservations",
      "Invitations to members-only events",
    ],
    recommended: true,
  },
  {
    name: "Diamond",
    price: "₹999 / year",
    perks: [
      "Borrow up to 10 books",
      "Extended loan periods",
      "Dedicated support line",
    ],
  },
];
