import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import path from 'path';
import fs from 'fs';

// Import the component under test at top-level per the project's greenfield guidance.
// If src/components/CatalogueCta does not exist, the test collection will fail visibly.
import CatalogueCta from '../src/components/CatalogueCta';

describe('CatalogueCta component (AC-1, AC-2)', () => {
  it("AC-1: renders an anchor labelled exactly 'Browse the catalogue' that points to /catalogue", () => {
    render(<CatalogueCta />);

    // Accessibility-first selection: link role with the exact accessible name.
    const link = screen.getByRole('link', { name: 'Browse the catalogue' });
    expect(link).toBeTruthy();

    // Assert the href attribute exactly equals the required path.
    // Use getAttribute to check the literal attribute value rendered into the DOM.
    expect(link.getAttribute('href')).toBe('/catalogue');
  });

  it("AC-2: stylesheet defines a :focus-visible rule and does not disable focus outlines", () => {
    // Read the component CSS module file directly from the source tree.
    // If the file is missing, this will surface as a clear error during collection/run.
    const cssPath = path.resolve(process.cwd(), 'src/components/CatalogueCta.module.css');
    const css = fs.readFileSync(cssPath, 'utf8');

    // Assert that a :focus-visible selector appears in the stylesheet.
    const hasFocusVisible = /:focus-visible\b/.test(css);
    expect(hasFocusVisible).toBe(true);

    // Assert common ways of disabling outlines are not present.
    // These regexes catch variants like 'outline: none', 'outline:none', 'outline: 0', and 'outline-width: 0'.
    const disablesOutlineNone = /outline\s*:\s*none\b/i.test(css);
    const disablesOutlineZero = /outline\s*:\s*0\b/i.test(css);
    const disablesOutlineWidthZero = /outline-width\s*:\s*0\b/i.test(css);

    expect(disablesOutlineNone).toBe(false);
    expect(disablesOutlineZero).toBe(false);
    expect(disablesOutlineWidthZero).toBe(false);
  });
});
