import { useState, useRef, useEffect } from "react";
import { cn } from "./utils";

interface SplitPaneProps {
  left: React.ReactNode;
  right: React.ReactNode;
  defaultLeftWidth?: number;
  minLeftWidth?: number;
  minRightWidth?: number;
  className?: string;
}

export default function SplitPane({
  left,
  right,
  defaultLeftWidth = 40,
  minLeftWidth = 30,
  minRightWidth = 30,
  className,
}: SplitPaneProps) {
  const [leftWidth, setLeftWidth] = useState(defaultLeftWidth);
  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current || !isResizing) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const newLeftWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;

      if (newLeftWidth >= minLeftWidth && newLeftWidth <= 100 - minRightWidth) {
        setLeftWidth(newLeftWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing, minLeftWidth, minRightWidth]);

  return (
    <div ref={containerRef} className={cn("flex h-full", className)}>
      <div style={{ width: `${leftWidth}%` }} className="min-w-0">
        {left}
      </div>
      <div
        className="w-1 bg-[#6b7280] cursor-col-resize hover:bg-[#f59e0b] transition-colors"
        onMouseDown={() => setIsResizing(true)}
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize panels"
      />
      <div style={{ width: `${100 - leftWidth}%` }} className="min-w-0">
        {right}
      </div>
    </div>
  );
}
