import type { HTMLAttributes } from "react";
import { forwardRef } from "react";
import { cn } from "./utils";

type CardProps = HTMLAttributes<HTMLDivElement>;

const Card = forwardRef<HTMLDivElement, CardProps>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "bg-[#121212] border border-[#6b7280] rounded-[var(--radius-lg)] p-6",
      className
    )}
    {...props}
  />
));

Card.displayName = "Card";

export default Card;
