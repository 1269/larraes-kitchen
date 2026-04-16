/** Format a 10-digit US phone string (e.g., "5105550123") as "(510) 555-0123". */
export function formatPhone(digits: string): string {
  const d = digits.replace(/\D/g, "");
  if (d.length !== 10) return digits;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}
