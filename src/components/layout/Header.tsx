"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  BookOpen,
  Globe,
  Archive,
  Sun,
  Moon,
  Menu,
  X,
  ChevronDown,
  LogIn,
  LogOut,
  User,
  Settings,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/providers/ThemeProvider";
import { useSession, signOut } from "next-auth/react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { NotificationBell } from "@/components/features/NotificationBell";

// ── Nav items ─────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/learn", label: "Learn", icon: BookOpen },
  { href: "/communities", label: "Communities", icon: Globe },
  { href: "/archive", label: "Archive", icon: Archive },
] as const;

// ── Logo ──────────────────────────────────────────────────────────────────────

function SikkimverseLogo() {
  return (
    <Link
      href="/"
      className="flex items-center gap-2.5 group shrink-0"
      aria-label="SIKKIMVERSE home"
    >
      {/* Cultural knot / mandala icon */}
      <div className="relative h-8 w-8 shrink-0">
        <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-forest to-forest-light opacity-90 group-hover:opacity-100 transition-opacity" />
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
            {/* Simplified dharmachakra / lotus motif */}
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
        {/* Saffron dot accent */}
        <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-saffron border border-background" />
      </div>

      <div className="flex flex-col leading-none">
        <span className="font-bold text-base tracking-widest text-foreground group-hover:text-primary transition-colors">
          SIKKIMVERSE
        </span>
        <span className="text-[9px] tracking-[0.15em] text-foreground-muted uppercase">
          Language Heritage
        </span>
      </div>
    </Link>
  );
}

// ── Desktop nav link ───────────────────────────────────────────────────────────

interface NavLinkProps {
  href: string;
  label: string;
  icon: React.ElementType;
  active: boolean;
}

function NavLink({ href, label, icon: Icon, active }: NavLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        "relative flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium",
        "transition-all duration-200 group",
        active
          ? "text-primary bg-primary/8"
          : "text-foreground-secondary hover:text-foreground hover:bg-background-secondary"
      )}
      aria-current={active ? "page" : undefined}
    >
      <Icon
        className={cn(
          "h-4 w-4 transition-colors",
          active ? "text-primary" : "text-foreground-muted group-hover:text-foreground"
        )}
        aria-hidden
      />
      {label}
      {active && (
        <motion.span
          layoutId="nav-indicator"
          className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-primary"
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      )}
    </Link>
  );
}

// ── Theme toggle ───────────────────────────────────────────────────────────────

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        "relative h-8 w-14 rounded-full border transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2",
        isDark
          ? "bg-forest/20 border-forest/30"
          : "bg-amber-100 border-amber-200"
      )}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <motion.span
        className={cn(
          "absolute top-0.5 h-6 w-6 rounded-full flex items-center justify-center shadow-sm",
          isDark ? "bg-forest text-white" : "bg-amber-400 text-white"
        )}
        animate={{ x: isDark ? 24 : 2 }}
        transition={{ type: "spring", stiffness: 500, damping: 35 }}
      >
        {isDark ? (
          <Moon className="h-3.5 w-3.5" aria-hidden />
        ) : (
          <Sun className="h-3.5 w-3.5" aria-hidden />
        )}
      </motion.span>
    </button>
  );
}

// ── User menu ─────────────────────────────────────────────────────────────────

