import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { BarChart3 } from "lucide-react";
import { formatBytes } from "@/lib/utils";

interface NetworkStatsCardProps {
  totalUpload: number;
  totalDownload: number;
}

export function NetworkStatsCard({
  totalUpload,
  totalDownload,
}: NetworkStatsCardProps) {
  const total = totalUpload + totalDownload;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">网络流量统计</CardTitle>
        <BarChart3 className="h-5 w-5 text-primary" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formatBytes(total)}</div>
        <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
          <div>
            <p>累计上传</p>
            <p className="font-medium text-foreground">
              {formatBytes(totalUpload)}
            </p>
          </div>
          <div>
            <p>累计下载</p>
            <p className="font-medium text-foreground">
              {formatBytes(totalDownload)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
