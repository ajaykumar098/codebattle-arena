import { cn } from "./utils";

interface ConnectionIndicatorProps {
  className?: string;
}

export default function ConnectionIndicator({ className }: ConnectionIndicatorProps) {
  // Check if user is signed in (not live connection)
  const token = localStorage.getItem("token");
  const isSignedIn = !!token;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div
        className={cn(
          "h-2 w-2 rounded-full",
          isSignedIn ? "bg-[#10b981]" : "bg-[#6b7280]"
        )}
        aria-hidden="true"
      />
      <span className="text-xs font-mono font-medium text-[#a1a1aa] uppercase tracking-wider">
        {isSignedIn ? "Signed in" : "Not signed in"}
      </span>
    </div>
  );
}
