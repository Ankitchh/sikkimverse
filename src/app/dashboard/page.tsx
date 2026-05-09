"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

// Role → dashboard route mapping
const ROLE_ROUTES: Record<string, string> = {
  ADMIN:               "/dashboard/admin",
  SUPER_ADMIN:         "/dashboard/admin",
  GOVERNMENT_OFFICER:  "/dashboard/government",
  COMMUNITY_PRESIDENT: "/dashboard/community",
  MODERATOR:           "/dashboard/moderator",
  CONTRIBUTOR:         "/dashboard/contributor",
  PUBLIC_USER:         "/learn",
};

// Simulated session hook — replace with next-auth's useSession when fully wired
function useRoleFromSession(): { role: string | null; loading: boolean } {
  // In production this reads from the JWT session. For now we default to PUBLIC_USER.
  return { role: "PUBLIC_USER", loading: false };
}

export default function DashboardIndex() {
  const router = useRouter();
  const { role, loading } = useRoleFromSession();

  useEffect(() => {
    if (loading || !role) return;
    const dest = ROLE_ROUTES[role] ?? "/learn";
    router.replace(dest);
  }, [role, loading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-4"
      >
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
        </div>
        <div className="text-center">
          <p className="font-semibold text-foreground">Loading your dashboard…</p>
          <p className="text-sm text-foreground-muted mt-1">Redirecting based on your role</p>
        </div>
      </motion.div>
    </div>
  );
}
