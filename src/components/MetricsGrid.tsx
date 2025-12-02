import { cn } from "@/lib/utils";

interface MetricsGridProps {
  children: React.ReactNode;
  className?: string;
}

function MetricsGrid({ children, className }: MetricsGridProps) {
  return (
    <section
      className={cn(
        "flex flex-wrap items-center justify-evenly gap-6",
        className
      )}
    >
      {children}
    </section>
  );
}

export default MetricsGrid;
