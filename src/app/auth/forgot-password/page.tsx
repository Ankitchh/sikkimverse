"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, ArrowLeft, Loader2, CheckCircle2, AlertCircle, Mountain } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const schema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
});
type FormValues = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sentEmail, setSentEmail] = useState("");

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    setServerError(null);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email }),
      });
      const json = await res.json() as { error?: string };
      if (!res.ok) {
        setServerError(json.error ?? "Something went wrong. Please try again.");
        return;
      }
      setSentEmail(data.email);
      setSent(true);
    } catch {
      setServerError("Network error. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 gradient-cultural rounded-xl flex items-center justify-center">
            <Mountain className="w-5 h-5 text-white" />
          </div>
          <p className="text-xl font-black text-foreground">SIKKIMVERSE</p>
        </div>

        <AnimatePresence mode="wait">
          {sent ? (
            <motion.div
              key="sent"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-2">Check your email</h1>
              <p className="text-foreground-secondary mb-1">
                If an account exists for <strong>{sentEmail}</strong>, we've sent a password reset link.
              </p>
              <p className="text-sm text-foreground-muted mb-8">
                The link expires in 1 hour. Check your spam folder if you don't see it.
              </p>
              <Link
                href="/auth/signin"
                className="inline-flex items-center gap-2 text-primary font-semibold hover:underline"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to sign in
              </Link>
            </motion.div>
          ) : (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Link
                href="/auth/signin"
                className="inline-flex items-center gap-1.5 text-sm text-foreground-muted hover:text-foreground mb-6 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to sign in
              </Link>

              <h1 className="text-3xl font-bold text-foreground mb-2">Forgot password?</h1>
              <p className="text-foreground-secondary mb-6">
                Enter your email and we'll send you a reset link.
              </p>

              <AnimatePresence>
                {serverError && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-4 flex items-start gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 overflow-hidden"
                  >
                    <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700 dark:text-red-400">{serverError}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-foreground mb-1.5">
                    Email address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-foreground-muted" />
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
                  {errors.email && (
                    <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />{errors.email.message}
                    </p>
                  )}
                </div>

                <motion.button
                  type="submit"
                  whileTap={!isLoading ? { scale: 0.99 } : {}}
                  disabled={isLoading}
                  className="w-full py-3.5 bg-primary text-white font-bold rounded-xl hover:bg-primary-hover transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <><Loader2 className="w-5 h-5 animate-spin" />Sending...</>
                  ) : (
                    "Send reset link"
                  )}
                </motion.button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
