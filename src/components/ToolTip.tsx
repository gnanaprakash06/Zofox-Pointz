import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type TooltipTextProps = {
  /** The main text to display */
  text: string;
  /** Trim text after specific characters (JS-based truncation) */
  maxChars?: number;
  /** Enable CSS truncate for overflow (requires fixed width container) */
  truncate?: boolean;
  /** Tooltip placement */
  tooltipPlacement?: "top" | "right" | "bottom" | "left";
  /** Extra classes for styling */
  className?: string;
};

/**
 * TooltipText Component
 * - Shows text that can be truncated with optional tooltip.
 * - Automatically disables tooltip when text isn't truncated.
 */
export const TooltipText: React.FC<TooltipTextProps> = ({
  text,
  maxChars,
  truncate = false,
  tooltipPlacement = "top",
  className,
}) => {
  const isJsTruncated = maxChars && text.length > maxChars;
  const displayText = isJsTruncated ? text.slice(0, maxChars) + "..." : text;

  const [isOverflowed, setIsOverflowed] = React.useState(false);
  const textRef = React.useRef<HTMLSpanElement>(null);

  // Detect overflow when using CSS truncate
  React.useEffect(() => {
    if (truncate && textRef.current) {
      const el = textRef.current;
      setIsOverflowed(el.scrollWidth > el.clientWidth);
    }
  }, [text, truncate]);

  const shouldShowTooltip = isJsTruncated || (truncate && isOverflowed);

  const textElement = (
    <span
      ref={textRef}
      className={cn(truncate && "truncate", "inline-block", className)}
      title={!shouldShowTooltip ? text : undefined} // fallback title
    >
      {displayText}
    </span>
  );

  if (!shouldShowTooltip) return textElement;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{textElement}</TooltipTrigger>
        <TooltipContent side={tooltipPlacement}>
          <p className="max-w-xs break-words">{text}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
