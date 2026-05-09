"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  AlertCircle,
  Loader2,
  ArrowRight,
  Mountain,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

// ── Schema ─────────────────────────────────────────────────────────────────────
const signInSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters"),
});

type SignInFormValues = z.infer<typeof signInSchema>;

// ── Google Icon ────────────────────────────────────────────────────────────────
function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

// ── Decorative background pattern ────────────────────────────────────────────
function CulturalPattern() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Gradient overlays */}
      <div className="absolute inset-0 gradient-cultural opacity-90" />
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/30" />

      {/* Decorative circles */}
      <motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [0.15, 0.25, 0.15] }}
        transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
        className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-white/10"
      />
      <motion.div
        animate={{ scale: [1, 1.05, 1], opacity: [0.1, 0.2, 0.1] }}
        transition={{ repeat: Infinity, duration: 8, ease: "easeInOut", delay: 2 }}
        className="absolute -bottom-20 -right-20 w-96 h-96 rounded-full bg-white/10"
      />

      {/* Cultural symbols (decorative) */}
      <div className="absolute top-1/4 left-8 text-white/10 text-8xl font-serif select-none">ᰀ</div>
      <div className="absolute top-1/2 left-12 text-white/10 text-6xl font-serif select-none">ᰂ</div>
      <div className="absolute bottom-1/4 left-6 text-white/10 text-7xl font-serif select-none">ᰋ</div>
      <div className="absolute top-16 right-8 text-white/10 text-7xl font-serif select-none">ᰏ</div>
      <div className="absolute bottom-20 right-10 text-white/10 text-8xl font-serif select-none">ᰅ</div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function SignInPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: SignInFormValues) => {
    setIsLoading(true);
    setServerError(null);
    try {
      // In production: call signIn from next-auth/react
      await new Promise((r) => setTimeout(r, 1500));
      // Simulate a failed auth for demo
      setServerError("Invalid email or password. Please try again.");
    } catch {
      setServerError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setServerError(null);
    try {
      // In production: signIn("google")
      await new Promise((r) => setTimeout(r, 1500));
    } catch {
      setServerError("Google sign-in failed. Please try again.");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left — Cultural Panel (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 relative items-center justify-center">
        <CulturalPattern />
        <div className="relative z-10 text-center text-white px-12 max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
                <Mountain className="w-7 h-7 text-white" />
              </div>
              <div className="text-left">
                <p className="text-2xl font-black tracking-tight">SIKKIMVERSE</p>
                <p className="text-white/70 text-sm">Indigenous Heritage Platform</p>
              </div>
            </div>

            <h2 className="text-4xl font-bold leading-tight mb-4">
              Your journey into Sikkim's heritage begins here
            </h2>
            <p className="text-white/75 text-lg leading-relaxed">
              Learn endangered languages, contribute cultural knowledge, and help preserve the voices of Sikkim's indigenous communities for future generations.
            </p>

            <div className="mt-10 grid grid-cols-3 gap-4">
              {[
                { value: "10", label: "Communities" },
                { value: "50K+", label: "Learners" },
                { value: "200K+", label: "Words Archived" },
              ].map(({ value, label }) => (
                <div key={label} className="bg-white/10 backdrop-blur rounded-xl p-4">
                  <p className="text-2xl font-black">{value}</p>
                  <p className="text-white/60 text-xs mt-1">{label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right — Sign-in form */}
      <div className="w-full lg:w-1/2 xl:w-2/5 flex items-center justify-center bg-background px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-10 h-10 gradient-cultural rounded-xl flex items-center justify-center">
              <Mountain className="w-5 h-5 text-white" />
            </div>
            <p className="text-xl font-black text-foreground">SIKKIMVERSE</p>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Welcome back</h1>
            <p className="text-foreground-secondary mt-2">
              Sign in to continue your language journey
            </p>
          </div>

          {/* Error */}
          <AnimatePresence>
            {serverError && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-5 overflow-hidden"
              >
                <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
                  <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{serverError}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Google Sign In */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading || isLoading}
            className="w-full flex items-center justify-center gap-3 py-3.5 border-2 border-border rounded-xl font-semibold text-foreground hover:bg-background-secondary hover:border-primary/30 transition-all disabled:opacity-60"
          >
            {isGoogleLoading ? (
              <Loader2 className="w-5 h-5 animate-spin text-foreground-muted" />
            ) : (
              <GoogleIcon />
            )}
            Continue with Google
          </motion.button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-background px-3 text-xs text-foreground-muted font-medium uppercase tracking-wider">
                or sign in with email
              </span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-foreground mb-1.5">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-foreground-muted w-[18px] h-[18px]" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  {...register("email")}
                  placeholder="you@example.com"
                  className={cn(
                    "w-full pl-10 pr-4 py-3 bg-background-secondary border rounded-xl text-foreground placeholder:text-foreground-muted outline-none transition-all text-sm",
                    errors.email
                      ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                      : "border-border focus:border-primary focus:ring-2 focus:ring-primary/20"
                  )}
                />
              </div>
              <AnimatePresence>
                {errors.email && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-1.5 text-xs text-red-600 flex items-center gap-1"
                  >
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.email.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="text-sm font-semibold text-foreground">
                  Password
                </label>
                <Link
                  href="/auth/forgot-password"
                  className="text-xs text-primary font-medium hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-foreground-muted" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  {...register("password")}
                  placeholder="••••••••"
                  className={cn(
                    "w-full pl-10 pr-12 py-3 bg-background-secondary border rounded-xl text-foreground placeholder:text-foreground-muted outline-none transition-all text-sm",
                    errors.password
                      ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                      : "border-border focus:border-primary focus:ring-2 focus:ring-primary/20"
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-foreground-muted hover:text-foreground transition-colors p-0.5"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <AnimatePresence>
                {errors.password && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-1.5 text-xs text-red-600 flex items-center gap-1"
                  >
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.password.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Turnstile CAPTCHA placeholder */}
            <div className="rounded-xl border border-border bg-background-tertiary p-4 text-center">
              <div id="turnstile-container" className="flex items-center justify-center">
                <div className="text-xs text-foreground-muted">
                  {/* Cloudflare Turnstile widget renders here */}
                  {/* In production: <Turnstile siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY} /> */}
                  <div className="flex items-center gap-2 justify-center">
                    <div className="w-5 h-5 rounded bg-[#F48024]/20 flex items-center justify-center">
                      <svg viewBox="0 0 24 24" className="w-3 h-3 fill-[#F48024]"><path d="M12 2L2 7v10l10 5 10-5V7L12 2z"/></svg>
                    </div>
                    <span className="text-foreground-muted text-xs">Security verification · Cloudflare Turnstile</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              whileHover={!isLoading ? { scale: 1.01 } : {}}
              whileTap={!isLoading ? { scale: 0.99 } : {}}
              disabled={isLoading || isGoogleLoading}
              className="w-full py-3.5 bg-primary text-white font-bold rounded-xl hover:bg-primary-hover transition-all disabled:opacity-60 flex items-center justify-center gap-2 text-base"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </motion.button>
          </form>

          {/* Sign up link */}
          <p className="mt-6 text-center text-sm text-foreground-secondary">
            Don&apos;t have an account?{" "}
            <Link href="/auth/signup" className="font-semibold text-primary hover:underline">
              Create a free account
            </Link>
          </p>

          {/* Cultural tagline */}
          <div className="mt-8 pt-6 border-t border-border text-center">
            <p className="text-xs text-foreground-muted italic">
              &ldquo;Your journey into Sikkim&apos;s heritage begins here&rdquo;
            </p>
            <div className="flex items-center justify-center gap-1.5 mt-2">
              <span className="text-xs text-foreground-muted">🌿 Lepcha</span>
              <span className="text-foreground-muted">·</span>
              <span className="text-xs text-foreground-muted">🏔️ Bhutia</span>
              <span className="text-foreground-muted">·</span>
              <span className="text-xs text-foreground-muted">🌄 Limbu</span>
              <span className="text-foreground-muted">·</span>
              <span className="text-xs text-foreground-muted">+7 more</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
