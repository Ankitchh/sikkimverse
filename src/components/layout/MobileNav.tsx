"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Home, BookOpen, Globe, Archive, User } from "lucide-react";
import { cn } from "@/lib/utils";

const TAB_ITEMS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/learn", label: "Learn", icon: BookOpen },
  { href: "/communities", label: "Communities", icon: Globe },
  { href: "/archive", label: "Archive", icon: Archive },
  { href: "/profile", label: "Profile", icon: User },
] as const;

interface TabItemProps {
  href: string;
  label: string;
  icon: React.ElementType;
  active: boolean;
}

function TabItem({ href, label, icon: Icon, active }: TabItemProps) {
  return (
    <Link
      href={href}
      className={cn(
        "relative flex flex-col items-center justify-center gap-0.5 flex-1 py-2 px-1",
        "transition-colors duration-200 focus-visible:outline-none",
        "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 rounded-xl"
      )}
      aria-label={label}
      aria-current={active ? "page" : undefined}
    >
      {/* Active background pill */}
      <AnimatePresence>
        {active && (
          <motion.span
            layoutId="mobile-nav-pill"
            className={cn(
              "absolute inset-x-1 top-1 h-8 rounded-xl",
              "bg-gradient-to-b from-primary/20 to-primary/10"
            )}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{ type: "spring", stiffness: 500, damping: 35 }}
            aria-hidden
          />
        )}
      </AnimatePresence>

      {/* Icon with scale animation */}
      <motion.span
        animate={active ? { scale: 1.15 } : { scale: 1 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="relative z-10"
        aria-hidden
      >
        <Icon
          className={cn(
            "h-5 w-5 transition-colors duration-200",
            active ? "text-primary" : "text-foreground-muted"
          )}
          strokeWidth={active ? 2.25 : 1.75}
        />
      </motion.span>

      {/* Active gradient indicator dot */}
      <AnimatePresence>
        {active && (
          <motion.span
            className="absolute bottom-1 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-gradient-to-r from-forest to-saffron"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ duration: 0.2 }}
            aria-hidden
          />
        )}
      </AnimatePresence>

      {/* Label */}
      <span
        className={cn(
          "relative z-10 text-[10px] font-medium leading-none transition-colors duration-200",
          active ? "text-primary" : "text-foreground-muted"
        )}
      >
        {label}
      </span>
    </Link>
  );
}

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        "fixed bottom-3 left-1/2 -translate-x-1/2 z-30",
        "w-[calc(100%-24px)] max-w-sm",
        "md:hidden", // hidden on desktop — use Header instead
        "safe-area-inset-bottom"
      )}
      aria-label="Mobile bottom navigation"
      role="navigation"
    >
      <motion.div
        className={cn(
          "flex items-stretch rounded-2xl",
          "glass border border-border",
          "shadow-xl shadow-black/20",
          "px-1 py-1"
        )}
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 350, damping: 35, delay: 0.1 }}
      >
        {TAB_ITEMS.map(({ href, label, icon }) => {
          const active =
            pathname === href ||
            (href !== "/" && pathname.startsWith(href));
          return (
            <TabItem
              key={href}
              href={href}
              label={label}
              icon={icon}
              active={active}
            />
          );
        })}
      </motion.div>
    </nav>
  );
}

export default MobileNav;
