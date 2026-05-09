"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  BookOpen,
  Bell,
  Heart,
  CheckCheck,
  Inbox,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// ── Types ─────────────────────────────────────────────────────────────────────

type NotifType = "achievement" | "learning" | "community" | "system";

interface Notification {
  id: string;
  type: NotifType;
  title: string;
  message: string;
  time: string;
  read: boolean;
}

// ── Sample data ───────────────────────────────────────────────────────────────

const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: "n1",
    type: "achievement",
    title: "Badge Earned!",
    message: "You earned the 'First Word' badge for submitting your first word to the archive.",
    time: "2 hours ago",
    read: false,
  },
  {
    id: "n2",
    type: "community",
    title: "Submission Approved",
    message: "Lepcha community approved your song submission 'River of Stars'. Great contribution!",
    time: "5 hours ago",
    read: false,
  },
  {
    id: "n3",
    type: "learning",
    title: "New Lesson Available",
    message: "Bhutia Script Level 2 is now available. Continue your learning journey today.",
    time: "1 day ago",
    read: true,
  },
  {
    id: "n4",
    type: "community",
    title: "New Elder Recording",
    message: "Elder Tenzing shared a new recording: 'Traditional Harvest Chant of Dzongu'. Listen now.",
    time: "1 day ago",
    read: true,
  },
  {
    id: "n5",
    type: "learning",
    title: "Streak Milestone!",
    message: "Your streak is at 7 days! Keep going — you're building a wonderful learning habit.",
    time: "2 days ago",
    read: true,
  },
  {
    id: "n6",
    type: "community",
    title: "Submission Rejected",
    message: "Submission rejected: Missing audio file. Please re-upload with a clear audio recording attached.",
    time: "3 days ago",
    read: false,
  },
  {
    id: "n7",
    type: "system",
    title: "Welcome to SIKKIMVERSE",
    message: "Your account is fully set up. Start your first lesson or explore the community archive.",
    time: "1 week ago",
    read: true,
  },
  {
    id: "n8",
    type: "achievement",
    title: "Level Up!",
    message: "You reached Level 3! You've mastered the basics of Lepcha script.",
    time: "1 week ago",
    read: true,
  },
];

// ── Constants ─────────────────────────────────────────────────────────────────

const TABS = ["All", "Learning", "Community", "System"] as const;
type Tab = typeof TABS[number];

const PAGE_SIZE = 5;

// ── Helpers ───────────────────────────────────────────────────────────────────

function getTypeIcon(type: NotifType) {
  const base = "h-5 w-5";
  switch (type) {
    case "achievement":
      return <Trophy className={cn(base, "text-gold")} aria-hidden />;
    case "learning":
      return <BookOpen className={cn(base, "text-primary")} aria-hidden />;
    case "community":
      return <Heart className={cn(base, "text-secondary")} aria-hidden />;
    case "system":
      return <Bell className={cn(base, "text-accent")} aria-hidden />;
  }
}

function getTypeBg(type: NotifType) {
  switch (type) {
    case "achievement":
      return "bg-gold/10 dark:bg-gold/15";
    case "learning":
      return "bg-primary/10 dark:bg-primary/15";
    case "community":
      return "bg-secondary/10 dark:bg-secondary/15";
    case "system":
      return "bg-accent/10 dark:bg-accent/15";
  }
}

function filterByTab(notifs: Notification[], tab: Tab): Notification[] {
  if (tab === "All") return notifs;
  const map: Record<Tab, NotifType[]> = {
    All: [],
    Learning: ["learning", "achievement"],
    Community: ["community"],
    System: ["system"],
  };
  return notifs.filter((n) => map[tab].includes(n.type));
}

// ── Notification item ─────────────────────────────────────────────────────────

