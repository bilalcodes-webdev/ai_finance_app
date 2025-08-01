import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Heading,
  Text,
  Section,
  Row,
  Column,
} from "@react-email/components";
import * as React from "react";

export default function Email({ username, type, data }) {
  const { budgetAmount, totalExpense, accountName, totalPercentageUsed } = data;

  const remainingAmount = budgetAmount - totalExpense;

  if (type === "monthly-report") {
    return (
      <Html>
        <Head />
        <Preview>Your Monthly Financial Report</Preview>
        <Body style={styles.body}>
          <Container style={styles.container}>
            <Heading style={styles.title}>Monthly Financial Report</Heading>

            <Text style={styles.text}>Hello {userName},</Text>
            <Text style={styles.text}>
              Here&rsquo;s your financial summary for {data?.month}:
            </Text>

            {/* Main Stats */}
            <Section style={styles.statsContainer}>
              <div style={styles.stat}>
                <Text style={styles.text}>Total Income</Text>
                <Text style={styles.heading}>${data?.stats.totalIncome}</Text>
              </div>
              <div style={styles.stat}>
                <Text style={styles.text}>Total Expenses</Text>
                <Text style={styles.heading}>${data?.stats.totalExpenses}</Text>
              </div>
              <div style={styles.stat}>
                <Text style={styles.text}>Net</Text>
                <Text style={styles.heading}>
                  ${data?.stats.totalIncome - data?.stats.totalExpenses}
                </Text>
              </div>
            </Section>

            {/* Category Breakdown */}
            {data?.stats?.byCategory && (
              <Section style={styles.section}>
                <Heading style={styles.heading}>Expenses by Category</Heading>
                {Object.entries(data?.stats.byCategory).map(
                  ([category, amount]) => (
                    <div key={category} style={styles.row}>
                      <Text style={styles.text}>{category}</Text>
                      <Text style={styles.text}>${amount}</Text>
                    </div>
                  )
                )}
              </Section>
            )}

            {/* AI Insights */}
            {data?.insights && (
              <Section style={styles.section}>
                <Heading style={styles.heading}>Welth Insights</Heading>
                {data.insights.map((insight, index) => (
                  <Text key={index} style={styles.text}>
                    • {insight}
                  </Text>
                ))}
              </Section>
            )}

            <Text style={styles.footer}>
              Thank you for using Welth. Keep tracking your finances for better
              financial health!
            </Text>
          </Container>
        </Body>
      </Html>
    );
  }

  if (type === "budget-alert") {
    return (
      <Html>
        <Head />
        <Preview>You're close to reaching your budget limit</Preview>
        <Body style={main}>
          <Container style={container}>
            <Heading style={heading}>💸 Budget Alert</Heading>

            <Text style={paragraph}>
              Hey <strong>{username}</strong>, you’ve used{" "}
              <strong>{totalPercentageUsed.toFixed(2)}%</strong> of your monthly
              budget for account <strong>{accountName}</strong>.
            </Text>

            <Section style={card}>
              <Row>
                <Column style={statBox}>
                  <Text style={label}>Budget</Text>
                  <Text style={value}>₹{budgetAmount?.toLocaleString()}</Text>
                </Column>
                <Column style={statBox}>
                  <Text style={label}>Spent</Text>
                  <Text style={value}>₹{totalExpense?.toLocaleString()}</Text>
                </Column>
                <Column style={statBox}>
                  <Text style={label}>Remaining</Text>
                  <Text style={value}>
                    ₹{remainingAmount?.toLocaleString()}
                  </Text>
                </Column>
              </Row>
            </Section>

            <Text style={footerText}>
              Consider reviewing your spending or adjusting your budget settings
              in the app.
            </Text>
          </Container>
        </Body>
      </Html>
    );
  }

  return null;
}

// Styles
const baseFont = "'Helvetica Neue', Helvetica, Arial, sans-serif";

const styles = {
  body: {
    backgroundColor: "#f4f6f8",
    padding: "40px 0",
    fontFamily: baseFont,
  },
  container: {
    backgroundColor: "#ffffff",
    maxWidth: "600px",
    margin: "0 auto",
    padding: "32px",
    borderRadius: "10px",
    boxShadow: "0 6px 20px rgba(0, 0, 0, 0.05)",
  },
  title: {
    fontSize: "24px",
    fontWeight: "600",
    marginBottom: "12px",
    textAlign: "center",
    color: "#1a202c",
  },
  text: {
    fontSize: "15px",
    color: "#333",
    lineHeight: "1.6",
    marginBottom: "10px",
  },
  heading: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#1f2937",
    marginTop: "20px",
    marginBottom: "12px",
  },
  section: {
    marginTop: "24px",
    padding: "16px",
    backgroundColor: "#f9fafb",
    borderRadius: "8px",
  },
  statsContainer: {
    display: "flex",
    justifyContent: "space-between",
    backgroundColor: "#edf2f7",
    padding: "16px",
    borderRadius: "8px",
    marginTop: "20px",
    flexWrap: "wrap",
    gap: "10px",
  },
  stat: {
    flex: "1",
    minWidth: "100px",
    textAlign: "center",
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    padding: "8px 0",
    borderBottom: "1px solid #e2e8f0",
  },
  footer: {
    fontSize: "13px",
    color: "#777",
    marginTop: "32px",
    textAlign: "center",
  },
};

// These are already defined correctly and reused in `budget-alert`, no need to redefine, but grouped for clarity:
const main = {
  backgroundColor: "#f6f9fc",
  padding: "40px 0",
  fontFamily: baseFont,
};

const container = {
  backgroundColor: "#ffffff",
  borderRadius: "8px",
  maxWidth: "600px",
  margin: "0 auto",
  padding: "30px",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
};

const heading = {
  fontSize: "24px",
  marginBottom: "10px",
  textAlign: "center",
};

const paragraph = {
  fontSize: "16px",
  color: "#333",
  textAlign: "center",
};

const card = {
  backgroundColor: "#f1f5f9",
  borderRadius: "8px",
  padding: "20px",
  marginTop: "20px",
};

const statBox = {
  textAlign: "center",
};

const label = {
  fontSize: "14px",
  color: "#555",
  marginBottom: "5px",
};

const value = {
  fontSize: "18px",
  fontWeight: "bold",
  color: "#111",
};

const footerText = {
  marginTop: "30px",
  fontSize: "14px",
  color: "#888",
  textAlign: "center",
};
