// Source: Plan 03-05 Task 1 — React Email template for the inquirer's confirmation.
// CONTEXT D-17 (warm heritage voice, mirrors on-site confirmation screen) +
// UI-SPEC §Email copy (opening heritage line LOCKED verbatim) + LEAD-09.
import { Body, Container, Head, Heading, Html, Link, Section, Text } from "@react-email/components";
import type { LeadRecord } from "@/lib/leads/LeadStore";

export interface LeadConfirmationProps {
  record: LeadRecord;
  chefEmail: string;
}

export default function LeadConfirmation({ record, chefEmail }: LeadConfirmationProps) {
  const firstName = record.name.split(/\s+/)[0] ?? record.name;
  const hasEstimate = record.finalEstimateMin != null && record.finalEstimateMax != null;
  const estimateLabel = hasEstimate
    ? `$${record.finalEstimateMin}–$${record.finalEstimateMax}`
    : "Custom quote — we'll tailor this together";

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
              REQUEST RECEIVED
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
              Thanks, {firstName} — your request is in.
            </Heading>
            <Text style={{ fontSize: 16, color: "#1C1B19", lineHeight: 1.5 }}>
              We cook like family, and we treat every inquiry the same way.
            </Text>
            <Text style={{ fontSize: 16, color: "#1C1B19", lineHeight: 1.5 }}>
              Chef Larry will reply within 24 hours to confirm details and send a final quote. Keep
              an eye on your inbox — and your spam folder, just in case.
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
              What you told us
            </Text>
            <Text>
              <strong>Event type:</strong> {record.eventType}
            </Text>
            <Text>
              <strong>Guests:</strong> {record.guestCount}
            </Text>
            <Text>
              <strong>Date:</strong> {record.eventDate}
            </Text>
            <Text>
              <strong>Package:</strong> {record.packageId}
            </Text>
            <Text
              style={{
                fontFamily: "'Playfair Display', serif",
                fontStyle: "italic",
                fontSize: 20,
                color: "#1C1B19",
              }}
            >
              Estimated {estimateLabel}
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
          </Section>

          <Section style={{ marginTop: 24 }}>
            <Text style={{ color: "#1C1B19", fontSize: 16 }}>
              Questions? Reply here or email{" "}
              <Link href={`mailto:${chefEmail}`} style={{ color: "#2E4A2F", fontWeight: 600 }}>
                {chefEmail}
              </Link>
              .
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
