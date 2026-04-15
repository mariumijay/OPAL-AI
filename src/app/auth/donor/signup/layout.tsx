import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "OPAL-AI | Donor Registration",
  description: "Join Pakistan's first AI-powered Donor Network. Register to donate blood or organs and connect with hospitals to save lives.",
};

export default function DonorSignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
