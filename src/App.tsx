import React from 'react'
import LandingPage from './pages/LandingPage'

/**
 * App is the root application component.
 *
 * It composes the primary page(s) for the application. Currently this
 * renders the LandingPage shell used by the site.
 *
 * @returns JSX.Element - the rendered application root
 */
export default function App(): JSX.Element {
  return <LandingPage />
}
