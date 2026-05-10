"use client";

import { useState, Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signIn } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye, EyeOff, Mail, Lock, AlertCircle, Loader2, ArrowRight, Mountain, Zap,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const signInSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});
type SignInFormValues = z.infer<typeof signInSchema>;

// Demo accounts shown on the login page for presentations / testing
const DEMO_ACCOUNTS = [
  { label: "Admin", emoji: "👑", email: "admin@sikkimverse.com", password: "Admin@123", color: "from-purple-600 to-indigo-600" },
  { label: "Contributor", emoji: "🎤", email: "contributor@sikkimverse.com", password: "Contributor@123", color: "from-emerald-600 to-teal-600" },
];

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

function CulturalPattern() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 gradient-cultural opacity-90" />
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/30" />
      <motion.div animate={{ scale: [1, 1.1, 1], opacity: [0.15, 0.25, 0.15] }} transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }} className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-white/10" />
      <motion.div animate={{ scale: [1, 1.05, 1], opacity: [0.1, 0.2, 0.1] }} transition={{ repeat: Infinity, duration: 8, ease: "easeInOut", delay: 2 }} className="absolute -bottom-20 -right-20 w-96 h-96 rounded-full bg-white/10" />
      <div className="absolute top-1/4 left-8 text-white/10 text-8xl font-serif select-none">ᰀ</div>
      <div className="absolute top-1/2 left-12 text-white/10 text-6xl font-serif select-none">ᰂ</div>
      <div className="absolute bottom-1/4 left-6 text-white/10 text-7xl font-serif select-none">ᰋ</div>
      <div className="absolute top-16 right-8 text-white/10 text-7xl font-serif select-none">ᰏ</div>
      <div className="absolute bottom-20 right-10 text-white/10 text-8xl font-serif select-none">ᰅ</div>
    </div>
  );
}

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
  });

  const onSubmit = async (data: SignInFormValues) => {
    setIsLoading(true);
    setServerError(null);
    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });
      if (result?.error) {
        setServerError("Invalid email or password. Please try again.");
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      setServerError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setServerError(null);
    await signIn("google", { callbackUrl });
  };

  const handleDemoLogin = async (email: string, password: string, label: string) => {
    setDemoLoading(label);
    setServerError(null);
    try {
      const result = await signIn("credentials", { email, password, redirect: false });
      if (result?.error) {
        setServerError("Demo login failed. Please run the seed script first.");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setServerError("Demo login failed.");
    } finally {
      setDemoLoading(null);
    }
  };

  const registered = searchParams.get("registered") === "1";

  return (
    <div className="min-h-screen flex">
      {/* Left — Cultural Panel */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 relative items-center justify-center">
        <CulturalPattern />
        <div className="relative z-10 text-center text-white px-12 max-w-md">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: "easeOut" }}>
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
                <Mountain className="w-7 h-7 text-white" />
              </div>
              <div className="text-left">
                <p className="text-2xl font-black tracking-tight">SIKKIMVERSE</p>
                <p className="text-white/70 text-sm">Indigenous Heritage Platform</p>
              </div>
            </div>
            <h2 className="text-4xl font-bold leading-tight mb-4">Your journey into Sikkim's heritage begins here</h2>
            <p className="text-white/75 text-lg leading-relaxed">Learn endangered languages, contribute cultural knowledge, and help preserve the voices of Sikkim's indigenous communities.</p>
            <div className="mt-10 grid grid-cols-3 gap-4">
              {[{ value: "10", label: "Communities" }, { value: "50K+", label: "Learners" }, { value: "200K+", label: "Words Archived" }].map(({ value, label }) => (
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
      <div className="w-full lg:w-1/2 xl:w-2/5 flex items-center justify-center bg-background px-6 py-12 overflow-y-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-10 h-10 gradient-cultural rounded-xl flex items-center justify-center">
              <Mountain className="w-5 h-5 text-white" />
            </div>
            <p className="text-xl font-black text-foreground">SIKKIMVERSE</p>
          </div>

          <div className="mb-6">
            <h1 className="text-3xl font-bold text-foreground">Welcome back</h1>
            <p className="text-foreground-secondary mt-1">Sign in to continue your language journey</p>
          </div>

          {/* Registration success banner */}
          {registered && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mb-5 flex items-center gap-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4">
              <span className="text-emerald-500 text-lg">✓</span>
              <p className="text-sm text-emerald-700 dark:text-emerald-400 font-medium">Account created! Sign in below.</p>
            </motion.div>
          )}

          {/* Error */}
          <AnimatePresence>
            {serverError && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mb-5 overflow-hidden">
                <div className="flex items-start gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                  <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700 dark:text-red-400">{serverError}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Quick Demo Login ─────────────────────────────────── */}
          <div className="mb-6 rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-primary">Quick Demo Login</span>
              <span className="text-xs text-foreground-muted ml-auto">For testing &amp; demos</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {DEMO_ACCOUNTS.map((acc) => (
                <motion.button
                  key={acc.label}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleDemoLogin(acc.email, acc.password, acc.label)}
                  disabled={!!demoLoading || isLoading}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2.5 rounded-xl text-white text-sm font-semibold",
                    "bg-gradient-to-r transition-opacity disabled:opacity-60",
                    acc.color
                  )}
                >
                  {demoLoading === acc.label ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <span>{acc.emoji}</span>
                  )}
                  {acc.label}
                </motion.button>
              ))}
            </div>
            <p className="text-[10px] text-foreground-muted mt-2 text-center">
              Run <code className="bg-background-secondary px-1 rounded text-foreground">npx tsx prisma/seed.ts</code> to create demo accounts
            </p>
          </div>

          {/* Google Sign In */}
          <motion.button
            whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading || isLoading || !!demoLoading}
            className="w-full flex items-center justify-center gap-3 py-3.5 border-2 border-border rounded-xl font-semibold text-foreground hover:bg-background-secondary hover:border-primary/30 transition-all disabled:opacity-60"
          >
            {isGoogleLoading ? <Loader2 className="w-5 h-5 animate-spin text-foreground-muted" /> : <GoogleIcon />}
            Continue with Google
          </motion.button>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
            <div className="relative flex justify-center">
              <span className="bg-background px-3 text-xs text-foreground-muted font-medium uppercase tracking-wider">or sign in with email</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-foreground mb-1.5">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-foreground-muted" />
                <input
                  id="email" type="email" autoComplete="email"
                  {...register("email")}
                  placeholder="you@example.com"
                  className={cn(
                    "w-full pl-10 pr-4 py-3 bg-background-secondary border rounded-xl text-foreground placeholder:text-foreground-muted outline-none transition-all text-sm",
                    errors.email ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100" : "border-border focus:border-primary focus:ring-2 focus:ring-primary/20"
                  )}
                />
              </div>
              {errors.email && <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="text-sm font-semibold text-foreground">Password</label>
                <Link href="/auth/forgot-password" className="text-xs text-primary font-medium hover:underline">Forgot password?</Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-foreground-muted" />
                <input
                  id="password" type={showPassword ? "text" : "password"} autoComplete="current-password"
                  {...register("password")}
                  placeholder="••••••••"
                  className={cn(
                    "w-full pl-10 pr-12 py-3 bg-background-secondary border rounded-xl text-foreground placeholder:text-foreground-muted outline-none transition-all text-sm",
                    errors.password ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100" : "border-border focus:border-primary focus:ring-2 focus:ring-primary/20"
                  )}
                />
                <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-foreground-muted hover:text-foreground transition-colors p-0.5" aria-label={showPassword ? "Hide password" : "Show password"}>
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{errors.password.message}</p>}
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              whileHover={!isLoading ? { scale: 1.01 } : {}} whileTap={!isLoading ? { scale: 0.99 } : {}}
              disabled={isLoading || isGoogleLoading || !!demoLoading}
              className="w-full py-3.5 bg-primary text-white font-bold rounded-xl hover:bg-primary-hover transition-all disabled:opacity-60 flex items-center justify-center gap-2 text-base"
            >
              {isLoading ? <><Loader2 className="w-5 h-5 animate-spin" />Signing in...</> : <>Sign In<ArrowRight className="w-5 h-5" /></>}
            </motion.button>
          </form>

          <p className="mt-6 text-center text-sm text-foreground-secondary">
            Don&apos;t have an account?{" "}
            <Link href="/auth/signup" className="font-semibold text-primary hover:underline">Create a free account</Link>
          </p>

          <div className="mt-6 pt-5 border-t border-border text-center">
            <p className="text-xs text-foreground-muted italic">&ldquo;Your journey into Sikkim&apos;s heritage begins here&rdquo;</p>
            <div className="flex items-center justify-center gap-1.5 mt-2 flex-wrap">
              {["🌿 Lepcha", "🏔️ Bhutia", "🎋 Limbu", "🐎 Tamang", "+6 more"].map((c, i, a) => (
                <span key={c} className="flex items-center gap-1.5">
                  <span className="text-xs text-foreground-muted">{c}</span>
                  {i < a.length - 1 && <span className="text-foreground-muted text-xs">·</span>}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <SignInForm />
    </Suspense>
  );
}
