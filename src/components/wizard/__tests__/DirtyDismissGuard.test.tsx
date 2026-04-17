// Source: Plan 03-03 Task 2a — DirtyDismissGuard thin coverage.
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import DirtyDismissGuard from "../DirtyDismissGuard";

describe("DirtyDismissGuard", () => {
  it("renders nothing when open is false", () => {
    const { container } = render(
      <DirtyDismissGuard
        open={false}
        onKeepEditing={() => {}}
        onClose={() => {}}
      />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("shows the locked UI-SPEC heading and body when open", () => {
    render(
      <DirtyDismissGuard open={true} onKeepEditing={() => {}} onClose={() => {}} />,
    );
    expect(screen.getByText("Leave the quote wizard?")).toBeTruthy();
    expect(
      screen.getByText(/Your progress is saved on this device/),
    ).toBeTruthy();
  });

  it("exposes the two actions 'Keep editing' and 'Close'", () => {
    render(
      <DirtyDismissGuard open={true} onKeepEditing={() => {}} onClose={() => {}} />,
    );
    expect(screen.getByRole("button", { name: "Keep editing" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Close" })).toBeTruthy();
  });

  it("uses role='alertdialog'", () => {
    render(
      <DirtyDismissGuard open={true} onKeepEditing={() => {}} onClose={() => {}} />,
    );
    expect(screen.getByRole("alertdialog")).toBeTruthy();
  });

  it("Escape keystroke calls onKeepEditing (non-destructive default)", () => {
    const onKeepEditing = vi.fn();
    const onClose = vi.fn();
    render(
      <DirtyDismissGuard
        open={true}
        onKeepEditing={onKeepEditing}
        onClose={onClose}
      />,
    );
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onKeepEditing).toHaveBeenCalledTimes(1);
    expect(onClose).not.toHaveBeenCalled();
  });
});
