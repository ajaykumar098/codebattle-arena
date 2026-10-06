import type { HTMLAttributes } from "react";
import { forwardRef } from "react";
import { cn } from "./utils";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "easy" | "medium" | "hard" | "success" | "error" | "neutral" | "accent";
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(({ className, variant = "accent", ...props }, ref) => {
  const variants = {
    easy: "bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/30",
    medium: "bg-[#f59e0b]/10 text-[#f59e0b] border border-[#f59e0b]/30",
    hard: "bg-[#f43f5e]/10 text-[#f43f5e] border border-[#f43f5e]/30",
    success: "bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/30",
    error: "bg-[#f43f5e]/10 text-[#f43f5e] border border-[#f43f5e]/30",
    neutral: "bg-[#8b5cf6]/10 text-[#8b5cf6] border border-[#8b5cf6]/30",
    accent: "bg-[#f59e0b]/10 text-[#f59e0b] border border-[#f59e0b]/30",
  };

  return (
    <span
      ref={ref}
      className={cn(
        "inline-flex items-center px-2 py-1 text-xs font-medium rounded-[var(--radius-sm)] font-mono",
        variants[variant],
        className
      )}
      {...props}
    />
  );
});

Badge.displayName = "Badge";

export default Badge;
