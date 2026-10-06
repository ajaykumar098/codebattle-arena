import { Link } from "react-router-dom";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4 bg-[#0a0a0a]">
      <div className="text-center">
        <div className="mb-6 flex justify-center">
          <AlertCircle className="h-16 w-16 text-[#f43f5e]" />
        </div>
        <h1 className="mb-2 text-4xl font-semibold text-[#e5e5e5] font-mono">404</h1>
        <p className="mb-8 text-[#a1a1aa]">Page not found</p>
        <Link
          to="/"
          className="inline-flex items-center justify-center h-11 px-4 text-sm font-medium bg-[#f59e0b] text-[#0a0a0a] hover:bg-[#eab308] rounded-[var(--radius-md)] transition-colors"
        >
          Go to Problems
        </Link>
      </div>
    </main>
  );
}
