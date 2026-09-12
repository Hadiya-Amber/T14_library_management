import React from 'react';
import { describe, it, expect } from 'vitest';
import LandingPage from '../pages/LandingPage';

/**
 * Helper to traverse the React element tree produced by a function component
 * and collect element types present. This avoids needing a DOM environment
 * for these pure structural assertions.
 */
function collectTypes(node: any, set: Set<string>) {
  if (!node) return
  if (Array.isArray(node)) {
    node.forEach((n) => collectTypes(n, set))
    return
  }

  if (typeof node === 'object' && node.type) {
    if (typeof node.type === 'string') {
      set.add(node.type)
    }

    const children = node.props && node.props.children
    if (children) collectTypes(children, set)
  }
}

describe('LandingPage', () => {
  it('mounts without throwing', () => {
    // Call the function component directly; it should execute without runtime DOM.
    expect(() => {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      LandingPage()
    }).not.toThrow()
  })

  it('renders header, main and footer regions', () => {
    const tree = LandingPage()
    const types = new Set<string>()
    collectTypes(tree, types)

    expect(types.has('header')).toBeTruthy()
    expect(types.has('main')).toBeTruthy()
    expect(types.has('footer')).toBeTruthy()
  })
})

