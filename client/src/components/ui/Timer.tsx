import { cn } from "./utils";

interface TimerProps {
  seconds: number;
  className?: string;
}

export default function Timer({ seconds, className }: TimerProps) {
  const formatTime = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
    const s = (totalSeconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const getColor = () => {
    if (seconds > 60) return "text-[#10b981]";
    if (seconds > 30) return "text-[#f59e0b]";
    return "text-[#f43f5e]";
  };

  return (
    <div className={cn("font-mono text-2xl font-semibold tabular-nums", getColor(), className)} aria-live="polite">
      {formatTime(seconds)}
    </div>
  );
}
