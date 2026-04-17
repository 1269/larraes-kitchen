/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly RESEND_API_KEY: string;
  readonly RESEND_FROM_EMAIL: string;
  readonly PUBLIC_TURNSTILE_SITE_KEY: string; // RENAMED from TURNSTILE_SITE_KEY — PUBLIC_ prefix required for client bundles (Astro 6)
  readonly TURNSTILE_SECRET_KEY: string;
  readonly GOOGLE_SHEETS_CREDENTIALS_JSON: string;
  readonly GOOGLE_SHEETS_LEAD_SHEET_ID: string;
  readonly CRON_SECRET: string; // NEW — Vercel Cron bearer auth (LEAD-11)
  readonly RESEND_WEBHOOK_SECRET: string; // NEW — Resend webhook HMAC verification (LEAD-12)
  readonly SENTRY_DSN: string;
  readonly PUBLIC_SITE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
