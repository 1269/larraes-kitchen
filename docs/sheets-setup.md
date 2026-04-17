# Google Sheets Setup — Lead Storage

This runbook provisions the Google Sheet that Larrae's Kitchen uses to store leads + rate-limit rows.
Follow it once per environment (Vercel Preview, Vercel Production) before the wizard's Astro Action
can be exercised against real storage.

Plan reference: `.planning/phases/03-inquiry-wizard-lead-pipeline/03-04-PLAN.md` Task 2.
Canonical column schema: RESEARCH §Pattern 7 (24 columns, A–X).

---

## 1 — Create the Google Cloud project + service account

1. Visit <https://console.cloud.google.com/> and sign in with an account that can create projects.
2. Create a new project: `larraes-kitchen-leads` (or reuse an existing one).
3. Enable the **Google Sheets API** for that project: <https://console.cloud.google.com/apis/library/sheets.googleapis.com>.
4. Create a service account:
   - IAM & Admin → Service Accounts → **Create Service Account**
   - Name: `leads-writer`
   - Role: **leave blank at the project level** — we grant access per-Sheet instead (principle of least privilege, mitigates T-03-26).
   - Click **Done**.
5. For the new service account, open the **Keys** tab and click **Add Key → Create new key → JSON**. Download the file and keep it safe; you'll paste its contents into the environment variable below.

---

## 2 — Create the Google Sheet

1. Visit <https://sheets.new>. A new spreadsheet opens.
2. Rename the file: `Larrae's Kitchen – Leads (PREVIEW)` (or `PRODUCTION`, matching the environment).
3. Rename the default tab from `Sheet1` to **`Leads`** (exact case).
4. Create a second tab named **`RateLimit`** (exact case) — use **+** in the tab strip.

### 2a — Leads tab headers (row 1, columns A–X)

Paste this entire row into cell **A1** (tab-delimited; Sheets accepts it as a single paste):

```
created_at	submission_id	ulid	idempotency_key	event_type	guests	event_date	package_id	final_estimate_min	final_estimate_max	name	email	phone	zip	event_address	event_city	notes	how_heard	contact_method	ip_hash	notify_email_status	confirm_email_status	retry_count	user_agent
```

This yields headers in **A1:X1**. Do not freeze, format, or add conditional formatting — the adapter
reads raw values and ignores formatting.

### 2b — RateLimit tab headers (row 1, columns A–C)

Paste this into cell **A1** of the `RateLimit` tab:

```
ip_hash	timestamp_ms	action
```

---

## 3 — Share the Sheet with the service account

1. Copy the service-account email address (format: `leads-writer@larraes-kitchen-leads.iam.gserviceaccount.com`).
2. In the Sheet, click **Share** (top-right).
3. Paste the service-account email. Set permission to **Editor**. Uncheck "Notify people" (service accounts don't have inboxes).
4. Click **Share**.

The service account now has write access to this one Sheet — and nothing else.

---

## 4 — Copy the Sheet ID

The Sheet URL looks like:

```
https://docs.google.com/spreadsheets/d/1abcDEFghijKLMnopQRSTuvWXyz1234567890/edit#gid=0
```

The segment between `/d/` and `/edit` is the Sheet ID (here `1abcDEFghijKLMnopQRSTuvWXyz1234567890`). Copy it.

---

## 5 — Set the environment variables

Open the target environment (Vercel → Project → Settings → Environment Variables):

| Key | Value | Environments |
|-----|-------|--------------|
| `GOOGLE_SHEETS_CREDENTIALS_JSON` | The **entire** contents of the service-account JSON file, as a single string (Vercel handles multi-line JSON if you paste it as-is, but a safer approach is to minify it to a single line with `jq -c . key.json`). | Preview, Production |
| `GOOGLE_SHEETS_LEAD_SHEET_ID` | The Sheet ID copied in step 4. | Preview, Production |

**Do not** prefix either variable with `PUBLIC_` — these must never reach the client bundle.

For local development, add the same two keys to a local `.env` file (which is `.gitignore`d). If
you skip this, the wizard runs against the `InMemoryLeadStore` fallback — leads are lost on restart,
but the flow is exercisable.

---

## 6 — Verify

Trigger a test submission against the Preview deploy (or run the Plan 05 Action integration tests
with the env set). The Sheet should gain:

- One new row on `Leads` for each submission, with all 24 columns populated.
- Zero formula evaluations — if the notes field contained `=SUM(1,1)`, the cell displays the literal
  string `=SUM(1,1)` (not `2`). If Sheets **does** evaluate a formula, the adapter is not using
  `valueInputOption: "RAW"` — file an incident.
- One new row on `RateLimit` per throttled action (5 hits per IP hash in the rolling 10-minute window
  allowed; the sixth is rejected without writing a row).

---

## 7 — Rotation policy

**Rotate service-account keys quarterly** (or immediately if the JSON is suspected leaked):

1. Google Cloud Console → IAM & Admin → Service Accounts → `leads-writer` → **Keys** tab.
2. **Add key → Create new key → JSON**. Download.
3. Update `GOOGLE_SHEETS_CREDENTIALS_JSON` in Vercel with the new JSON.
4. Confirm the new key works: fire one test submission.
5. Delete the old key from the Keys tab (only after the new one is confirmed working).

Never commit the JSON to the repo. Never share it in Slack/email.

---

## 8 — Archive tab (deferred to v1.5)

v1 writes every lead to `Leads` indefinitely. Larrae reads the Sheet on her phone; v1 volume (~100/mo)
stays well under any Sheets row limit (10 million). No rotation or archive job runs.

v1.5 may add a monthly copy-to-`Archive` job that moves leads older than N months into a sibling
tab for performance. Out of scope for Phase 3.
