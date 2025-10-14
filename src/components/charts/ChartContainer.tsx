import type { ReactNode } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { TimeRangeSelector } from "../TimeRangeSelector";

interface ChartContainerProps {
  title: string;
  description?: string;
  children: ReactNode;
  timeRange?: number;
  onTimeRangeChange?: (hours: number) => void;
}

export function ChartContainer({
  title,
  description,
  children,
  timeRange,
  onTimeRangeChange,
}: ChartContainerProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="text-lg">{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          {timeRange !== undefined && onTimeRangeChange && (
            <div className="flex-shrink-0">
              <TimeRangeSelector
                value={timeRange}
                onChange={onTimeRangeChange}
              />
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {/* 确保内容区域有固定的最小高度，防止 CLS */}
        <div className="min-h-[300px]">{children}</div>
      </CardContent>
    </Card>
  );
}
