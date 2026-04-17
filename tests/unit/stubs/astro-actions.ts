// Source: Plan 03-05 Task 2 — stub for the `astro:actions` virtual module used
// by Vitest. Astro ships `astro:actions` as a Vite virtual module that only
// resolves during `astro build` / `astro dev`. Unit tests import through this
// stub and then `vi.mock("astro:actions", ...)` to override behavior.
export class ActionError extends Error {
  code: string;
  constructor(opts: { code: string; message?: string }) {
    super(opts.message ?? opts.code);
    this.code = opts.code;
  }
}

export function defineAction<T>(config: T): T {
  return config;
}

export function isInputError(_error: unknown): boolean {
  return false;
}
