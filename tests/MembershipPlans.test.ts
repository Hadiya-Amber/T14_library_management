import React from 'react';
import { render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import LandingPage from '../src/pages/LandingPage';
import MembershipPlans from '../src/components/MembershipPlans';

import { describe, it, expect } from 'vitest';

describe('Membership plans - Landing page and component', () => {
  it('AC-1: navigation contains Membership link to #membership and section with name "Membership plans" and id "membership" exists', () => {
    // Render the landing page shell
    render(React.createElement(LandingPage));

    // Navigation must include a link named "Membership" that points to "#membership"
    const membershipLink = screen.getByRole('link', { name: 'Membership' });
    expect(membershipLink).toBeInTheDocument();
    // Use getAttribute to avoid resolved absolute URLs in JSDOM
    expect(membershipLink.getAttribute('href')).toBe('#membership');

    // The page must expose a section with the accessible name "Membership plans" and id "membership"
    const membershipSection = screen.getByRole('region', { name: 'Membership plans' });
    expect(membershipSection).toBeInTheDocument();
    expect(membershipSection).toHaveAttribute('id', 'membership');
  });

  it('AC-2 & AC-3: MembershipPlans shows Bronze, Gold, Diamond with exact prices, three perks each and Get <Plan> membership buttons', () => {
    // Render the component in isolation to inspect its internal cards
    render(React.createElement(MembershipPlans));

    const plans = [
      { name: 'Bronze', price: '\u20b90 / year' },
      { name: 'Gold', price: '\u20b9499 / year' },
      { name: 'Diamond', price: '\u20b9999 / year' }
    ];

    for (const plan of plans) {
      // Each plan must have a heading with its name
      const heading = screen.getByRole('heading', { name: plan.name });
      expect(heading).toBeInTheDocument();

      // Find a reasonable container for the card: prefer article or section, fall back to parent
      const container = heading.closest('article') || heading.closest('section') || heading.parentElement;
      expect(container).toBeTruthy();

      // The exact price string must be present within the plan's container
      const priceMatch = Array.from(container!.querySelectorAll('*')).some((n) => n.textContent === plan.price);
      expect(priceMatch).toBe(true);

      // Each plan card must list exactly three perks (assumed to be rendered as list items)
      const perks = container!.querySelectorAll('li');
      expect(perks.length).toBe(3);

      // Each plan card must expose a button named "Get <Plan> membership"
      const button = within(container as Element).getByRole('button', { name: `Get ${plan.name} membership` });
      expect(button).toBeInTheDocument();
    }
  });
});
