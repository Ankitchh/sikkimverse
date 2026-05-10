import { Mountain, ArrowLeft, BookOpen, Globe } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md text-center">
        <div className="flex items-center justify-center gap-3 mb-10">
          <div className="w-10 h-10 gradient-cultural rounded-xl flex items-center justify-center">
            <Mountain className="w-5 h-5 text-white" />
          </div>
          <p className="text-xl font-black text-foreground">SIKKIMVERSE</p>
        </div>

        <div className="bg-background-secondary rounded-2xl border border-border p-8">
          {/* Lepcha character as decorative 404 */}
          <div className="text-8xl font-serif text-foreground/10 select-none mb-2" aria-hidden="true">
            ᰀᰂᰋ
          </div>
          <p className="text-5xl font-black text-foreground mb-3">404</p>
          <h1 className="text-xl font-bold text-foreground mb-2">Page not found</h1>
          <p className="text-foreground-secondary text-sm mb-8">
            This page doesn&apos;t exist or has been moved. Explore our community archives instead.
          </p>

          <div className="flex flex-col gap-3">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 bg-primary text-white font-bold px-6 py-3 rounded-xl hover:bg-primary/90 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/learn"
                className="flex items-center justify-center gap-2 border border-border text-foreground text-sm font-semibold px-4 py-2.5 rounded-xl hover:border-primary hover:text-primary transition-all"
              >
                <BookOpen className="w-4 h-4" /> Learn
              </Link>
              <Link
                href="/communities"
                className="flex items-center justify-center gap-2 border border-border text-foreground text-sm font-semibold px-4 py-2.5 rounded-xl hover:border-primary hover:text-primary transition-all"
              >
                <Globe className="w-4 h-4" /> Communities
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
