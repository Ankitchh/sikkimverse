"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { User, BookOpen, Palette, Bell, Shield, LogOut, Moon, Sun, ChevronRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";

type Tab = "profile" | "learning" | "appearance" | "notifications" | "privacy" | "account";

const TABS: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "profile",       label: "Profile",       icon: User },
  { id: "learning",      label: "Learning",      icon: BookOpen },
  { id: "appearance",    label: "Appearance",    icon: Palette },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "privacy",       label: "Privacy",       icon: Shield },
  { id: "account",       label: "Account",       icon: LogOut },
];

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={cn(
        "relative w-11 h-6 rounded-full transition-colors duration-200",
        checked ? "bg-primary" : "bg-border"
      )}
    >
      <span className={cn(
        "absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200",
        checked && "translate-x-5"
      )} />
    </button>
  );
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [fontSize, setFontSize] = useState<"normal" | "large" | "xl">("normal");
  const [dailyGoal, setDailyGoal] = useState(10);
  const [notifs, setNotifs] = useState({ streak: true, newContent: true, community: true, achievements: true, email: false });
  const [privacy, setPrivacy] = useState({ publicProfile: true, showAchievements: true, shareProgress: false });
  const [saved, setSaved] = useState(false);

  const save = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8">
      <div className="max-w-3xl mx-auto px-4 pt-8">
        <h1 className="text-2xl font-bold text-foreground mb-6">Settings</h1>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <nav className="md:w-48 flex md:flex-col gap-1 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all",
                  activeTab === tab.id
                    ? "bg-primary text-white"
                    : "text-foreground-muted hover:bg-background-secondary hover:text-foreground"
                )}
              >
                <tab.icon className="w-4 h-4 shrink-0" />
                {tab.label}
              </button>
            ))}
          </nav>

          {/* Content */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-1 space-y-4"
          >
            {/* PROFILE */}
            {activeTab === "profile" && (
              <>
                <div className="bg-background-secondary rounded-2xl p-5 border border-border space-y-4">
                  <h2 className="font-semibold text-foreground">Personal Information</h2>
                  {[
                    { label: "Full Name", value: "Karma Tshering", type: "text" },
                    { label: "Email", value: "karma@example.com", type: "email" },
                    { label: "Bio", value: "Learning Lepcha to connect with my roots 🌿", type: "textarea" },
                  ].map((field) => (
                    <div key={field.label}>
                      <label className="text-xs font-medium text-foreground-muted block mb-1.5">{field.label}</label>
                      {field.type === "textarea" ? (
                        <textarea
                          defaultValue={field.value}
                          rows={3}
                          className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm text-foreground resize-none focus:outline-none focus:border-primary"
                        />
                      ) : (
                        <input
                          type={field.type}
                          defaultValue={field.value}
                          className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:border-primary"
                        />
                      )}
                    </div>
                  ))}
                  <div>
                    <label className="text-xs font-medium text-foreground-muted block mb-1.5">Primary Community</label>
                    <select className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:border-primary">
                      {["Lepcha","Bhutia","Limbu","Tamang","Rai","Gurung","Sherpa","Mangar","Newar","Sunwar"].map(c => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </>
            )}

            {/* LEARNING */}
            {activeTab === "learning" && (
              <div className="bg-background-secondary rounded-2xl p-5 border border-border space-y-5">
                <h2 className="font-semibold text-foreground">Learning Preferences</h2>
                <div>
                  <p className="text-sm font-medium text-foreground mb-3">Daily XP Goal</p>
                  <div className="grid grid-cols-4 gap-2">
                    {[5, 10, 20, 30].map((g) => (
                      <button
                        key={g}
                        onClick={() => setDailyGoal(g)}
                        className={cn(
                          "py-2.5 rounded-xl border text-sm font-semibold transition-all",
                          dailyGoal === g
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border text-foreground-muted hover:border-primary/30"
                        )}
                      >
                        {g} XP
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between py-2 border-t border-border">
                  <div>
                    <p className="text-sm font-medium text-foreground">Sound Effects</p>
                    <p className="text-xs text-foreground-muted">Play sounds during exercises</p>
                  </div>
                  <Toggle checked={true} onChange={() => {}} />
                </div>
                <div className="flex items-center justify-between py-2 border-t border-border">
                  <div>
                    <p className="text-sm font-medium text-foreground">Auto-play Audio</p>
                    <p className="text-xs text-foreground-muted">Auto-play native speaker audio</p>
                  </div>
                  <Toggle checked={false} onChange={() => {}} />
                </div>
              </div>
            )}

            {/* APPEARANCE */}
            {activeTab === "appearance" && (
              <div className="bg-background-secondary rounded-2xl p-5 border border-border space-y-5">
                <h2 className="font-semibold text-foreground">Appearance</h2>
                <div>
                  <p className="text-sm font-medium text-foreground mb-3">Theme</p>
                  <div className="grid grid-cols-2 gap-3">
                    {(["dark","light"] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => setTheme(t)}
                        className={cn(
                          "flex items-center gap-3 px-4 py-3 rounded-xl border transition-all",
                          theme === t ? "border-primary bg-primary/10" : "border-border hover:border-primary/30"
                        )}
                      >
                        {t === "dark" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                        <span className="text-sm font-medium text-foreground capitalize">{t}</span>
                        {theme === t && <Check className="w-4 h-4 text-primary ml-auto" />}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground mb-3">Font Size</p>
                  <div className="grid grid-cols-3 gap-2">
                    {(["normal","large","xl"] as const).map((s) => (
                      <button
                        key={s}
                        onClick={() => setFontSize(s)}
                        className={cn(
                          "py-2 rounded-xl border text-sm font-medium transition-all",
                          fontSize === s ? "border-primary bg-primary/10 text-primary" : "border-border text-foreground-muted"
                        )}
                      >
                        {s === "normal" ? "Normal" : s === "large" ? "Large" : "Extra Large"}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-foreground-muted mt-2">Larger sizes improve readability for elders</p>
                </div>
              </div>
            )}

            {/* NOTIFICATIONS */}
            {activeTab === "notifications" && (
              <div className="bg-background-secondary rounded-2xl p-5 border border-border space-y-1">
                <h2 className="font-semibold text-foreground mb-4">Notification Preferences</h2>
                {([
                  { key: "streak", label: "Streak Reminders", desc: "Get reminded to keep your streak alive" },
                  { key: "newContent", label: "New Content", desc: "When communities upload new stories or songs" },
                  { key: "community", label: "Community Updates", desc: "Submission approvals and moderator actions" },
                  { key: "achievements", label: "Achievements", desc: "When you earn a new badge or milestone" },
                  { key: "email", label: "Email Digest", desc: "Weekly summary of your progress" },
                ] as const).map((item) => (
                  <div key={item.key} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                    <div>
                      <p className="text-sm font-medium text-foreground">{item.label}</p>
                      <p className="text-xs text-foreground-muted">{item.desc}</p>
                    </div>
                    <Toggle
                      checked={notifs[item.key]}
                      onChange={(v) => setNotifs(n => ({ ...n, [item.key]: v }))}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* PRIVACY */}
            {activeTab === "privacy" && (
              <div className="bg-background-secondary rounded-2xl p-5 border border-border space-y-1">
                <h2 className="font-semibold text-foreground mb-4">Privacy Settings</h2>
                {([
                  { key: "publicProfile", label: "Public Profile", desc: "Allow others to view your profile" },
                  { key: "showAchievements", label: "Show Achievements", desc: "Display badges on your profile" },
                  { key: "shareProgress", label: "Share Progress", desc: "Show learning progress on leaderboard" },
                ] as const).map((item) => (
                  <div key={item.key} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                    <div>
                      <p className="text-sm font-medium text-foreground">{item.label}</p>
                      <p className="text-xs text-foreground-muted">{item.desc}</p>
                    </div>
                    <Toggle
                      checked={privacy[item.key]}
                      onChange={(v) => setPrivacy(p => ({ ...p, [item.key]: v }))}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* ACCOUNT */}
            {activeTab === "account" && (
              <div className="space-y-4">
                <div className="bg-background-secondary rounded-2xl p-5 border border-border space-y-4">
                  <h2 className="font-semibold text-foreground">Change Password</h2>
                  {["Current Password", "New Password", "Confirm New Password"].map((label) => (
                    <div key={label}>
                      <label className="text-xs font-medium text-foreground-muted block mb-1.5">{label}</label>
                      <input type="password" className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-primary" />
                    </div>
                  ))}
                  <button className="w-full py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-hover transition-colors">
                    Update Password
                  </button>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl p-5 border border-red-200 dark:border-red-800 space-y-3">
                  <h2 className="font-semibold text-red-700 dark:text-red-400">Danger Zone</h2>
                  <p className="text-sm text-red-600 dark:text-red-400">Deleting your account is permanent. All your progress and data will be lost.</p>
                  <button className="px-4 py-2 border border-red-400 text-red-600 dark:text-red-400 rounded-xl text-sm font-medium hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors">
                    Delete Account
                  </button>
                </div>
              </div>
            )}

            {/* Save button */}
            {activeTab !== "account" && (
              <button
                onClick={save}
                className={cn(
                  "w-full py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2",
                  saved ? "bg-green-500 text-white" : "bg-primary text-white hover:bg-primary-hover"
                )}
              >
                {saved ? <><Check className="w-4 h-4" /> Saved!</> : "Save Changes"}
              </button>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
