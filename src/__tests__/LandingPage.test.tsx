/* @vitest-environment jsdom */
import { describe, test, expect } from 'vitest'
import * as matchers from '@testing-library/jest-dom/matchers'

// register jest-dom matchers with vitest's expect
expect.extend(matchers as any)
/**
 * Tests for LandingPage component.
 */
import React from 'react'
import { render, screen } from '@testing-library/react'
import LandingPage from '../pages/LandingPage'

describe('LandingPage', () => {
  test('mounts without throwing and exposes header, main and footer', () => {
    render(<LandingPage />)

    // header (banner)
    expect(screen.getByRole('banner')).toBeTruthy()
    // main
    expect(screen.getByRole('main')).toBeTruthy()
    // footer (contentinfo)
    expect(screen.getByRole('contentinfo')).toBeTruthy()
  })
})
