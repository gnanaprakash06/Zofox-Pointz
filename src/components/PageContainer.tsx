// components/PageContainer.tsx (or .jsx)
// import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface PageContainerProps {
  children: ReactNode;
  className?: string; // To accept extra class names
}

const PageContainer = ({ children, className }: PageContainerProps) => {
  return (
    // Using the <main> element for better accessibility and semantics.
    // It should contain the unique content of the document.
    <div
      className={cn(
        // Base styles: min-height, full width, padding
        "mt-4 min-h-0 w-full flex-1",
        // Additional classes passed by the consumer
        className
      )}
    >
      {children}
    </div>
  );
};

export default PageContainer;
