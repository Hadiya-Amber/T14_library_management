/**
 * Tests for MembershipNotice component and its placement on LandingPage.
 */
import React from "react";
import { render, screen } from "@testing-library/react";
import MembershipNotice from "../components/MembershipNotice";
import LandingPage from "../pages/LandingPage";

describe("MembershipNotice", () => {
  test("is a region landmark named 'Membership' and contains the exact sentence", () => {
    render(<MembershipNotice />);

    const region = screen.getByRole("region", { name: "Membership" });
    expect(region).toBeTruthy();
    expect(region.textContent?.trim()).toBe("Membership is free for all residents");
  });

  test("is present on the LandingPage beneath the hero", () => {
    render(<LandingPage />);
    const region = screen.getByRole("region", { name: "Membership" });
    expect(region).toBeTruthy();
    expect(region.textContent?.trim()).toBe("Membership is free for all residents");
  });
});
