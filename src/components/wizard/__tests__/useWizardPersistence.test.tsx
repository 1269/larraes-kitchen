// Source: Plan 03-03 Task 1 — every <behavior> line maps to an `it()` block.
import { beforeEach, describe, expect, it } from "vitest";
import {
  clearSnapshot,
  loadSnapshot,
  saveSnapshot,
} from "../hooks/useWizardPersistence";

describe("useWizardPersistence", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  it("returns undefined when no snapshot exists", () => {
    expect(loadSnapshot()).toBeUndefined();
  });

  it("round-trips a partial LeadInput through save/load", () => {
    saveSnapshot({ eventType: "family", guestCount: 15 });
    expect(loadSnapshot()).toEqual({ eventType: "family", guestCount: 15 });
  });

  it("persists as JSON string under the lk_wizard_v1 key", () => {
    saveSnapshot({ eventType: "family", guestCount: 15 });
    const raw = window.sessionStorage.getItem("lk_wizard_v1");
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw as string);
    expect(parsed.values).toEqual({ eventType: "family", guestCount: 15 });
    expect(typeof parsed.savedAt).toBe("number");
  });

  it("clear() removes the key entirely", () => {
    saveSnapshot({ eventType: "family" });
    clearSnapshot();
    expect(loadSnapshot()).toBeUndefined();
    expect(window.sessionStorage.getItem("lk_wizard_v1")).toBeNull();
  });

  it("discards snapshots older than 24h", () => {
    const old = {
      values: { eventType: "family" },
      savedAt: Date.now() - 25 * 60 * 60 * 1000,
    };
    window.sessionStorage.setItem("lk_wizard_v1", JSON.stringify(old));
    expect(loadSnapshot()).toBeUndefined();
  });

  it("returns undefined on malformed JSON (defensive)", () => {
    window.sessionStorage.setItem("lk_wizard_v1", "{not-json");
    expect(loadSnapshot()).toBeUndefined();
  });
});
