import Link from "next/link";
import { ChefHat, Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="text-center max-w-md">
        <div className="neu-icon-mint w-16 h-16 rounded-2xl mx-auto mb-6">
          <ChefHat className="w-8 h-8 text-[#1A2E35]" />
        </div>
        <p className="text-7xl font-extrabold gradient-text mb-3">404</p>
        <h1 className="text-2xl font-bold mb-2">This plate is empty</h1>
        <p className="text-muted-foreground mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 px-6 py-3 rounded-xl neu-btn-primary text-[#1A2E35] font-semibold text-sm"
          >
            <Home className="w-4 h-4" /> Go Home
          </Link>
          <Link
            href="/outlets"
            className="flex items-center gap-2 px-6 py-3 rounded-xl neu-btn font-semibold text-sm"
          >
            <Search className="w-4 h-4" /> Browse Outlets
          </Link>
        </div>
      </div>
    </main>
  );
}
