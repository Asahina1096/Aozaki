import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Activity } from "lucide-react";
import { formatLoad } from "@/lib/utils";

interface AverageLoadCardProps {
  load1: number;
  load5: number;
  load15: number;
}

export function AverageLoadCard({
  load1,
  load5,
  load15,
}: AverageLoadCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">平均负载</CardTitle>
        <Activity className="h-5 w-5 text-primary" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formatLoad(load1)}</div>
        <div className="mt-2 grid grid-cols-3 gap-2 text-xs text-muted-foreground">
          <div>
            <p>1m</p>
            <p className="font-medium text-foreground">{formatLoad(load1)}</p>
          </div>
          <div>
            <p>5m</p>
            <p className="font-medium text-foreground">{formatLoad(load5)}</p>
          </div>
          <div>
            <p>15m</p>
            <p className="font-medium text-foreground">{formatLoad(load15)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
