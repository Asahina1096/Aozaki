import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Network } from "lucide-react";
import { formatSpeed } from "@/lib/utils";

interface RealtimeNetworkCardProps {
  upload: number;
  download: number;
}

export function RealtimeNetworkCard({
  upload,
  download,
}: RealtimeNetworkCardProps) {
  const total = upload + download;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">实时网络流量</CardTitle>
        <Network className="h-5 w-5 text-primary" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formatSpeed(total)}</div>
        <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
          <div>
            <p>↑ 上传</p>
            <p className="font-medium text-foreground">{formatSpeed(upload)}</p>
          </div>
          <div>
            <p>↓ 下载</p>
            <p className="font-medium text-foreground">
              {formatSpeed(download)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
