// Source: RESEARCH §Pattern 6 (adapter skeleton) + §Pattern 7 (Sheets schema columns A-X) + §Anti-Patterns A4 (RAW value mode critical) + §Pitfall 7 (idempotency race accepted v1) + PATTERNS §GoogleSheetsAdapter.ts + REQUIREMENTS LEAD-05/06/07/10/11 + SPAM-04 (formula injection mitigation).
//
// Production LeadStore backed by the Google Sheets API v4. Two tabs:
//   - `Leads` (A:X) — one row per submission, schema in LeadStore.ts
//   - `RateLimit` (A:C) — ip_hash | timestamp_ms | action — rolling-window rows
//
// Adapter is server-only — never imported from client code. Credentials come from env
// via getLeadStore(); this class never reads env directly.
//
// Idempotency race (RESEARCH §Pitfall 7): accepted for v1. Post-hoc dedupe in the Plan 06
// retry cron handles the (very narrow) window where two concurrent submits with the same
// idempotency_key both see "no row" and both append.
import { google, type sheets_v4 } from "googleapis";
import type { EmailStatus, LeadRecord, LeadStore, RateLimitHit } from "./LeadStore";

const RANGE_LEADS = "Leads!A:X";
const RANGE_RATELIMIT = "RateLimit!A:C";
const LEADS_HEADER_ROW_COUNT = 1;

/**
 * Belt-and-suspenders mitigation against formula injection (RESEARCH A4).
 * Even though valueInputOption:"RAW" disables parsing, we prefix any leading
 * formula-trigger character with a single apostrophe so that a manual column
 * format flip to "Automatic"/USER_ENTERED would still treat the cell as a
 * string. Pure-text normalization.
 *
 * Trigger characters: `=` is the primary trigger; `+`, `-`, `@`, and `\t`
 * are secondary triggers in Automatic-formatted columns across Google Sheets
 * and LibreOffice Calc.
 */
const safeText = (s: string | null | undefined): string => {
  if (!s) return "";
  return /^[=+\-@\t]/.test(s) ? `'${s}` : s;
};

/** Serialize a LeadRecord to the 24-column Sheets row order declared in RESEARCH §Pattern 7. */
function leadRecordToRow(r: LeadRecord): (string | number)[] {
  return [
    r.createdAt, // A
    r.submissionId, // B
    r.ulid, // C
    r.idempotencyKey, // D
    r.eventType, // E
    r.guestCount, // F
    r.eventDate, // G
    r.packageId, // H
    r.finalEstimateMin ?? "", // I
    r.finalEstimateMax ?? "", // J
    safeText(r.name), // K
    safeText(r.email), // L — WR-01: applied for consistency, RAW value mode is primary guard
    safeText(r.phone), // M — WR-01: applied for consistency, RAW value mode is primary guard
    r.zip, // N (numeric-only per Zod regex — no formula prefix possible)
    safeText(r.eventAddress), // O
    safeText(r.eventCity), // P
    safeText(r.notes), // Q — primary formula-injection target
    safeText(r.howHeard), // R — WR-01: applied for consistency across free-text fields
    r.contactMethod, // S
    r.ipHash, // T
    r.notifyEmailStatus, // U
    r.confirmEmailStatus, // V
    r.retryCount, // W
    safeText(r.userAgent), // X
  ];
}

/** Inverse of leadRecordToRow — tolerant to missing trailing cells (Sheets drops empty tail cells). */
function rowToLeadRecord(row: (string | number | null | undefined)[]): LeadRecord {
  const s = (v: unknown): string => (v == null ? "" : String(v));
  const n = (v: unknown): number => {
    const x = Number(v);
    return Number.isFinite(x) ? x : 0;
  };
  const nn = (v: unknown): number | null => {
    if (v == null || v === "") return null;
    const x = Number(v);
    return Number.isFinite(x) ? x : null;
  };
  return {
    createdAt: s(row[0]),
    submissionId: s(row[1]),
    ulid: s(row[2]),
    idempotencyKey: s(row[3]),
    eventType: s(row[4]) as LeadRecord["eventType"],
    guestCount: n(row[5]),
    eventDate: s(row[6]),
    packageId: s(row[7]) as LeadRecord["packageId"],
    finalEstimateMin: nn(row[8]),
    finalEstimateMax: nn(row[9]),
    name: s(row[10]),
    email: s(row[11]),
    phone: s(row[12]),
    zip: s(row[13]),
    eventAddress: s(row[14]),
    eventCity: s(row[15]),
    notes: s(row[16]),
    howHeard: s(row[17]),
    contactMethod: s(row[18]) as LeadRecord["contactMethod"],
    ipHash: s(row[19]),
    notifyEmailStatus: (s(row[20]) || "pending") as EmailStatus,
    confirmEmailStatus: (s(row[21]) || "pending") as EmailStatus,
    retryCount: n(row[22]),
    userAgent: s(row[23]),
  };
}

export class GoogleSheetsAdapter implements LeadStore {
  private sheets: sheets_v4.Sheets;
  private spreadsheetId: string;

