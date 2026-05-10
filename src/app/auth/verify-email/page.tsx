"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Clock, Loader2, Mountain } from "lucide-react";
import Link from "next/link";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const success = searchParams.get("success") === "1";
  const error = searchParams.get("error");

  const errorMessages: Record<string, string> = {
    "missing-token": "No verification token found. Please use the link from your email.",
    invalid: "Invalid verification link. Please request a new one.",
    expired: "Verification link has expired. Please request a new one from your settings.",
    server: "Something went wrong. Please try again.",
  };

  const errorMessage = error ? (errorMessages[error] ?? "Verification failed.") : null;

  return (
    <div className="text-center">
      {success ? (
        <>
          <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-emerald-600" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Email verified!</h1>
          <p className="text-foreground-secondary mb-2">
            Your email address has been verified. You've earned <strong>25 bonus XP</strong>.
          </p>
          <p className="text-sm text-foreground-muted mb-8">
            Your account is fully set up and ready.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 bg-primary text-white font-bold px-6 py-3 rounded-xl hover:bg-primary-hover transition-all"
          >
            Go to dashboard
          </Link>
        </>
      ) : errorMessage ? (
        <>
          <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Verification failed</h1>
          <p className="text-foreground-secondary mb-8">{errorMessage}</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/auth/signin"
              className="inline-flex items-center gap-2 bg-primary text-white font-bold px-6 py-3 rounded-xl hover:bg-primary-hover transition-all"
            >
              Sign in
            </Link>
            <Link
              href="/settings"
              className="inline-flex items-center gap-2 border border-border text-foreground font-semibold px-6 py-3 rounded-xl hover:border-primary hover:text-primary transition-all"
            >
              Resend verification
            </Link>
          </div>
        </>
      ) : (
        <>
          <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <Clock className="w-10 h-10 text-blue-500" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Check your email</h1>
          <p className="text-foreground-secondary mb-2">
            We've sent a verification link to your email address.
          </p>
          <p className="text-sm text-foreground-muted mb-8">
            Click the link in the email to verify your account. The link expires in 24 hours.
          </p>
          <Link
            href="/dashboard"
            className="text-primary font-semibold hover:underline"
          >
            Continue to dashboard
          </Link>
        </>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="flex items-center justify-center gap-3 mb-10">
          <div className="w-10 h-10 gradient-cultural rounded-xl flex items-center justify-center">
            <Mountain className="w-5 h-5 text-white" />
          </div>
          <p className="text-xl font-black text-foreground">SIKKIMVERSE</p>
        </div>
        <Suspense fallback={
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          </div>
        }>
          <VerifyEmailContent />
        </Suspense>
      </motion.div>
    </div>
  );
}
