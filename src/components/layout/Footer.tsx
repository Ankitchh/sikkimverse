import React from "react";
import Link from "next/link";
import {
  Globe,
  BookOpen,
  Archive,
  Users,
  Heart,
  GitFork,
  MessageCircle,
  Play,
  Mail,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Logo (server-safe, no client hooks) ───────────────────────────────────────

function FooterLogo() {
  return (
    <div className="flex items-start gap-2.5">
      <div className="relative h-8 w-8 shrink-0 mt-0.5">
        <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-forest to-forest-light opacity-90" />
        <div className="absolute inset-0 flex items-center justify-center">
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5 text-white"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <circle cx="12" cy="12" r="3" fill="currentColor" strokeWidth="0" />
            <circle cx="12" cy="12" r="9" />
            <line x1="12" y1="3" x2="12" y2="6" />
            <line x1="12" y1="18" x2="12" y2="21" />
            <line x1="3" y1="12" x2="6" y2="12" />
            <line x1="18" y1="12" x2="21" y2="12" />
            <line x1="5.6" y1="5.6" x2="7.8" y2="7.8" />
            <line x1="16.2" y1="16.2" x2="18.4" y2="18.4" />
            <line x1="18.4" y1="5.6" x2="16.2" y2="7.8" />
            <line x1="7.8" y1="16.2" x2="5.6" y2="18.4" />
          </svg>
        </div>
      </div>
      <div className="flex flex-col">
        <span className="font-bold text-base tracking-widest text-foreground">
          SIKKIMVERSE
        </span>
        <span className="text-xs text-foreground-muted mt-0.5 max-w-[220px] leading-relaxed">
          Preserving and celebrating the indigenous languages of Sikkim through AI-assisted learning.
        </span>
      </div>
    </div>
  );
}

// ── Link groups ───────────────────────────────────────────────────────────────

const COMMUNITY_LINKS = [
  { href: "/communities/nepali", label: "Nepali Community", icon: Users },
  { href: "/communities/sikkimese", label: "Sikkimese Community", icon: Users },
  { href: "/communities/lepcha", label: "Lepcha Community", icon: Users },
  { href: "/communities/bhutia", label: "Bhutia Community", icon: Users },
  { href: "/communities/limbu", label: "Limbu Community", icon: Users },
] as const;

const PLATFORM_LINKS = [
  { href: "/learn", label: "Start Learning", icon: BookOpen },
  { href: "/archive", label: "Language Archive", icon: Archive },
  { href: "/communities", label: "Communities", icon: Globe },
  { href: "/about", label: "About SIKKIMVERSE", icon: Heart },
] as const;

const SOCIAL_LINKS = [
  {
    href: "https://github.com/sikkimverse",
    label: "GitHub",
    icon: GitFork,
    external: true,
  },
  {
    href: "https://twitter.com/sikkimverse",
    label: "Twitter / X",
    icon: MessageCircle,
    external: true,
  },
  {
    href: "https://youtube.com/sikkimverse",
    label: "YouTube",
    icon: Play,
    external: true,
  },
  {
    href: "mailto:hello@sikkimverse.in",
    label: "Email us",
    icon: Mail,
    external: false,
  },
] as const;

interface FooterLinkProps {
  href: string;
  label: string;
  icon?: React.ElementType;
  external?: boolean;
}

function FooterLink({ href, label, icon: Icon, external }: FooterLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-1.5 text-sm text-foreground-muted",
        "hover:text-foreground transition-colors duration-150 group"
      )}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
    >
      {Icon && (
        <Icon className="h-3.5 w-3.5 shrink-0 text-foreground-muted/60 group-hover:text-primary transition-colors" aria-hidden />
      )}
      {label}
      {external && (
        <ExternalLink className="h-2.5 w-2.5 shrink-0 opacity-50" aria-hidden />
      )}
    </Link>
  );
}

// ── Stats bar ─────────────────────────────────────────────────────────────────

const STATS = [
  { label: "Languages", value: "8+" },
  { label: "Learners", value: "12K+" },
  { label: "Lessons", value: "500+" },
  { label: "Archived Hours", value: "2,000+" },
] as const;

// ── Footer ────────────────────────────────────────────────────────────────────

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="border-t border-border bg-background-secondary mt-auto"
      role="contentinfo"
    >
      {/* Stats strip */}
      <div className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {STATS.map(({ label, value }) => (
              <div key={label} className="flex flex-col items-center gap-0.5 text-center">
                <span className="text-xl font-bold text-gradient-cultural">
                  {value}
                </span>
                <span className="text-xs text-foreground-muted">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main footer content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand column */}
          <div className="lg:col-span-1">
            <FooterLogo />
            <p className="mt-4 text-sm text-foreground-muted leading-relaxed max-w-xs">
              An AI-assisted platform built with community, for community — preserving the rich linguistic
              tapestry of the Himalayan state of Sikkim.
            </p>
            {/* Social links */}
            <div className="mt-5 flex items-center gap-3">
              {SOCIAL_LINKS.map(({ href, label, icon: Icon, external }) => (
                <Link
                  key={href}
                  href={href}
                  aria-label={label}
                  target={external ? "_blank" : undefined}
                  rel={external ? "noopener noreferrer" : undefined}
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-md",
                    "bg-background-tertiary border border-border text-foreground-muted",
                    "hover:text-foreground hover:border-primary hover:bg-primary/5",
                    "transition-all duration-150"
                  )}
                >
                  <Icon className="h-4 w-4" aria-hidden />
                </Link>
              ))}
            </div>
          </div>

          {/* Communities */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" aria-hidden />
              Communities
            </h3>
            <ul className="flex flex-col gap-2.5" role="list">
              {COMMUNITY_LINKS.map(({ href, label, icon }) => (
                <li key={href}>
                  <FooterLink href={href} label={label} icon={icon} />
                </li>
              ))}
            </ul>
          </div>

          {/* Platform */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
              <Globe className="h-4 w-4 text-primary" aria-hidden />
              Platform
            </h3>
            <ul className="flex flex-col gap-2.5" role="list">
              {PLATFORM_LINKS.map(({ href, label, icon }) => (
                <li key={href}>
                  <FooterLink href={href} label={label} icon={icon} />
                </li>
              ))}
            </ul>
          </div>

          {/* Government acknowledgment */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4">
              Acknowledgments
            </h3>
            <div className={cn(
              "rounded-xl border border-border bg-background-tertiary p-4",
              "flex flex-col gap-2"
            )}>
              <p className="text-xs text-foreground-muted leading-relaxed">
                Developed in partnership with communities across Sikkim. We acknowledge the support of
                indigenous language speakers and cultural custodians who make this work possible.
              </p>
              <p className="text-xs text-foreground-muted leading-relaxed">
                Supported by initiatives for the preservation of Scheduled Tribe languages under the
                Government of India&apos;s linguistic heritage framework.
              </p>
              <div className={cn(
                "mt-1 flex items-center gap-1.5 text-xs font-medium",
                "text-gradient-cultural"
              )}>
                <Heart className="h-3 w-3 text-saffron" aria-hidden />
                <span className="text-saffron-dark dark:text-saffron">Made with love for Sikkim</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-foreground-muted text-center sm:text-left">
            &copy; {currentYear} SIKKIMVERSE. All rights reserved. Preserving linguistic heritage with
            care and community consent.
          </p>
          <div className="flex items-center gap-4">
            {[
              { href: "/privacy", label: "Privacy Policy" },
              { href: "/terms", label: "Terms of Service" },
              { href: "/accessibility", label: "Accessibility" },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="text-xs text-foreground-muted hover:text-foreground transition-colors"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
