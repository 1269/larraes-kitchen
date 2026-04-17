// Source: Plan 03-05 Task 2 — Astro 6 Actions barrel.
// https://docs.astro.build/en/guides/actions/ requires a single
// `export const server = { ... }` re-exported from src/actions/index.ts.
import { submitInquiry } from "./submitInquiry";

export const server = {
  submitInquiry,
};
