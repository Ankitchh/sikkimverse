"use client";

import { useState, useEffect, Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, Eye, EyeOff, Loader2, CheckCircle2, AlertCircle, Mountain, XCircle } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const schema = z.object({
  password: z
    .string()
    .min(8, "At least 8 characters")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Must include uppercase, lowercase, and a number"),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});
type FormValues = z.infer<typeof schema>;

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (!token) {
      setTokenValid(false);
      setTokenError("No reset token found. Please request a new password reset link.");
      return;
    }
    fetch(`/api/auth/reset-password?token=${token}`)
      .then((r) => r.json() as Promise<{ valid: boolean; reason?: string }>)
      .then((data) => {
        setTokenValid(data.valid);
        if (!data.valid) setTokenError(data.reason ?? "Invalid or expired reset link.");
      })
      .catch(() => {
        setTokenValid(false);
        setTokenError("Failed to verify reset link.");
      });
  }, [token]);

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    setServerError(null);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password: data.password }),
      });
      const json = await res.json() as { error?: string };
      if (!res.ok) {
        setServerError(json.error ?? "Failed to reset password.");
        return;
      }
      setSuccess(true);
      setTimeout(() => router.push("/auth/signin"), 3000);
    } catch {
      setServerError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (tokenValid === null) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <XCircle className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2">Reset link invalid</h2>
        <p className="text-foreground-secondary text-sm mb-6">{tokenError}</p>
        <Link href="/auth/forgot-password" className="text-primary font-semibold hover:underline">
          Request a new reset link
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8 text-emerald-600" />
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2">Password reset!</h2>
        <p className="text-foreground-secondary text-sm">Redirecting you to sign in...</p>
      </div>
    );
  }

  return (
    <>
      <h1 className="text-3xl font-bold text-foreground mb-2">Set new password</h1>
      <p className="text-foreground-secondary mb-6">Choose a strong password for your account.</p>

      {serverError && (
        <div className="mb-4 flex items-start gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <p className="text-sm text-red-700 dark:text-red-400">{serverError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {(["password", "confirmPassword"] as const).map((field) => (
          <div key={field}>
            <label htmlFor={field} className="block text-sm font-semibold text-foreground mb-1.5">
              {field === "password" ? "New password" : "Confirm password"}
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-foreground-muted" />
              <input
                id={field}
                type={(field === "password" ? showPassword : showConfirm) ? "text" : "password"}
                {...register(field)}
                placeholder="••••••••"
                className={cn(
                  "w-full pl-10 pr-12 py-3 bg-background-secondary border rounded-xl text-foreground placeholder:text-foreground-muted outline-none transition-all text-sm",
                  errors[field]
                    ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                    : "border-border focus:border-primary focus:ring-2 focus:ring-primary/20"
                )}
              />
              <button
                type="button"
                onClick={() => field === "password" ? setShowPassword((v) => !v) : setShowConfirm((v) => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-foreground-muted hover:text-foreground transition-colors"
              >
                {(field === "password" ? showPassword : showConfirm) ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {errors[field] && (
              <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />{errors[field]?.message}
              </p>
            )}
          </div>
        ))}

        <motion.button
          type="submit"
          whileTap={!isLoading ? { scale: 0.99 } : {}}
          disabled={isLoading}
          className="w-full py-3.5 bg-primary text-white font-bold rounded-xl hover:bg-primary-hover transition-all disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {isLoading ? <><Loader2 className="w-5 h-5 animate-spin" />Resetting...</> : "Reset password"}
        </motion.button>
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 gradient-cultural rounded-xl flex items-center justify-center">
            <Mountain className="w-5 h-5 text-white" />
          </div>
          <p className="text-xl font-black text-foreground">SIKKIMVERSE</p>
        </div>
        <Suspense fallback={<div className="flex justify-center py-12"><Loader2 className="w-6 h-6 text-primary animate-spin" /></div>}>
          <ResetPasswordForm />
        </Suspense>
      </motion.div>
    </div>
  );
}
