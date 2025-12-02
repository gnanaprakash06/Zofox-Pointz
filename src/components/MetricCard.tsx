import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { MetricCardProps } from "@/types/types";
import { Progress } from "./ui/progress";

const MetricCard = ({
  title,
  value,
  iconLeft,
  iconRight,
  valueDescription,
  trend,
  progress,
  className = "",
  testId,
}: MetricCardProps) => (
  <Card className={cn("w-2xs max-w-xs", className)} data-testid={testId}>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle
        className={cn(
          "flex w-full items-center gap-1 text-sm font-medium",
          iconRight ? "justify-between" : "justify-start"
        )}
      >
        {iconLeft && <span className="mr-1">{iconLeft}</span>}
        {title}
        {iconRight && <span className="mr-1">{iconRight}</span>}
      </CardTitle>
    </CardHeader>
    <CardContent>
      {value && <div className="text-2xl font-bold">{value}</div>}

      {valueDescription && (
        <div className="text-muted-foreground mt-1 text-sm">
          {valueDescription}
        </div>
      )}

      {trend && (
        <p
          className={cn(
            "mt-1 flex items-center text-xs",
            trend.color && "text-green-500"
          )}
        >
          {trend.icon && <span className="mr-1">{trend.icon}</span>}
          {trend.value}
          {trend.description && (
            <span className="text-muted-foreground ml-1">
              {trend.description}
            </span>
          )}
        </p>
      )}

      {progress && (
        <div className="mt-2">
          <Progress value={progress.value} max={100} />
          {progress.label && (
            <div className="text-muted-foreground mt-1 text-xs">
              {progress.label}
            </div>
          )}
        </div>
      )}
    </CardContent>
  </Card>
);

export default MetricCard;
