import { useMemo } from "react";
import { cn } from "./utils";

type ConnectionStatus = "connected" | "connecting" | "disconnected";

interface ConnectionIndicatorProps {
  className?: string;
}

export default function ConnectionIndicator({ className }: ConnectionIndicatorProps) {
  // In a real app, this would check Socket.io connection status
  // For now, we'll simulate it or check localStorage
  const token = localStorage.getItem("token");
  const status: ConnectionStatus = token ? "connected" : "disconnected";

  const statusConfig = useMemo(() => ({
    connected: {
      color: "bg-[#10b981]",
      label: "LIVE",
      pulse: false,
    },
    connecting: {
      color: "bg-[#f59e0b]",
      label: "CONNECTING",
      pulse: true,
    },
    disconnected: {
      color: "bg-[#f43f5e]",
      label: "OFFLINE",
      pulse: false,
    },
  }), []);

  const config = statusConfig[status];

  return (
    <div className={cn("flex items-center gap-2", className)} aria-live="polite">
      <div
        className={cn(
          "h-2 w-2 rounded-full",
          config.color,
          config.pulse && "animate-pulse"
        )}
        aria-hidden="true"
      />
      <span className="text-xs font-mono font-medium text-[#f59e0b] uppercase tracking-wider">
        {config.label}
      </span>
    </div>
  );
}
