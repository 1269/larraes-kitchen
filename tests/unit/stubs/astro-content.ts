// Source: Plan 03-05 Task 2 — stub for the `astro:content` virtual module used
// by Vitest. Astro ships `astro:content` as a Vite virtual module; tests mock
// it with `vi.mock("astro:content", ...)` so this fallback just provides the
// export surface (getCollection + getEntry) to satisfy module resolution.
export async function getCollection(_name: string): Promise<unknown[]> {
  return [];
}

export async function getEntry(
  _collection: string,
  _id: string,
): Promise<{ data: Record<string, unknown> } | null> {
  return null;
}
