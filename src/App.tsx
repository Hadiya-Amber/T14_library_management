/**
 * Root application component.
 */
import React from "react";
import LandingPage from "./pages/LandingPage";

/**
 * App is the root component that mounts the LandingPage.
 *
 * @returns JSX.Element root application element
 */
export default function App(): JSX.Element {
  return <LandingPage />;
}