  constructor(credentialsJson: string, spreadsheetId: string) {
    const credentials = JSON.parse(credentialsJson);
    const auth = new google.auth.GoogleAuth({
      credentials,
      // Scope restricted to Sheets — no Drive-wide access (T-03-26 mitigation).
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
    this.sheets = google.sheets({ version: "v4", auth });
    this.spreadsheetId = spreadsheetId;
  }

  async append(record: LeadRecord): Promise<LeadRecord> {
    await this.sheets.spreadsheets.values.append({
      spreadsheetId: this.spreadsheetId,
      range: RANGE_LEADS,
      // RESEARCH A4: RAW disables formula parsing — critical mitigation for T-03-24.
      valueInputOption: "RAW",
      insertDataOption: "INSERT_ROWS",
      requestBody: { values: [leadRecordToRow(record)] },
    });
    return record;
  }

  /** Read the Leads sheet minus the header row, returning both the data rows and the actual starting row number. */
  private async readAllLeadRows(): Promise<{
    rows: (string | number | null | undefined)[][];
    startRow: number;
  }> {
    const res = await this.sheets.spreadsheets.values.get({
      spreadsheetId: this.spreadsheetId,
      range: RANGE_LEADS,
    });
    const all = (res.data.values ?? []) as (string | number | null | undefined)[][];
    return {
      rows: all.slice(LEADS_HEADER_ROW_COUNT),
      startRow: LEADS_HEADER_ROW_COUNT + 1, // 1-indexed for A1 ranges
    };
  }

  async findByIdempotencyKey(key: string): Promise<LeadRecord | null> {
    const { rows } = await this.readAllLeadRows();
    const match = rows.find((r) => String(r[3] ?? "") === key); // column D
    return match ? rowToLeadRecord(match) : null;
  }

  async updateEmailStatuses(
    submissionId: string,
    statuses: { notify: EmailStatus; confirm: EmailStatus },
  ): Promise<void> {
    const { rows, startRow } = await this.readAllLeadRows();
    const idx = rows.findIndex((r) => String(r[1] ?? "") === submissionId); // column B
    if (idx === -1) return; // T-03-30: no-op on miss rather than updating the wrong row
    const rowNumber = startRow + idx;
    await this.sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: this.spreadsheetId,
      requestBody: {
        valueInputOption: "RAW",
        data: [
          { range: `Leads!U${rowNumber}`, values: [[statuses.notify]] },
          { range: `Leads!V${rowNumber}`, values: [[statuses.confirm]] },
        ],
      },
    });
  }

  async findPendingEmails(opts: { maxRetries: number; minAgeMs: number }): Promise<LeadRecord[]> {
    const { rows } = await this.readAllLeadRows();
    const nowMs = Date.now();
    const records: LeadRecord[] = [];
    for (const row of rows) {
      const rec = rowToLeadRecord(row);
      const createdMs = new Date(rec.createdAt).getTime();
      if (!Number.isFinite(createdMs)) continue;
      const ageMs = nowMs - createdMs;
      const anyPending =
        rec.notifyEmailStatus === "pending" || rec.confirmEmailStatus === "pending";
      if (anyPending && rec.retryCount < opts.maxRetries && ageMs >= opts.minAgeMs) {
        records.push(rec);
      }
    }
    return records;
  }

  async markEmailRetry(
    submissionId: string,
    which: "notify" | "confirm",
    status: EmailStatus,
  ): Promise<void> {
    const { rows, startRow } = await this.readAllLeadRows();
    const idx = rows.findIndex((r) => String(r[1] ?? "") === submissionId); // column B
    if (idx === -1) return;
    const rowNumber = startRow + idx;
    const statusCol = which === "notify" ? "U" : "V";
    const currentRetry = Number(rows[idx]?.[22] ?? 0); // column W
    await this.sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: this.spreadsheetId,
      requestBody: {
        valueInputOption: "RAW",
        data: [
          { range: `Leads!${statusCol}${rowNumber}`, values: [[status]] },
          { range: `Leads!W${rowNumber}`, values: [[currentRetry + 1]] },
        ],
      },
    });
  }

  async recordRateLimitHit(hit: RateLimitHit): Promise<void> {
    await this.sheets.spreadsheets.values.append({
      spreadsheetId: this.spreadsheetId,
      range: RANGE_RATELIMIT,
      valueInputOption: "RAW",
      insertDataOption: "INSERT_ROWS",
      requestBody: { values: [[hit.ipHash, hit.timestampMs, hit.action]] },
    });
  }

  async countRateLimitHits(ipHash: string, windowMs: number): Promise<number> {
    const res = await this.sheets.spreadsheets.values.get({
      spreadsheetId: this.spreadsheetId,
      range: RANGE_RATELIMIT,
    });
    const rows = (res.data.values ?? []) as (string | number | null | undefined)[][];
    const cutoff = Date.now() - windowMs;
    // WR-04: explicit header-row guard. Previously we relied on the fact that
    // Number("timestamp_ms") is NaN and NaN >= cutoff is false; make it explicit
    // so behaviour does not depend on floating-point quirks.
    const dataRows = rows.filter((r) => {
      const ts = Number(r[1] ?? 0);
      return Number.isFinite(ts) && ts > 0;
    });
    return dataRows.filter((r) => String(r[0] ?? "") === ipHash && Number(r[1] ?? 0) >= cutoff)
      .length;
  }
}
