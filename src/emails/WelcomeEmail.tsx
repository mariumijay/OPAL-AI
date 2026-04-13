import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface WelcomeEmailProps {
  name: string;
  email: string;
  donationType?: string;
  bloodType?: string;
  city?: string;
}

export const WelcomeEmail = ({
  name,
  email,
  donationType = "Organ & Blood Donor",
  bloodType = "N/A",
  city = "N/A",
}: WelcomeEmailProps) => {
  const previewText = `Welcome to OPAL-AI, ${name}! Your life-saving journey begins here.`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={logo}>OPAL<span style={{ color: "#DC2626" }}>-AI</span></Heading>
          </Section>
          
          <Section style={content}>
            <Heading style={h1}>Welcome {name}!</Heading>
            <Text style={paragraph}>
              You are now a registered donor on the OPAL-AI platform. Your generosity 
              can save lives and bring hope to families in need.
            </Text>
            
            <Section style={infoCard}>
              <Text style={label}>Registration Summary</Text>
              <Hr style={hr} />
              <div style={grid}>
                <div style={gridItem}>
                  <Text style={gridLabel}>Type</Text>
                  <Text style={gridValue}>{donationType}</Text>
                </div>
                <div style={gridItem}>
                  <Text style={gridLabel}>Blood Group</Text>
                  <Text style={gridValue}>{bloodType}</Text>
                </div>
                <div style={gridItem}>
                  <Text style={gridLabel}>City</Text>
                  <Text style={gridValue}>{city}</Text>
                </div>
              </div>
            </Section>

            <Button
              style={button}
              href={`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/donor`}
            >
              Complete Your Profile
            </Button>

            <Text style={paragraph}>
              If you have any questions, feel free to reply to this email or visit our Help Center.
            </Text>
          </Section>

          <Hr style={hr} />
          <Section style={footer}>
            <Text style={footerText}>
              © {new Date().getFullYear()} OPAL-AI • AI-Driven Life Matching
            </Text>
            <Text style={footerText}>
              You're receiving this because you signed up for OPAL-AI.
            </Text>
            <Link href={`${process.env.NEXT_PUBLIC_APP_URL}/privacy`} style={link}>
              Privacy Policy
            </Link>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default WelcomeEmail;

const main = {
  backgroundColor: "#0a0a0a",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: "0 auto",
  padding: "40px 20px",
  backgroundColor: "#0f0f0f",
  borderRadius: "12px",
  border: "1px solid #1f1f1f",
};

const header = {
  textAlign: "center" as const,
  marginBottom: "30px",
};

const logo = {
  fontSize: "24px",
  color: "#ffffff",
  margin: "0",
  fontWeight: "bold",
  letterSpacing: "1px",
};

const content = {
  padding: "0 20px",
};

const h1 = {
  color: "#DC2626",
  fontSize: "32px",
  fontWeight: "bold",
  textAlign: "center" as const,
  margin: "0 0 20px",
};

const paragraph = {
  color: "#a1a1aa",
  fontSize: "16px",
  lineHeight: "26px",
  textAlign: "center" as const,
};

const infoCard = {
  backgroundColor: "#161616",
  borderRadius: "8px",
  padding: "20px",
  margin: "30px 0",
  border: "1px solid #262626",
};

const label = {
  color: "#ffffff",
  fontSize: "14px",
  fontWeight: "bold",
  textTransform: "uppercase" as const,
  marginBottom: "10px",
  textAlign: "center" as const,
};

const grid = {
  display: "flex",
  justifyContent: "space-between",
};

const gridItem = {
  flex: 1,
  textAlign: "center" as const,
};

const gridLabel = {
  color: "#71717a",
  fontSize: "12px",
  margin: "0",
};

const gridValue = {
  color: "#ffffff",
  fontSize: "14px",
  fontWeight: "600",
  margin: "4px 0 0",
};

const button = {
  backgroundColor: "#DC2626",
  borderRadius: "6px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  padding: "16px",
  margin: "30px auto",
  width: "240px",
};

const hr = {
  borderColor: "#262626",
  margin: "20px 0",
};

const footer = {
  textAlign: "center" as const,
};

const footerText = {
  color: "#52525b",
  fontSize: "12px",
  lineHeight: "20px",
  margin: "0",
};

const link = {
  color: "#71717a",
  textDecoration: "underline",
  fontSize: "12px",
};
