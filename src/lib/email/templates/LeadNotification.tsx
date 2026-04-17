// Source: Plan 03-05 Task 1 — React Email template for Larrae's notification.
// CONTEXT D-16 (action-first phone-reading layout) + UI-SPEC §Email copy (subject in send.ts, not here) + LEAD-08.
// Inline style tokens mirror UI-SPEC Typography: Lovelace/Playfair for display,
// Playfair serif italic for price, monospace for submission ID, #1C1B19 ink,
// #B8621B accent eyebrow, #2E4A2F primary green.
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Section,
  Text,
} from "@react-email/components";
import { formatPhone } from "@/lib/format";
import type { LeadRecord } from "@/lib/leads/LeadStore";

export interface LeadNotificationProps {
  record: LeadRecord;
}

export default function LeadNotification({ record }: LeadNotificationProps) {
  const hasEstimate =
    record.finalEstimateMin != null && record.finalEstimateMax != null;
  const estimateLabel = hasEstimate
    ? `$${record.finalEstimateMin}–$${record.finalEstimateMax}`
    : "Custom quote — Larrae to follow up";

  return (
    <Html>
      <Head />
      <Body
        style={{
          backgroundColor: "#F7EFD9",
          fontFamily: "'Work Sans', system-ui, sans-serif",
          margin: 0,
          padding: 0,
        }}
      >
        <Container style={{ maxWidth: 600, margin: "0 auto", padding: 24 }}>
          <Section>
            <Text
              style={{
                fontSize: 12,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "#B8621B",
                fontWeight: 600,
                margin: 0,
              }}
            >
              NEW QUOTE
            </Text>
            <Heading
              as="h1"
              style={{
                fontFamily: "Lovelace, 'Playfair Display', serif",
                fontSize: 32,
                color: "#1C1B19",
                margin: "8px 0 16px",
                lineHeight: 1.15,
              }}
            >
              {record.name}
            </Heading>
            <Text style={{ margin: "4px 0" }}>
              <Link
                href={`tel:${record.phone}`}
                style={{ color: "#2E4A2F", fontWeight: 600 }}
              >
                {formatPhone(record.phone)}
              </Link>
            </Text>
            <Text style={{ margin: "4px 0" }}>
              <Link
                href={`mailto:${record.email}`}
                style={{ color: "#2E4A2F", fontWeight: 600 }}
              >
                {record.email}
              </Link>
            </Text>
            <Text style={{ margin: "8px 0", color: "#1C1B19" }}>
              {record.eventType} · {record.guestCount} guests · {record.eventDate}
            </Text>
            <Text
              style={{
                fontFamily: "'Playfair Display', serif",
                fontStyle: "italic",
                fontSize: 24,
                color: "#1C1B19",
                margin: "12px 0",
              }}
            >
              Estimated {estimateLabel}
            </Text>
          </Section>

          <Section
            style={{
              borderTop: "1px solid rgba(28,27,25,0.1)",
              paddingTop: 16,
              marginTop: 16,
            }}
          >
            <Text
              style={{
                fontSize: 12,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "#B8621B",
                fontWeight: 600,
              }}
            >
              Detail
            </Text>
            {record.notes ? (
              <Text>
                <strong>Notes:</strong> {record.notes}
              </Text>
            ) : null}
            {record.eventAddress ? (
              <Text>
                <strong>Address:</strong> {record.eventAddress}
                {record.eventCity ? `, ${record.eventCity}` : ""}
                {record.zip ? ` ${record.zip}` : ""}
              </Text>
            ) : null}
            {record.howHeard ? (
              <Text>
                <strong>How heard:</strong> {record.howHeard}
              </Text>
            ) : null}
            <Text>
              <strong>Preferred contact:</strong> {record.contactMethod}
            </Text>
            <Text
              style={{
                fontFamily: "monospace",
                fontSize: 18,
                color: "#1C1B19",
                marginTop: 12,
              }}
            >
              Reference: {record.submissionId}
            </Text>
            <Text style={{ color: "#1C1B19", opacity: 0.6, fontSize: 14 }}>
              Received {record.createdAt}
            </Text>
          </Section>

          <Section style={{ marginTop: 24 }}>
            <Text style={{ color: "#1C1B19", opacity: 0.6, fontSize: 14 }}>
              From the Larrae's Kitchen site
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
