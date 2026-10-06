import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { cn } from "./utils";

interface ToastProps {
  message: string;
  type?: "success" | "error" | "info";
  onClose: () => void;
  className?: string;
}

export default function Toast({ message, type = "info", onClose, className }: ToastProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 200); // Wait for fade out
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const typeStyles = {
    success: "border-[#10b981] bg-[#10b981]/10 text-[#10b981]",
    error: "border-[#f43f5e] bg-[#f43f5e]/10 text-[#f43f5e]",
    info: "border-[#6b7280] bg-[#121212] text-[#e5e5e5]",
  };

  return (
    <div
      className={cn(
        "fixed top-4 right-4 z-50 p-4 border rounded-[var(--radius-lg)] shadow-lg transition-opacity duration-200",
        typeStyles[type],
        visible ? "opacity-100" : "opacity-0",
        className
      )}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <p className="text-sm font-medium">{message}</p>
        <button
          onClick={() => {
            setVisible(false);
            setTimeout(onClose, 200);
          }}
          className="p-1 hover:opacity-70 transition-opacity focus-visible:outline-none"
          aria-label="Close toast"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
