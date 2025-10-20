import * as React from "react";
import { Body, Container, Head, Heading, Html, Preview, Section, Text } from "@react-email/components";

export default function EmailTemplate({
  userName = "",
  type = "budget-alert",
  data = {},
}) {

  if (type === "budget-alert") {
    return (
      <Html>
        <Head />
        <Preview>Budget Alert</Preview>
        <Body style={styles.body}> 
          <Container style={styles.container}>
            <Heading style={styles.title}>Budget Alert</Heading>
            <Text style={styles.text}>Hello {userName}</Text>
            <Text style={styles.text}>
              You&rsquo;ve used {data?.usagePercentage.toFixed(2)}% of your monthly budget.
            </Text>
            <Section style={styles.statsContainer}>
              <div style={styles.stat}>
                <Text style={styles.statLabel}>Budget Amount</Text>
                <Text style={styles.statValue}>₹{data?.budgetAmount}</Text>
              </div>

              <div style={styles.stat}>
                <Text style={styles.statLabel}>Spent So Far</Text>
                <Text style={styles.statValue}>₹{data?.totalExpenses}</Text>
              </div>

              <div style={styles.stat}>
                <Text style={styles.statLabel}>Remaining</Text>
                <Text style={styles.statValue}>
                  ₹{data?.budgetAmount - data?.totalExpenses}
                </Text>
              </div>
            </Section>
          </Container>
        </Body>
      </Html>
    );
  }

  // Return null or a default template for other types
  return null;
}

const styles = {
  body: {
    backgroundColor: "#dcebfa",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    padding: "20px 0",
    margin: 0,
  },
  container: {
    backgroundColor: "#ffffff",
    margin: "0 auto",
    padding: "20px",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    maxWidth: "600px",
  },
  title: {
    fontSize: "24px",
    fontWeight: "bold",
    color: "#1f2937",
    textAlign: "center",
    margin: "0 0 20px",
    padding: 0,
  },
  text: {
    fontSize: "16px",
    lineHeight: "1.5",
    color: "#4b5563",
    margin: "0 0 16px",
  },
  statsContainer: {
    margin: "32px 0",
    padding: "20px",
    backgroundColor: "#f9fafb",
    borderRadius: "8px",
    border: "1px solid #e5e7eb",
  },
  stat: {
    marginBottom: "16px",
    padding: "16px",
    borderRadius: "6px",
    backgroundColor: "#ffffff",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statLabel: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#374151",
    margin: 0,
  },
  statValue: {
    fontSize: "16px",
    fontWeight: "bold",
    color: "#111827",
    margin: 0,
  },
};