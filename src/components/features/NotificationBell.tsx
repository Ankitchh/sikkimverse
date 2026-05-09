"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, CheckCircle2, BookOpen, Star, AlertTriangle, X } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Notification {
  id: string;
  type: "lesson" | "achievement" | "moderation" | "system";
  title: string;
  body: string;
  href?: string;
  read: boolean;
  createdAt: string;
}

const ICON_MAP = {
  lesson:      { icon: BookOpen,      bg: "bg-blue-100 dark:bg-blue-900/30",      color: "text-blue-600 dark:text-blue-400" },
  achievement: { icon: Star,          bg: "bg-amber-100 dark:bg-amber-900/30",    color: "text-amber-600 dark:text-amber-400" },
  moderation:  { icon: AlertTriangle, bg: "bg-orange-100 dark:bg-orange-900/30",  color: "text-orange-600 dark:text-orange-400" },
  system:      { icon: CheckCircle2,  bg: "bg-green-100 dark:bg-green-900/30",    color: "text-green-600 dark:text-green-400" },
};

const SAMPLE: Notification[] = [
  { id: "1", type: "achievement", title: "Badge Unlocked!", body: "You earned the 'First Song' badge for archiving a cultural song.", href: "/profile", read: false, createdAt: "2 min ago" },
  { id: "2", type: "moderation", title: "Submission Approved", body: "Your recording 'Elder Lhendup Chant' has been approved.", href: "/dashboard/contributor", read: false, createdAt: "1 hr ago" },
  { id: "3", type: "lesson", title: "New Lesson Available", body: "Lepcha Script Basics — Level 2 is now available.", href: "/learn", read: true, createdAt: "3 hr ago" },
  { id: "4", type: "system", title: "Streak Milestone", body: "You've maintained a 7-day learning streak!", read: true, createdAt: "Yesterday" },
];

// ─── Component ────────────────────────────────────────────────────────────────

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(SAMPLE);
  const panelRef = useRef<HTMLDivElement>(null);

  const unread = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  const markAllRead = () =>
    setNotifications((ns) => ns.map((n) => ({ ...n, read: true })));

  const dismiss = (id: string) =>
    setNotifications((ns) => ns.filter((n) => n.id !== id));

  const markRead = (id: string) =>
    setNotifications((ns) => ns.map((n) => (n.id === id ? { ...n, read: true } : n)));

  return (
    <div ref={panelRef} className="relative">
      {/* Bell button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "relative p-2 rounded-lg transition-colors",
          "text-foreground-secondary hover:text-foreground hover:bg-background-secondary",
          "focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
        )}
        aria-label={`Notifications${unread ? ` (${unread} unread)` : ""}`}
        aria-expanded={open}
      >
        <Bell className="w-5 h-5" />
        <AnimatePresence>
          {unread > 0 && (
            <motion.span
              key="badge"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center px-0.5"
            >
              {unread > 9 ? "9+" : unread}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              "absolute right-0 top-full mt-2 w-80 z-50",
              "bg-background-secondary border border-border rounded-2xl shadow-xl",
              "overflow-hidden"
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <span className="font-semibold text-foreground text-sm">Notifications</span>
              <div className="flex items-center gap-2">
                {unread > 0 && (
                  <button onClick={markAllRead}
                    className="text-xs text-primary hover:underline">
                    Mark all read
                  </button>
                )}
                <Link href="/notifications" onClick={() => setOpen(false)}
                  className="text-xs text-foreground-muted hover:text-foreground transition-colors">
                  View all
                </Link>
              </div>
            </div>

            {/* List */}
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="py-10 text-center">
                  <Bell className="w-8 h-8 text-foreground-muted mx-auto mb-2 opacity-40" />
                  <p className="text-sm text-foreground-muted">No notifications</p>
                </div>
              ) : (
                notifications.map((n) => {
                  const cfg = ICON_MAP[n.type];
                  const Icon = cfg.icon;
                  const inner = (
                    <div className={cn(
                      "flex items-start gap-3 px-4 py-3 border-b border-border last:border-0 transition-colors cursor-pointer",
                      !n.read ? "bg-primary/5 hover:bg-primary/10" : "hover:bg-background-tertiary"
                    )} onClick={() => { markRead(n.id); setOpen(false); }}>
                      <div className={cn("p-2 rounded-xl shrink-0 mt-0.5", cfg.bg)}>
                        <Icon className={cn("w-3.5 h-3.5", cfg.color)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={cn("text-xs font-semibold", !n.read ? "text-foreground" : "text-foreground-secondary")}>
                            {n.title}
                          </p>
                          <button onClick={(e) => { e.stopPropagation(); dismiss(n.id); }}
                            className="p-0.5 text-foreground-muted hover:text-foreground shrink-0 transition-colors">
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                        <p className="text-xs text-foreground-muted mt-0.5 leading-relaxed line-clamp-2">{n.body}</p>
                        <p className="text-[10px] text-foreground-muted mt-1">{n.createdAt}</p>
                      </div>
                      {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1.5" />}
                    </div>
                  );
                  return n.href
                    ? <Link key={n.id} href={n.href}>{inner}</Link>
                    : <div key={n.id}>{inner}</div>;
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default NotificationBell;
