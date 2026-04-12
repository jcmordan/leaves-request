import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MicrosoftSignInButton } from "./MicrosoftSignInButton";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

describe("MicrosoftSignInButton", () => {
  it("renders Microsoft sign-in text", () => {
    render(<MicrosoftSignInButton onClick={vi.fn()} />);

    expect(screen.getByText("microsoftSignIn")).toBeInTheDocument();
  });

  it("calls onClick when clicked", () => {
    const onClickMock = vi.fn();
    render(<MicrosoftSignInButton onClick={onClickMock} />);

    fireEvent.click(screen.getByRole("button"));

    expect(onClickMock).toHaveBeenCalledOnce();
  });
});
