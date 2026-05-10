"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { XCircle, AlertTriangle, Mountain, ArrowLeft, RefreshCw } from "lucide-react";
import Link from "next/link";

const ERROR_MESSAGES: Record<string, { title: string; message: string; action: string; actionHref: string }> = {
  Configuration: {
    title: "Server Configuration Error",
    message: "There is a problem with the server configuration. Please contact support.",
    action: "Go Home",
    actionHref: "/",
  },
  AccessDenied: {
    title: "Access Denied",
    message: "You do not have permission to access this resource.",
    action: "Sign In",
    actionHref: "/auth/signin",
  },
  Verification: {
    title: "Verification Failed",
    message: "The verification link has expired or is invalid. Please request a new one.",
    action: "Request New Link",
    actionHref: "/settings",
  },
  OAuthSignin: {
    title: "Sign In Error",
    message: "An error occurred during sign in with your provider. Please try again.",
    action: "Try Again",
    actionHref: "/auth/signin",
  },
  OAuthCallback: {
    title: "OAuth Callback Error",
    message: "Could not complete sign in. Your account may not be linked correctly.",
    action: "Sign In Again",
    actionHref: "/auth/signin",
  },
  OAuthCreateAccount: {
    title: "Account Creation Failed",
    message: "Could not create your account. Please try signing in with email instead.",
    action: "Sign In with Email",
    actionHref: "/auth/signin",
  },
  EmailCreateAccount: {
    title: "Account Creation Failed",
    message: "Could not create your account with this email address.",
    action: "Try Again",
    actionHref: "/auth/signup",
  },
  Callback: {
    title: "Callback Error",
    message: "An error occurred during the authentication callback.",
    action: "Sign In",
    actionHref: "/auth/signin",
  },
  SessionRequired: {
    title: "Sign In Required",
    message: "You must be signed in to access this page.",
    action: "Sign In",
    actionHref: "/auth/signin",
  },
  Default: {
    title: "Authentication Error",
    message: "An unexpected error occurred during authentication. Please try again.",
    action: "Sign In",
    actionHref: "/auth/signin",
  },
};

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const errorCode = searchParams.get("error") ?? "Default";
  const info = ERROR_MESSAGES[errorCode] ?? ERROR_MESSAGES.Default;

  const isServerError = errorCode === "Configuration";

  return (
    <div className="text-center">
      <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
        isServerError ? "bg-red-100 dark:bg-red-900/30" : "bg-amber-100 dark:bg-amber-900/30"
      }`}>
        {isServerError
          ? <XCircle className="w-10 h-10 text-red-500" />
          : <AlertTriangle className="w-10 h-10 text-amber-500" />
        }
      </div>

      <h1 className="text-2xl font-bold text-foreground mb-2">{info.title}</h1>
      <p className="text-foreground-secondary mb-2">{info.message}</p>

      {errorCode !== "Default" && (
        <p className="text-xs text-foreground-muted mb-8 font-mono bg-background-tertiary inline-block px-3 py-1 rounded-lg">
          Error: {errorCode}
        </p>
      )}
      {errorCode === "Default" && <div className="mb-8" />}

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link
          href={info.actionHref}
          className="inline-flex items-center gap-2 bg-primary text-white font-bold px-6 py-3 rounded-xl hover:bg-primary/90 transition-all"
        >
          <RefreshCw className="w-4 h-4" />
          {info.action}
        </Link>
        <Link
          href="/"
          className="inline-flex items-center gap-2 border border-border text-foreground font-semibold px-6 py-3 rounded-xl hover:border-primary hover:text-primary transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Go Home
        </Link>
      </div>

      <p className="mt-8 text-xs text-foreground-muted">
        Need help?{" "}
        <a href="mailto:support@sikkimverse.com" className="text-primary hover:underline">
          Contact support
        </a>
      </p>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="flex items-center justify-center gap-3 mb-10">
          <div className="w-10 h-10 gradient-cultural rounded-xl flex items-center justify-center">
            <Mountain className="w-5 h-5 text-white" />
          </div>
          <p className="text-xl font-black text-foreground">SIKKIMVERSE</p>
        </div>

        <div className="bg-background-secondary rounded-2xl border border-border p-8">
          <Suspense fallback={
            <div className="text-center py-8">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          }>
            <AuthErrorContent />
          </Suspense>
        </div>
      </motion.div>
    </div>
  );
}
