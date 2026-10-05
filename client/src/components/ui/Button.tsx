import type { ButtonHTMLAttributes } from "react";
import { forwardRef } from "react";
import { cn } from "./utils";
import { Loader2 } from "lucide-react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, disabled, children, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none disabled:opacity-50 disabled:pointer-events-none";

    const variants = {
      primary: "bg-[#f59e0b] text-[#0a0a0a] hover:bg-[#eab308]",
      secondary: "border border-[#6b7280] text-[#e5e5e5] hover:bg-[#1a1a1a]",
      ghost: "text-[#e5e5e5] hover:bg-[#1a1a1a]",
      danger: "bg-[#f43f5e] text-[#0a0a0a] hover:bg-[#e11d48]",
    };

    const sizes = {
      sm: "h-9 px-3 text-sm",
      md: "h-11 px-4 text-sm",
      lg: "h-[52px] px-6 text-base",
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
