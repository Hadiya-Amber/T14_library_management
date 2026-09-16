import { readFileSync } from "fs";
import { resolve } from "path";
import { test, expect } from "vitest";

const themePath = resolve(__dirname, "../src/styles/theme.css");
const shelfCssPath = resolve(__dirname, "../src/components/BookShelf.module.css");

test("AC-1: .scrollContainer applies marquee animation and pauses on hover", () => {
  const css = readFileSync(shelfCssPath, "utf8");

  // Locate the .scrollContainer rule block
  const scrollMatch = css.match(/\.scrollContainer\s*\{([^}]*)\}/s);
  expect(scrollMatch, "Expected a .scrollContainer rule block in BookShelf.module.css").toBeTruthy();
  const block = scrollMatch ? scrollMatch[1] : "";

  // Assert the block references a marquee animation (animation or animation-name)
  const hasMarquee = /animation[^;]*marquee/.test(block) || /animation-name\s*:\s*marquee/.test(block);
  expect(hasMarquee, "Expected .scrollContainer to apply an animation referencing 'marquee'").toBeTruthy();

  // Assert there is a :hover rule that pauses the animation with animation-play-state: paused
  // Accept either .scrollContainer:hover or .shelf:hover .scrollContainer forms
  const hoverPauseRegex = /(?:(?:\.scrollContainer\s*:\s*hover)|(?:\.shelf\s*:\s*hover[^}]*\.scrollContainer)|(?:\.shelf\s*:\s*hover))[^}]*animation-play-state\s*:\s*paused/si;
  expect(hoverPauseRegex.test(css), "Expected a :hover rule that sets animation-play-state: paused for the marquee").toBeTruthy();
});

test("AC-2: theme declares --font-display and --font-body and applies to body and headings", () => {
  const css = readFileSync(themePath, "utf8");

  // Custom property declarations
  expect(/--font-display\s*:/s.test(css), "Expected --font-display custom property in theme.css").toBeTruthy();
  expect(/--font-body\s*:/s.test(css), "Expected --font-body custom property in theme.css").toBeTruthy();

  // body should use --font-body
  const bodyUsesFontBody = /body[^}]*font-family\s*:\s*var\(\s*--font-body\s*\)/s.test(css);
  expect(bodyUsesFontBody, "Expected body to use var(--font-body) in theme.css").toBeTruthy();

  // headings h1, h2, h3 should use --font-display
  const headingsUseFontDisplay = /h1\s*,\s*h2\s*,\s*h3[^}]*font-family\s*:\s*var\(\s*--font-display\s*\)/s.test(css);
  expect(headingsUseFontDisplay, "Expected h1, h2, h3 to use var(--font-display) in theme.css").toBeTruthy();
});

test("AC-3: palette --accent is #0f766e and old #b45309 no longer in file", () => {
  const css = readFileSync(themePath, "utf8");

  // New accent value must be present
  expect(/--accent\s*:\s*#0f766e\s*;/.test(css), "Expected --accent: #0f766e; in theme.css").toBeTruthy();

  // Old accent hex must not appear anywhere
  expect(css.includes("#b45309"), "Did not expect the old accent value #b45309 to remain in theme.css").toBeFalsy();
});
