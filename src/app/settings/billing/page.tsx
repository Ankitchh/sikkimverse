"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  CreditCard, CheckCircle2, AlertCircle, Loader2, Zap, Calendar,
  TrendingUp, Shield, Crown, XCircle, RefreshCw, Mountain,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface Plan {
  id: string;
  name: string;
  slug: string;
  description: string;
  priceInr: string;
  interval: string;
  trialDays: number;
  features: Record<string, unknown>;
  gatewayPlanId: string | null;
}

interface Subscription {
  id: string;
  status: string;
  statusLabel: string;
  statusColor: string;
  plan: { name: string; priceInr: string; interval: string; features: Record<string, unknown> };
  trialEnd: string | null;
  currentPeriodEnd: string;
  daysRemaining: number;
  cancelAt: string | null;
  canceledAt: string | null;
  payments: Array<{ id: string; amount: string; currency: string; status: string; createdAt: string }>;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-IN", { dateStyle: "long" });
}

function formatAmount(amount: string, currency = "INR"): string {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency, minimumFractionDigits: 0 }).format(
    Number(amount)
  );
}

function PlanCard({ plan, onSelect, isLoading, disabled }: {
  plan: Plan;
  onSelect: (id: string) => void;
  isLoading: boolean;
  disabled: boolean;
}) {
  const feats = plan.features as Record<string, unknown>;
  const monthlyPrice = plan.interval === "ANNUAL"
    ? (Number(plan.priceInr) / 12).toFixed(0)
    : plan.priceInr;
  const savings = plan.interval === "ANNUAL"
    ? `Save ₹${(199 * 12 - Number(plan.priceInr)).toFixed(0)}`
    : null;

  return (
    <div className={cn(
      "relative rounded-2xl border-2 p-6 transition-all",
      plan.slug === "heritage-annual"
        ? "border-primary bg-primary/5"
        : "border-border bg-background-secondary"
    )}>
      {plan.slug === "heritage-annual" && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full">
          BEST VALUE
        </div>
      )}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-bold text-foreground">{plan.name}</h3>
          {savings && <span className="text-xs text-emerald-600 font-medium">{savings} vs monthly</span>}
        </div>
        <div className="text-right">
          <p className="text-2xl font-black text-foreground">₹{monthlyPrice}</p>
          <p className="text-xs text-foreground-muted">/month{plan.interval === "ANNUAL" ? " billed annually" : ""}</p>
        </div>
      </div>
      <p className="text-sm text-foreground-secondary mb-4">{plan.description}</p>
      <ul className="space-y-1.5 mb-5">
        {[
          feats.aiTutor && "AI cultural tutor",
          feats.aiSearch && "Semantic search",
          feats.voicePractice && "Voice pronunciation practice",
          feats.writingPractice && "Script writing practice",
          feats.downloads && "Offline downloads",
          feats.badge && `Badge: ${feats.badge}`,
          feats.annualBonus && String(feats.annualBonus),
        ].filter(Boolean).map((f) => (
          <li key={String(f)} className="flex items-center gap-2 text-sm text-foreground-secondary">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            {String(f)}
          </li>
        ))}
      </ul>
      <p className="text-xs text-foreground-muted mb-3 text-center">
        🌿 45% goes directly to indigenous communities
      </p>
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={() => onSelect(plan.id)}
        disabled={disabled || isLoading}
        className={cn(
          "w-full py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-60 flex items-center justify-center gap-2",
          plan.slug === "heritage-annual"
            ? "bg-primary text-white hover:bg-primary-hover"
            : "bg-background border border-border text-foreground hover:border-primary hover:text-primary"
        )}
      >
        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
        Start {plan.trialDays}-day free trial
      </motion.button>
    </div>
  );
}

