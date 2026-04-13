"use client";

import Link from "next/link";
import { Heart, Mail, Phone, MapPin, GitBranch, X, Link2, ShieldCheck, Activity } from "lucide-react";
import { motion } from "framer-motion";
import { Tooltip } from "@/components/shared/Tooltip";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-background pt-24 pb-12 border-t border-border">
      {/* Background decoration */}
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Brand Column */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-2">
              <Heart className="h-7 w-7 text-primary" />
              <span className="text-xl font-bold font-display tracking-tight">OPAL<span className="text-primary">-AI</span></span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Bridging the gap in emergency medical logistics through high-frequency geospatial matching and AI-driven donor networks.
            </p>
            <div className="flex items-center gap-4">
              {[
                { Icon: GitBranch, name: "GitHub Source" },
                { Icon: X, name: "X (Twitter)" },
                { Icon: Link2, name: "Official Website" }
              ].map(({ Icon, name }, i) => (
                <Tooltip key={i} content={name}>
                  <Link href="#" className="h-8 w-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-all">
                    <Icon className="h-4 w-4" />
                  </Link>
                </Tooltip>
              ))}
            </div>
          </div>

          {/* Platform Column */}
          <div className="space-y-6">
            <h4 className="text-sm font-bold uppercase tracking-widest text-foreground">Platform</h4>
            <ul className="space-y-4">
              <li><Link href="/auth/donor/signup" className="text-sm text-muted-foreground hover:text-primary transition-colors">Donor Network</Link></li>
              <li><Link href="/auth/hospital/signup" className="text-sm text-muted-foreground hover:text-primary transition-colors">Hospital Registry</Link></li>
              <li><Link href="/auth/login" className="text-sm text-muted-foreground hover:text-primary transition-colors">Medical Portal</Link></li>
              <li><Link href="/#statistics" className="text-sm text-muted-foreground hover:text-primary transition-colors">Live Statistics</Link></li>
              <li><Link href="/#how-it-works" className="text-sm text-muted-foreground hover:text-primary transition-colors">Technical Protocol</Link></li>
            </ul>
          </div>

          {/* Legal Column */}
          <div className="space-y-6">
            <h4 className="text-sm font-bold uppercase tracking-widest text-foreground">Compliance</h4>
            <ul className="space-y-4">
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Privacy Ethics</Link></li>
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Data Security</Link></li>
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Licensing Terms</Link></li>
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">SLA Agreement</Link></li>
            </ul>
          </div>

          {/* Contact Column */}
          <div className="space-y-6">
            <h4 className="text-sm font-bold uppercase tracking-widest text-foreground">Emergency Support</h4>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground">National Health Complex, Sector H-8, Islamabad, Pakistan</p>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-primary shrink-0" />
                <p className="text-sm text-muted-foreground">central@opal-ai.org</p>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-primary shrink-0" />
                <p className="text-sm text-muted-foreground">+92 (300) 000-OPAL</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Banner */}
        <div className="pt-12 border-t border-border flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">
              <ShieldCheck className="h-3 w-3 text-success" />
              Verified ISO-27001
            </div>
            <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">
              <Activity className="h-3 w-3 text-primary animate-pulse" />
              Pulse Active: Global Status
            </div>
          </div>
          
          <p className="text-xs text-muted-foreground">
            &copy; {currentYear} OPAL-AI Research Group. Building for a better future.
          </p>
        </div>
      </div>
    </footer>
  );
}
