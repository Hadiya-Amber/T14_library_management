import React from "react";
import { render, screen, within, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import MembershipPlans from "../src/components/MembershipPlans";

// NOTE: We intentionally interact with the plans UI to open the checkout
// dialog so the tests exercise the user-facing behaviour described in the
// acceptance criteria.

describe("Membership checkout dialog", () => {
  function openGoldDialog() {
    render(React.createElement(MembershipPlans));
    const opener = screen.getByRole("button", { name: /Get Gold membership/i });
    // focus then click to emulate a keyboard user as well
    opener.focus();
    fireEvent.click(opener);
    const dialog = screen.getByRole("dialog", { name: "Checkout" });
    return { opener, dialog };
  }

  test("opens a dialog named 'Checkout' showing Gold and the Gold price (₹499 / year)", () => {
    const { dialog } = openGoldDialog();

    // Plan name is visible
    expect(within(dialog).getByText(/Gold/)).toBeInTheDocument();

    // Price displays the rupee sign and 499 and the per-year text
    // Use a regexp so small formatting differences around whitespace/slashes do not falsify the check
    expect(within(dialog).getByText(/\u20b9499\s*\/?\s*year/i)).toBeInTheDocument();
  });

  test("applies student and code discounts and validates student IDs", () => {
    const { dialog } = openGoldDialog();

    // Locate inputs by accessible label text that the UI should expose
    const getStudentInput = () => within(dialog).getByLabelText(/Student ID/i) as HTMLInputElement;
    const getCodeInput = () => within(dialog).getByLabelText(/Discount code/i) as HTMLInputElement;

    // Capture original total for comparison when invalid student ID is entered
    const originalTotal = within(dialog).getByText(/\u20b9499/);
    expect(originalTotal).toBeInTheDocument();

    // Enter a valid student ID and expect the student discount (20%) to show ₹399
    const student = getStudentInput();
    fireEvent.change(student, { target: { value: "STU-123456" } });
    fireEvent.blur(student);
    expect(within(dialog).getByText(/\u20b9399/)).toBeInTheDocument();

    // Clear student and test discount code READMORE for 10% -> ₹449
    fireEvent.change(student, { target: { value: "" } });
    const code = getCodeInput();
    fireEvent.change(code, { target: { value: "READMORE" } });
    fireEvent.blur(code);
    expect(within(dialog).getByText(/\u20b9449/)).toBeInTheDocument();

    // Now apply both: student first then code -> expect ₹359
    fireEvent.change(student, { target: { value: "STU-123456" } });
    fireEvent.blur(student);
    // ensure student discount applied before code
    expect(within(dialog).getByText(/\u20b9399/)).toBeInTheDocument();

    // code already set; re-blur to apply the combined discount in UI implementations
    fireEvent.blur(code);
    expect(within(dialog).getByText(/\u20b9359/)).toBeInTheDocument();

    // Invalid student ID should show validation message and not apply the student discount
    fireEvent.change(student, { target: { value: "ABC123" } });
    fireEvent.blur(student);

    // Validation message must be present
    expect(within(dialog).getByText("Enter a student ID like STU-123456")).toBeInTheDocument();

    // The total should revert to (or remain) the original full price (₹499)
    expect(within(dialog).getByText(/\u20b9499/)).toBeInTheDocument();
  });

  test("Pay confirms membership, hides fields, and Close returns focus to opener", () => {
    const { opener, dialog } = openGoldDialog();

    const student = within(dialog).getByLabelText(/Student ID/i) as HTMLInputElement;
    fireEvent.change(student, { target: { value: "STU-123456" } });
    fireEvent.blur(student);

    // Pay button should reflect the discounted amount after student discount
    const payButton = within(dialog).getByRole("button", { name: /Pay\s*\u20b9399/ });
    fireEvent.click(payButton);

    // After payment, the dialog should show confirmation text and the input fields should be gone
    expect(within(dialog).getByText(/Gold membership activated/i)).toBeInTheDocument();

    // Common input roles should no longer be present inside the dialog
    expect(within(dialog).queryByLabelText(/Student ID/i)).toBeNull();
    expect(within(dialog).queryByLabelText(/Discount code/i)).toBeNull();

    // Close the dialog and ensure focus returns to the opener
    const closeButton = within(dialog).getByRole("button", { name: /Close/i });
    fireEvent.click(closeButton);

    // Dialog should be removed from the document
    expect(screen.queryByRole("dialog", { name: "Checkout" })).toBeNull();

    // The opener button should regain focus
    expect(document.activeElement).toBe(opener);
  });
});