function NotificationItem({
  notif,
  onRead,
}: {
  notif: Notification;
  onRead: (id: string) => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      onClick={() => !notif.read && onRead(notif.id)}
      className={cn(
        "relative flex gap-4 p-4 rounded-xl border transition-all duration-200 cursor-pointer group",
        notif.read
          ? "border-border bg-background-secondary/50 opacity-80"
          : "border-primary/20 bg-background-secondary hover:border-primary/40 hover:shadow-sm"
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          "flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center",
          getTypeBg(notif.type)
        )}
      >
        {getTypeIcon(notif.type)}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={cn("text-sm font-semibold", notif.read ? "text-foreground-secondary" : "text-foreground")}>
          {notif.title}
        </p>
        <p className="mt-0.5 text-sm text-foreground-muted leading-relaxed">
          {notif.message}
        </p>
        <p className="mt-1.5 text-xs text-foreground-muted/70">{notif.time}</p>
      </div>

      {/* Unread dot */}
      <AnimatePresence>
        {!notif.read && (
          <motion.span
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute top-4 right-4 h-2.5 w-2.5 rounded-full bg-secondary shrink-0"
            aria-label="Unread"
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────

function EmptyState({ tab }: { tab: Tab }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      {/* Text-based cultural art */}
      <pre className="text-foreground-muted/30 text-xs leading-tight mb-6 font-mono select-none" aria-hidden>
        {`    ╭─────────────╮
    │  ✦  ❋  ✦  │
    │  ❋     ❋  │
    │  ✦  ❋  ✦  │
    ╰─────────────╯`}
      </pre>
      <div className="h-14 w-14 rounded-full bg-background-tertiary flex items-center justify-center mb-4">
        <Inbox className="h-7 w-7 text-foreground-muted" aria-hidden />
      </div>
      <p className="text-foreground font-semibold text-lg">All caught up!</p>
      <p className="text-foreground-muted text-sm mt-1 max-w-xs">
        {tab === "All"
          ? "No notifications yet. Start a lesson or join a community to get updates."
          : `No ${tab.toLowerCase()} notifications yet.`}
      </p>
    </motion.div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);
  const [activeTab, setActiveTab] = useState<Tab>("All");
  const [page, setPage] = useState(1);

  const filtered = filterByTab(notifications, activeTab);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const unreadCount = notifications.filter((n) => !n.read).length;

  function markRead(id: string) {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }

  function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  function handleTabChange(tab: Tab) {
    setActiveTab(tab);
    setPage(1);
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Background accent */}
      <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" aria-hidden />

      <div className="relative mx-auto max-w-2xl px-4 sm:px-6 py-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
              Notifications
            </h1>
            {unreadCount > 0 && (
              <p className="text-sm text-foreground-muted mt-0.5">
                {unreadCount} unread message{unreadCount !== 1 ? "s" : ""}
              </p>
            )}
          </div>

          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              leftIcon={<CheckCheck className="h-3.5 w-3.5" />}
              onClick={markAllRead}
            >
              Mark all read
            </Button>
          )}
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex gap-1 p-1 bg-background-secondary rounded-xl border border-border mb-6"
        >
          {TABS.map((tab) => {
            const count = filterByTab(notifications, tab).filter((n) => !n.read).length;
            return (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={cn(
                  "relative flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                  activeTab === tab
                    ? "bg-background text-foreground shadow-sm"
                    : "text-foreground-muted hover:text-foreground"
                )}
              >
                {tab}
                {count > 0 && (
                  <span className="h-4 min-w-4 px-1 rounded-full bg-secondary text-white text-[10px] font-bold flex items-center justify-center">
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </motion.div>

        {/* Notifications list */}
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {paginated.length === 0 ? (
              <EmptyState key="empty" tab={activeTab} />
            ) : (
              paginated.map((notif, i) => (
                <motion.div
                  key={notif.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                >
                  <NotificationItem notif={notif} onRead={markRead} />
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-center justify-between mt-8 pt-6 border-t border-border"
          >
            <Button
              variant="outline"
              size="sm"
              leftIcon={<ChevronLeft className="h-3.5 w-3.5" />}
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </Button>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={cn(
                    "h-8 w-8 rounded-lg text-sm font-medium transition-all duration-150",
                    p === page
                      ? "bg-primary text-white"
                      : "text-foreground-muted hover:bg-background-secondary hover:text-foreground"
                  )}
                >
                  {p}
                </button>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              rightIcon={<ChevronRight className="h-3.5 w-3.5" />}
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
