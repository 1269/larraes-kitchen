// Source: CONTEXT D-09 (ZIP soft-check) + WIZ-11. Static lookup; soft check only —
// caller decides UX ("not sure? just ask" fallback is the D-09 contract).

/**
 * Benicia-adjacent ZIPs we confidently cover. Soft-check only — out-of-area
 * ZIPs do NOT block submission; the caller shows a "we may need to travel"
 * hint and continues.
 */
const SERVICE_AREA: Record<string, string> = {
  "94510": "Benicia",
  "94590": "Vallejo",
  "94591": "Vallejo",
  "94592": "Vallejo",
  "94533": "Fairfield",
  "94534": "Fairfield",
  "94535": "Fairfield",
  "94585": "Suisun City",
  "94589": "Vallejo",
  "94801": "Richmond",
  "94803": "El Sobrante",
  "94804": "Richmond",
  "94805": "Richmond",
  "94553": "Martinez",
  "94565": "Pittsburg",
  "94509": "Antioch",
  "94520": "Concord",
  "94521": "Concord",
  "94523": "Pleasant Hill",
  "94596": "Walnut Creek",
  "94597": "Walnut Creek",
  "94598": "Walnut Creek",
};

/** Frozen, read-only view of the service-area map (for downstream consumers). */
export const BENICIA_SERVICE_AREA_ZIPS: Readonly<Record<string, string>> = Object.freeze({
  ...SERVICE_AREA,
});

/**
 * Resolve a 5-digit ZIP to its service-area city, or null if not in our
 * Benicia-adjacent map. Non-5-digit, non-numeric, or empty input → null.
 */
export function resolveServiceAreaCity(zip: string): string | null {
  if (!zip || !/^\d{5}$/.test(zip)) return null;
  return SERVICE_AREA[zip] ?? null;
}
