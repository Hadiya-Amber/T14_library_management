import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import LandingPage from "../src/pages/LandingPage";

it("renders a Membership region with the exact notice text", () => {
  render(<LandingPage />);

  const membershipRegion = screen.getByRole("region", { name: "Membership" });

  expect(membershipRegion.textContent?.trim()).toBe(
    "Membership is free for all residents"
  );
});