export default function BillingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [plans, setPlans] = useState<Plan[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [selectingPlan, setSelectingPlan] = useState<string | null>(null);
  const [canceling, setCanceling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/auth/signin?callbackUrl=/settings/billing");
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    Promise.all([
      fetch("/api/subscriptions/plans").then((r) => r.json() as Promise<{ plans: Plan[] }>),
      fetch("/api/subscriptions/status").then((r) => r.json() as Promise<{ subscription: Subscription | null; isActive: boolean }>),
    ])
      .then(([planData, subData]) => {
        setPlans(planData.plans ?? []);
        setSubscription(subData.subscription);
        setIsActive(subData.isActive);
      })
      .finally(() => setPageLoading(false));
  }, [status]);

  const handleSelectPlan = async (planId: string) => {
    setSelectingPlan(planId);
    setError(null);
    try {
      const res = await fetch("/api/subscriptions/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });
      const data = await res.json() as { error?: string; devMode?: boolean; gatewaySubId?: string };

      if (!res.ok) {
        setError(data.error ?? "Failed to start subscription.");
        return;
      }

      if (data.devMode) {
        // Dev mode — subscription created locally
        router.refresh();
        window.location.reload();
        return;
      }

      // Production: open Razorpay checkout
      if (data.gatewaySubId && typeof window !== "undefined") {
        const rzpKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
        if (!rzpKey) {
          setError("Payment gateway not configured. Contact support.");
          return;
        }
        // Dynamically load Razorpay script
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => {
          const rzp = new (window as unknown as { Razorpay: new (opts: unknown) => { open: () => void } }).Razorpay({
            key: rzpKey,
            subscription_id: data.gatewaySubId,
            name: "SIKKIMVERSE",
            description: "Indigenous Heritage Platform",
            handler: () => {
              window.location.href = "/settings/billing?success=1";
            },
            prefill: { email: session?.user?.email ?? "" },
            theme: { color: "#1a5c3a" },
          });
          rzp.open();
        };
        document.body.appendChild(script);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSelectingPlan(null);
    }
  };

  const handleCancel = async () => {
    if (!confirm("Cancel at end of current period? You'll keep access until then.")) return;
    setCanceling(true);
    setError(null);
    try {
      const res = await fetch("/api/subscriptions/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ immediately: false }),
      });
      const data = await res.json() as { error?: string; cancelAt?: string };
      if (!res.ok) { setError(data.error ?? "Failed to cancel."); return; }
      window.location.reload();
    } catch {
      setError("Network error.");
    } finally {
      setCanceling(false);
    }
  };

  if (pageLoading || status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link href="/dashboard" className="flex items-center gap-2 text-foreground-muted hover:text-foreground transition-colors">
            <Mountain className="w-5 h-5" />
          </Link>
          <span className="text-foreground-muted">/</span>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Billing & Subscription</h1>
            <p className="text-sm text-foreground-secondary">Manage your plan and payment history</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 flex items-start gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Current Subscription */}
        {subscription && (
          <div className="mb-8 rounded-2xl border border-border bg-background-secondary p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Crown className="w-5 h-5 text-primary" />
                  <h2 className="font-bold text-foreground">{subscription.plan.name}</h2>
                </div>
                <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full", subscription.statusColor)}>
                  {subscription.statusLabel}
                </span>
              </div>
              <p className="text-2xl font-black text-foreground">
                {formatAmount(subscription.plan.priceInr)}
                <span className="text-sm font-normal text-foreground-muted">
                  /{subscription.plan.interval === "ANNUAL" ? "yr" : "mo"}
                </span>
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              {subscription.trialEnd && subscription.status === "TRIALING" && (
                <div className="flex items-center gap-2 text-sm text-foreground-secondary">
                  <Zap className="w-4 h-4 text-blue-500" />
                  Trial ends: {formatDate(subscription.trialEnd)}
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-foreground-secondary">
                <Calendar className="w-4 h-4 text-primary" />
                {subscription.cancelAt
                  ? `Access until: ${formatDate(subscription.cancelAt)}`
                  : `Renews: ${formatDate(subscription.currentPeriodEnd)}`
                }
              </div>
              <div className="flex items-center gap-2 text-sm text-foreground-secondary">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                {subscription.daysRemaining} days remaining
              </div>
              <div className="flex items-center gap-2 text-sm text-foreground-secondary">
                <Shield className="w-4 h-4 text-amber-500" />
                45% to communities
              </div>
            </div>

            {isActive && !subscription.cancelAt && (
              <button
                onClick={handleCancel}
                disabled={canceling}
                className="flex items-center gap-2 text-sm text-foreground-muted hover:text-red-600 transition-colors disabled:opacity-50"
              >
                {canceling ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                Cancel subscription
              </button>
            )}

            {/* Payment history */}
            {subscription.payments.length > 0 && (
              <div className="mt-4 border-t border-border pt-4">
                <h3 className="text-sm font-semibold text-foreground mb-2">Recent payments</h3>
                <div className="space-y-2">
                  {subscription.payments.map((p) => (
                    <div key={p.id} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-foreground-muted" />
                        <span className="text-foreground-secondary">{formatDate(p.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground">{formatAmount(p.amount, p.currency)}</span>
                        <span className={cn(
                          "text-xs px-1.5 py-0.5 rounded",
                          p.status === "paid" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                        )}>
                          {p.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Plans */}
        {(!isActive || subscription?.cancelAt) && (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-bold text-foreground mb-1">
                {subscription?.cancelAt ? "Reactivate your subscription" : "Choose a plan"}
              </h2>
              <p className="text-foreground-secondary text-sm">
                All plans include a {plans[0]?.trialDays ?? 7}-day free trial. Cancel anytime.
              </p>
            </div>

            {plans.length === 0 ? (
              <div className="text-center py-12 text-foreground-muted">
                <RefreshCw className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No plans available. Run <code>npx tsx prisma/seed.ts</code> to create plans.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {plans.map((plan) => (
                  <PlanCard
                    key={plan.id}
                    plan={plan}
                    onSelect={handleSelectPlan}
                    isLoading={selectingPlan === plan.id}
                    disabled={!!selectingPlan || canceling}
                  />
                ))}
              </div>
            )}

            <div className="mt-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
              <p className="text-sm text-emerald-800 dark:text-emerald-300 font-medium">
                🌿 45% of every subscription goes directly to Sikkim's indigenous communities.
              </p>
              <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-1">
                Your membership funds cultural preservation, language archival, and community contributors.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
