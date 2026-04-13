"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Heart, Building2, ArrowRight } from "lucide-react";

const roles = [
  {
    id: "donor",
    icon: Heart,
    label: "I'm a Donor",
    description: "Register as a blood or organ donor and help save lives in your community.",
    href: "/dashboard/donor",
    color: "from-primary/10 to-primary/5",
    iconBg: "bg-primary/10 text-primary",
  },
  {
    id: "hospital",
    icon: Building2,
    label: "Hospital Staff",
    description: "Access the hospital dashboard to manage donor requests and AI-powered matching.",
    href: "/dashboard/hospital",
    color: "from-accent/10 to-accent/5",
    iconBg: "bg-accent/10 text-accent",
  },
];

export default function RoleSelectPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl space-y-8 text-center"
      >
        <div className="space-y-3">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <Heart className="h-7 w-7" />
          </div>
          <h1 className="text-3xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
            Choose Your Role
          </h1>
          <p className="text-muted-foreground">
            Select how you&apos;d like to use OPAL-AI. You can always change this later.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {roles.map((role, i) => (
            <motion.button
              key={role.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.1 }}
              onClick={() => router.push(role.href)}
              className={`group relative rounded-2xl border border-border bg-gradient-to-br ${role.color} p-8 text-left transition-all hover:shadow-xl hover:-translate-y-1 hover:border-primary/30`}
            >
              <div className={`flex h-14 w-14 items-center justify-center rounded-xl ${role.iconBg} mb-5 transition-transform group-hover:scale-110`}>
                <role.icon className="h-7 w-7" />
              </div>
              <h3
                className="text-xl font-semibold mb-2"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {role.label}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                {role.description}
              </p>
              <div className="flex items-center gap-1 text-sm font-medium text-primary">
                Continue
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
