import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { ThemeToggle } from "@/components/theme-toggle";

describe("ThemeToggle", () => {
  it("renders a button with an accessible label", () => {
    const { getByRole } = render(<ThemeToggle />);
    expect(getByRole("button", { name: /theme/i })).toBeInTheDocument();
  });
});
