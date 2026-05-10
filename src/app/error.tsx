"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, RefreshCw, Home, Mountain } from "lucide-react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[App Error Boundary]", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md text-center"
      >
        <div className="flex items-center justify-center gap-3 mb-10">
          <div className="w-10 h-10 gradient-cultural rounded-xl flex items-center justify-center">
            <Mountain className="w-5 h-5 text-white" />
          </div>
          <p className="text-xl font-black text-foreground">SIKKIMVERSE</p>
        </div>

        <div className="bg-background-secondary rounded-2xl border border-border p-8">
          <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-5">
            <AlertTriangle className="w-8 h-8 text-amber-500" />
          </div>

          <h1 className="text-2xl font-bold text-foreground mb-2">Something went wrong</h1>
          <p className="text-foreground-secondary text-sm mb-1">
            An unexpected error occurred. This has been logged.
          </p>
          {error.digest && (
            <p className="text-xs text-foreground-muted font-mono bg-background-tertiary inline-block px-3 py-1 rounded-lg mb-6">
              Error ID: {error.digest}
            </p>
          )}
          {!error.digest && <div className="mb-6" />}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={reset}
              className="inline-flex items-center justify-center gap-2 bg-primary text-white font-bold px-6 py-3 rounded-xl hover:bg-primary/90 transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 border border-border text-foreground font-semibold px-6 py-3 rounded-xl hover:border-primary hover:text-primary transition-all"
            >
              <Home className="w-4 h-4" />
              Go Home
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
