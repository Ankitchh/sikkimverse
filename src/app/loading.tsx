import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
        </div>
        <div className="text-center">
          <p className="font-semibold text-foreground">Loading…</p>
          <p className="text-sm text-foreground-muted mt-1">SIKKIMVERSE</p>
        </div>
      </div>
    </div>
  );
}
