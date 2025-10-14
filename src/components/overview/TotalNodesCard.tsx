import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Server } from "lucide-react";

interface TotalNodesCardProps {
  total: number;
  online: number;
  offline: number;
}

export function TotalNodesCard({
  total,
  online,
  offline,
}: TotalNodesCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">节点总数 </CardTitle>
        <Server className="h-5 w-5 text-primary" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{total}</div>
        <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
          <Badge variant="success">在线 {online}</Badge>
          <Badge variant="secondary">离线 {offline}</Badge>
        </div>
      </CardContent>
    </Card>
  );
}
