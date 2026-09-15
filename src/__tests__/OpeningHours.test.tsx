import React from 'react';
import { render, screen, within, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import { afterEach, describe, it, expect } from 'vitest';
import OpeningHours from '../components/OpeningHours';

// Required cleanup between tests (vitest + jsdom, globals not enabled)
afterEach(cleanup);

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

describe('OpeningHours component (accessibility and behavior)', () => {
  it('renders all seven day names (AC-1)', () => {
    // Build a seven-day schedule; each entry uses the weekday name so tests can be deterministic
    const schedule = WEEKDAYS.map((d) => ({ day: d, hours: '09:00–17:00', opens: '09:00', closes: '17:00' }));

    // pick an arbitrary now (the weekday name is derived from this Date in assertions where needed)
    const now = new Date(2026, 8, 13, 12, 0, 0); // 2026-09-13T12:00:00 local

    render(<OpeningHours schedule={schedule} now={now} />);

    // The panel should be an accessible region named 'Opening hours'
    const region = screen.getByRole('region', { name: /Opening hours/i });
    expect(region).toBeInTheDocument();

    // Collect dt elements inside the region and assert they're the seven weekday names
    const dtNodes = Array.from(region.querySelectorAll('dt'));
    const dtTexts = dtNodes.map((n) => n.textContent?.trim());

    expect(dtTexts).toEqual(WEEKDAYS);
  });

  it('is a region named "Opening hours" containing a dl with dt/dd pairs (AC-2)', () => {
    const schedule = WEEKDAYS.map((d) => ({ day: d, hours: '09:00–17:00', opens: '09:00', closes: '17:00' }));
    const now = new Date(2026, 8, 13, 12, 0, 0);

    render(<OpeningHours schedule={schedule} now={now} />);

    const region = screen.getByRole('region', { name: /Opening hours/i });
    expect(region).toBeInTheDocument();

    const dl = region.querySelector('dl');
    expect(dl).toBeInTheDocument();

    const dts = Array.from(dl!.querySelectorAll('dt'));
    const dds = Array.from(dl!.querySelectorAll('dd'));

    // There should be one dt and one dd per weekday
    expect(dts.length).toBe(7);
    expect(dds.length).toBe(7);

    // Each dt should be followed immediately by a dd (dt.nextElementSibling is dd)
    dts.forEach((dt) => {
      const sibling = dt.nextElementSibling as Element | null;
      expect(sibling).not.toBeNull();
      expect(sibling!.tagName).toBe('DD');
    });
  });

  it("badge shows 'Open now' when now falls inside that weekday's hours (AC-3)", () => {
    // Choose a specific 'now' and construct a schedule that marks that weekday as open 09:00-17:00
    const now = new Date(2026, 8, 13, 12, 0, 0); // arbitrary local date
    const todayName = WEEKDAYS[now.getDay()];

    const schedule = WEEKDAYS.map((d) =>
      d === todayName
        ? { day: d, hours: '09:00–17:00', opens: '09:00', closes: '17:00' }
        : { day: d, hours: 'Closed', opens: null, closes: null }
    );

    render(<OpeningHours schedule={schedule} now={now} />);

    const region = screen.getByRole('region', { name: /Opening hours/i });
    // badge is expected to carry data-animation='pulse' (AC-5) so find it by attribute
    const badge = region.querySelector('[data-animation="pulse"]');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent(/Open now/i);
  });

  it("badge shows 'Closed' when now falls outside that weekday's hours (AC-3)", () => {
    // Pick a 'now' early in the morning and mark today's hours as 09:00-17:00 so now is outside
    const now = new Date(2026, 8, 13, 8, 0, 0); // 08:00 local time
    const todayName = WEEKDAYS[now.getDay()];

    const schedule = WEEKDAYS.map((d) =>
      d === todayName
        ? { day: d, hours: '09:00–17:00', opens: '09:00', closes: '17:00' }
        : { day: d, hours: 'Closed', opens: null, closes: null }
    );

    render(<OpeningHours schedule={schedule} now={now} />);

    const region = screen.getByRole('region', { name: /Opening hours/i });
    const badge = region.querySelector('[data-animation="pulse"]');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent(/Closed/i);
  });

  it("marks exactly one row with aria-current='date' and it corresponds to the now weekday (AC-4)", () => {
    const now = new Date(2026, 8, 13, 12, 0, 0);
    const todayName = WEEKDAYS[now.getDay()];

    const schedule = WEEKDAYS.map((d) => ({ day: d, hours: '09:00–17:00', opens: '09:00', closes: '17:00' }));

    render(<OpeningHours schedule={schedule} now={now} />);

    // Find all elements marked as the current date
    const currentMarked = screen.queryAllByAttribute ? screen.queryAllByAttribute('aria-current', 'date') : [];

    // Fallback query for environments where queryAllByAttribute helper isn't present
    const marked = currentMarked.length ? currentMarked : Array.from(document.querySelectorAll('[aria-current="date"]'));

    expect(marked.length).toBe(1);

    const row = marked[0] as Element;
    // The row should contain a dt with the weekday name
    const dt = row.querySelector('dt');
    expect(dt).toBeInTheDocument();
    expect(dt).toHaveTextContent(new RegExp(`^${todayName}$`));
  });

  it("panel root has data-animation='rise' and badge has data-animation='pulse' (AC-5)", () => {
    const now = new Date(2026, 8, 13, 12, 0, 0);
    const schedule = WEEKDAYS.map((d) => ({ day: d, hours: '09:00–17:00', opens: '09:00', closes: '17:00' }));

    render(<OpeningHours schedule={schedule} now={now} />);

    const region = screen.getByRole('region', { name: /Opening hours/i });
    expect(region).toBeInTheDocument();

    // Panel root must carry data-animation='rise'
    expect(region.getAttribute('data-animation')).toBe('rise');

    // Badge must carry data-animation='pulse'
    const badge = region.querySelector('[data-animation="pulse"]');
    expect(badge).toBeInTheDocument();
  });
});