function UserMenu() {
  const { data: session, status } = useSession();
  const user = session?.user ?? null;
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  if (status === "loading") {
    return (
      <div className="h-8 w-8 rounded-full bg-background-tertiary animate-pulse" />
    );
  }

  if (!user) {
    return (
      <Button
        variant="cultural"
        size="sm"
        leftIcon={<LogIn className="h-3.5 w-3.5" />}
        asChild
      >
        <Link href="/auth/signin">Sign in</Link>
      </Button>
    );
  }

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex items-center gap-2 rounded-lg px-2 py-1.5",
          "transition-colors hover:bg-background-secondary",
          "focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
        )}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <Avatar
          src={user?.image}
          name={user?.name ?? "U"}
          size="sm"
          ring="primary"
        />
        <div className="hidden md:flex flex-col items-start leading-none">
          <span className="text-sm font-medium text-foreground truncate max-w-[120px]">
            {user?.name ?? "User"}
          </span>
          <Badge variant="cultural" size="sm" className="mt-0.5">
            {(user as { role?: string })?.role ?? "Member"}
          </Badge>
        </div>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 text-foreground-muted transition-transform duration-200",
            open && "rotate-180"
          )}
          aria-hidden
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              "absolute right-0 top-full mt-2 w-56 z-50",
              "glass rounded-xl border border-border shadow-lg",
              "py-1.5 overflow-hidden"
            )}
            role="menu"
          >
            {/* User info */}
            <div className="px-3 py-2.5 border-b border-border">
              <p className="text-sm font-semibold text-foreground">{user?.name ?? "User"}</p>
              <p className="text-xs text-foreground-muted truncate">{user?.email ?? ""}</p>
              <div className="mt-1.5 flex items-center gap-1.5">
                <Star className="h-3 w-3 text-gold" aria-hidden />
                <span className="text-xs text-gold-dark font-medium">
                  {((user as { xp?: number })?.xp ?? 0).toLocaleString()} XP
                </span>
              </div>
            </div>

            {/* Menu items */}
            <div className="py-1">
              {[
                { href: "/profile", label: "My Profile", icon: User },
                { href: "/settings", label: "Settings", icon: Settings },
              ].map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center gap-2.5 px-3 py-2 text-sm text-foreground-secondary",
                    "hover:bg-background-secondary hover:text-foreground transition-colors"
                  )}
                  role="menuitem"
                  onClick={() => setOpen(false)}
                >
                  <Icon className="h-4 w-4" aria-hidden />
                  {label}
                </Link>
              ))}
            </div>

            <div className="border-t border-border py-1">
              <button
                className={cn(
                  "flex w-full items-center gap-2.5 px-3 py-2 text-sm text-red-500",
                  "hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                )}
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  signOut({ callbackUrl: "/" });
                }}
              >
                <LogOut className="h-4 w-4" aria-hidden />
                Sign out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Mobile menu ───────────────────────────────────────────────────────────────

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
  pathname: string;
}

function MobileMenu({ open, onClose, pathname }: MobileMenuProps) {
  const { theme, toggleTheme } = useTheme();

  // Lock body scroll while open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 350, damping: 35 }}
            className={cn(
              "fixed right-0 top-0 bottom-0 z-50 w-72 max-w-[90vw]",
              "glass border-l border-border",
              "flex flex-col overflow-y-auto"
            )}
            role="dialog"
            aria-label="Mobile navigation"
            aria-modal="true"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <SikkimverseLogo />
              <button
                onClick={onClose}
                className="rounded-md p-1.5 text-foreground-muted hover:text-foreground hover:bg-background-secondary transition-colors"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>

            {/* Nav links */}
            <nav className="flex-1 px-3 py-4 flex flex-col gap-1" aria-label="Mobile navigation">
              {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
                const active = pathname === href || (href !== "/" && pathname.startsWith(href));
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium",
                      "transition-all duration-150",
                      active
                        ? "bg-primary/10 text-primary"
                        : "text-foreground-secondary hover:bg-background-secondary hover:text-foreground"
                    )}
                    aria-current={active ? "page" : undefined}
                  >
                    <Icon className="h-5 w-5 shrink-0" aria-hidden />
                    {label}
                    {active && (
                      <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" aria-hidden />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-border">
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground-muted">
                  {theme === "dark" ? "Dark mode" : "Light mode"}
                </span>
                <ThemeToggle />
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ── Main Header ───────────────────────────────────────────────────────────────

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 12);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on pathname change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-30 w-full",
          "transition-all duration-300",
          scrolled
            ? "glass border-b border-border shadow-md"
            : "bg-background/80 backdrop-blur-sm border-b border-transparent"
        )}
        role="banner"
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <SikkimverseLogo />

          {/* Desktop Nav */}
          <nav
            className="hidden md:flex items-center gap-1"
            aria-label="Main navigation"
          >
            {NAV_ITEMS.map(({ href, label, icon }) => {
              const active =
                pathname === href ||
                (href !== "/" && pathname.startsWith(href));
              return (
                <NavLink
                  key={href}
                  href={href}
                  label={label}
                  icon={icon}
                  active={active}
                />
              );
            })}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Notification bell */}
            <NotificationBell />

            {/* Theme toggle (desktop) */}
            <div className="hidden sm:block">
              <ThemeToggle />
            </div>

            {/* User menu */}
            <UserMenu />

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(true)}
              className={cn(
                "md:hidden rounded-md p-2",
                "text-foreground-secondary hover:text-foreground hover:bg-background-secondary",
                "transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
              )}
              aria-label="Open navigation menu"
              aria-expanded={mobileOpen}
            >
              <Menu className="h-5 w-5" aria-hidden />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      <MobileMenu
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        pathname={pathname}
      />
    </>
  );
}

export default Header;
