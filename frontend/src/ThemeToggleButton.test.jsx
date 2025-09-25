import { describe, it, expect, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import ThemeToggleButton from "./ThemeToggleButton";
import { ThemeProvider, useTheme } from "./ThemeContext";

function Wrapper({ children }) {
  return <ThemeProvider>{children}</ThemeProvider>;
}

describe("ThemeToggleButton (simple toggle)", () => {
  it("toggles theme between light and dark", () => {
    const { getByRole } = render(<ThemeToggleButton showDropdown={false} />, {
      wrapper: Wrapper,
    });
    const button = getByRole("button");
    // initial theme derived from system; force to light for determinism by simulating root class
    // We'll read aria-label instead which reflects current theme expectation
    const firstLabel = button.getAttribute("aria-label");
    fireEvent.click(button);
    const secondLabel = button.getAttribute("aria-label");
    expect(firstLabel).not.toEqual(secondLabel);
  });
});

describe("ThemeToggleButton (dropdown)", () => {
  it("opens dropdown and selects dark theme", () => {
    const { getByLabelText, getByText } = render(
      <ThemeToggleButton showDropdown={true} />,
      { wrapper: Wrapper },
    );
    const toggle = getByLabelText("Theme options");
    fireEvent.click(toggle);
    // choose Dark option
    const darkBtn = getByText("Dark");
    fireEvent.click(darkBtn);
    // reopen and ensure Dark button has selected styling (text-blue-600 class substring)
    fireEvent.click(toggle);
    const darkBtnAgain = getByText("Dark");
    // The span containing the text has no classes; the button wrapper holds the styling
    const darkWrapper = darkBtnAgain.closest("button");
    expect(darkWrapper?.className || "").toMatch(
      /text-blue-600|dark:text-blue-400/,
    );
  });
});
