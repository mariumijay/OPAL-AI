import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "OPAL-AI | Hospital Portal Registration",
  description: "Register your healthcare facility on OPAL-AI to instantly match with verified blood and organ donors using advanced AI.",
};

export default function HospitalSignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
