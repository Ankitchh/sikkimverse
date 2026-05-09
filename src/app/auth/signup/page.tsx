"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, Check, X, ChevronRight, AlertCircle } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const COMMUNITIES = [
  "Lepcha","Bhutia","Limbu","Tamang","Rai","Gurung","Sherpa","Mangar","Newar","Sunwar"
];

function getPasswordStrength(pwd: string): { score: number; label: string; color: string } {
  let score = 0;
  if (pwd.length >= 8)  score++;
  if (pwd.length >= 12) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  if (score <= 1) return { score, label: "Weak", color: "bg-red-500" };
  if (score <= 2) return { score, label: "Fair", color: "bg-amber-500" };
  if (score <= 3) return { score, label: "Good", color: "bg-yellow-400" };
  if (score <= 4) return { score, label: "Strong", color: "bg-emerald-400" };
  return { score, label: "Very Strong", color: "bg-emerald-500" };
}

const REQUIREMENTS = [
  { test: (p: string) => p.length >= 8,       label: "At least 8 characters" },
  { test: (p: string) => /[A-Z]/.test(p),     label: "One uppercase letter" },
  { test: (p: string) => /[0-9]/.test(p),     label: "One number" },
  { test: (p: string) => /[^A-Za-z0-9]/.test(p), label: "One special character" },
];

export default function SignUpPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "", email: "", password: "", confirmPassword: "", communityId: "", role: "PUBLIC_USER",
  });
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const pwdStrength = getPasswordStrength(form.password);
  const passwordsMatch = form.password === form.confirmPassword && form.confirmPassword.length > 0;

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) { setError("Please accept the terms to continue."); return; }
    if (!passwordsMatch) { setError("Passwords do not match."); return; }
    if (pwdStrength.score < 2) { setError("Please choose a stronger password."); return; }

    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password, communityId: form.communityId || undefined, role: form.role }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Registration failed. Please try again."); return; }
      router.push("/auth/signin?registered=1");
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1a5c3a]/20 via-transparent to-[#1e4a8c]/20 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative"
      >
        {/* Card */}
        <div className="bg-background-secondary border border-border rounded-3xl p-8 shadow-xl">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-block">
              <div className="flex items-center justify-center gap-2 mb-3">
                <span className="text-3xl">🏔️</span>
                <span className="text-2xl font-black text-foreground tracking-tight">SIKKIMVERSE</span>
              </div>
            </Link>
            <h1 className="text-xl font-bold text-foreground">Create Your Account</h1>
            <p className="text-sm text-foreground-muted mt-1">Begin your heritage learning journey</p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="flex items-start gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3 mb-4"
            >
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="text-xs font-medium text-foreground-muted block mb-1.5">Full Name</label>
              <input
                required
                type="text"
                value={form.name}
                onChange={set("name")}
                placeholder="Your name"
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            {/* Email */}
            <div>
              <label className="text-xs font-medium text-foreground-muted block mb-1.5">Email Address</label>
              <input
                required
                type="email"
                value={form.email}
                onChange={set("email")}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            {/* Community */}
            <div>
              <label className="text-xs font-medium text-foreground-muted block mb-1.5">Primary Community <span className="text-foreground-muted font-normal">(optional)</span></label>
              <select
                value={form.communityId}
                onChange={set("communityId")}
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:border-primary transition-colors"
              >
                <option value="">Select your community…</option>
                {COMMUNITIES.map(c => <option key={c} value={c.toLowerCase()}>{c}</option>)}
              </select>
            </div>

            {/* Role */}
            <div>
              <label className="text-xs font-medium text-foreground-muted block mb-2">I want to…</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: "PUBLIC_USER", label: "Learn Languages", emoji: "📚" },
                  { value: "CONTRIBUTOR", label: "Contribute Content", emoji: "🎤" },
                ].map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, role: r.value }))}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all",
                      form.role === r.value
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-foreground-muted hover:border-primary/30"
                    )}
                  >
                    <span>{r.emoji}</span>
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-xs font-medium text-foreground-muted block mb-1.5">Password</label>
              <div className="relative">
                <input
                  required
                  type={showPwd ? "text" : "password"}
                  value={form.password}
                  onChange={set("password")}
                  placeholder="Create a strong password"
                  className="w-full px-4 py-3 pr-11 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:border-primary transition-colors"
                />
                <button type="button" onClick={() => setShowPwd(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-muted hover:text-foreground">
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {/* Strength bar */}
              {form.password && (
                <div className="mt-2 space-y-2">
                  <div className="flex gap-1">
                    {[1,2,3,4,5].map(i => (
                      <div key={i} className={cn("h-1 flex-1 rounded-full transition-colors", i <= pwdStrength.score ? pwdStrength.color : "bg-border")} />
                    ))}
                  </div>
                  <p className="text-xs text-foreground-muted">Strength: <span className="font-medium text-foreground">{pwdStrength.label}</span></p>
                  <div className="grid grid-cols-2 gap-1">
                    {REQUIREMENTS.map((r) => (
                      <div key={r.label} className={cn("flex items-center gap-1 text-xs", r.test(form.password) ? "text-emerald-500" : "text-foreground-muted")}>
                        {r.test(form.password) ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                        {r.label}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Confirm password */}
            <div>
              <label className="text-xs font-medium text-foreground-muted block mb-1.5">Confirm Password</label>
              <div className="relative">
                <input
                  required
                  type={showConfirm ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={set("confirmPassword")}
                  placeholder="Repeat your password"
                  className={cn(
                    "w-full px-4 py-3 pr-11 rounded-xl border bg-background text-foreground text-sm focus:outline-none transition-colors",
                    form.confirmPassword
                      ? passwordsMatch ? "border-emerald-500 focus:border-emerald-500" : "border-red-400 focus:border-red-400"
                      : "border-border focus:border-primary"
                  )}
                />
                <button type="button" onClick={() => setShowConfirm(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-muted hover:text-foreground">
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {form.confirmPassword && !passwordsMatch && (
                <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
              )}
            </div>

            {/* Terms */}
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} className="mt-0.5 accent-primary" />
              <span className="text-xs text-foreground-muted leading-relaxed">
                I agree to the{" "}
                <Link href="#" className="text-primary hover:underline">Terms of Service</Link>
                {" "}and{" "}
                <Link href="#" className="text-primary hover:underline">Privacy Policy</Link>.
                I understand that content contributions are moderated.
              </span>
            </label>

            {/* Captcha placeholder */}
            <div className="rounded-xl border border-border bg-background-tertiary p-3 text-center">
              <p className="text-xs text-foreground-muted">🛡️ Cloudflare Turnstile CAPTCHA loads here in production</p>
            </div>

            <button
              type="submit"
              disabled={loading || !agreed}
              className="w-full py-3.5 bg-gradient-to-r from-[#1a5c3a] to-[#1e4a8c] text-white rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <><span>Create Account</span><ChevronRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-foreground-muted mt-6">
            Already have an account?{" "}
            <Link href="/auth/signin" className="text-primary font-semibold hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
