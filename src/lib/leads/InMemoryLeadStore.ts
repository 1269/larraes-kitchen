// Source: Plan 03-04 Task 2 — test double + local-dev fallback for the LeadStore contract.
// Used by Plan 05 Action integration tests (via resetLeadStoreForTests) and for dev environments
// that haven't provisioned a Google Sheet yet. Production MUST use GoogleSheetsAdapter via getLeadStore().
import type { EmailStatus, LeadRecord, LeadStore, RateLimitHit } from "./LeadStore";

export class InMemoryLeadStore implements LeadStore {
  private leads: LeadRecord[] = [];
  private rateLimitHits: RateLimitHit[] = [];

  async append(record: LeadRecord): Promise<LeadRecord> {
    this.leads.push(record);
    return record;
  }

  async findByIdempotencyKey(key: string): Promise<LeadRecord | null> {
    return this.leads.find((l) => l.idempotencyKey === key) ?? null;
  }

  async updateEmailStatuses(
    submissionId: string,
    statuses: { notify: EmailStatus; confirm: EmailStatus },
  ): Promise<void> {
    const lead = this.leads.find((l) => l.submissionId === submissionId);
    if (!lead) return;
    lead.notifyEmailStatus = statuses.notify;
    lead.confirmEmailStatus = statuses.confirm;
  }

  async findPendingEmails(opts: {
    maxRetries: number;
    minAgeMs: number;
  }): Promise<LeadRecord[]> {
    const now = Date.now();
    return this.leads.filter((l) => {
      const ageMs = now - new Date(l.createdAt).getTime();
      const pending = l.notifyEmailStatus === "pending" || l.confirmEmailStatus === "pending";
      return pending && l.retryCount < opts.maxRetries && ageMs >= opts.minAgeMs;
    });
  }

  async markEmailRetry(
    submissionId: string,
    which: "notify" | "confirm",
    status: EmailStatus,
  ): Promise<void> {
    const lead = this.leads.find((l) => l.submissionId === submissionId);
    if (!lead) return;
    if (which === "notify") lead.notifyEmailStatus = status;
    else lead.confirmEmailStatus = status;
    lead.retryCount += 1;
  }

  async recordRateLimitHit(hit: RateLimitHit): Promise<void> {
    this.rateLimitHits.push(hit);
  }

  async countRateLimitHits(ipHash: string, windowMs: number): Promise<number> {
    const cutoff = Date.now() - windowMs;
    return this.rateLimitHits.filter((h) => h.ipHash === ipHash && h.timestampMs >= cutoff).length;
  }

  // Test-only helpers — NOT part of the LeadStore interface.
  clear(): void {
    this.leads = [];
    this.rateLimitHits = [];
  }
  all(): readonly LeadRecord[] {
    return this.leads;
  }
}
